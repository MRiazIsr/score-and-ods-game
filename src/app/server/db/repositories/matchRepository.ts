import type { Match, MatchStatus, Team } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { MatchdayTab } from "@/app/server/modules/competitions/types";
import { prisma } from "../client";

const STAGE_ORDER: Record<string, number> = {
    PRELIMINARY_ROUND: 100,
    PRELIMINARY_SEMI_FINALS: 110,
    PRELIMINARY_FINAL: 120,
    PLAYOFFS: 130,
    PLAYOFFS_ROUND_1: 140,
    PLAYOFFS_ROUND_2: 150,
    FIRST_ROUND: 160,
    SECOND_ROUND: 170,
    THIRD_ROUND: 180,
    LEAGUE_STAGE: 190,
    LAST_32: 200,
    LAST_16: 210,
    QUARTER_FINALS: 220,
    SEMI_FINALS: 230,
    THIRD_PLACE: 240,
    FINAL: 250,
};

function stageRank(stage: string): number {
    return STAGE_ORDER[stage] ?? 999;
}

export type MatchUpsertInput = {
    id: number;
    competitionId: number;
    seasonId: string;
    matchday?: number | null;
    stage?: string | null;
    homeTeamId: number;
    awayTeamId: number;
    utcDate: Date;
    status: MatchStatus;
    homeScoreFt?: number | null;
    awayScoreFt?: number | null;
    homeScoreHt?: number | null;
    awayScoreHt?: number | null;
    rawData?: Prisma.InputJsonValue | null;
};

const toJsonInput = (v: Prisma.InputJsonValue | null | undefined) =>
    v === null ? Prisma.DbNull : v;

export type MatchWithTeams = Match & { homeTeam: Team; awayTeam: Team };

const LIVE_STATUSES: MatchStatus[] = ["IN_PLAY", "PAUSED"];
const UPCOMING_STATUSES: MatchStatus[] = ["SCHEDULED", "TIMED"];

export const matchRepository = {
    async findById(id: number): Promise<MatchWithTeams | null> {
        return prisma.match.findUnique({
            where: { id },
            include: { homeTeam: true, awayTeam: true },
        });
    },

    async findByCompetitionMatchday(
        competitionId: number,
        seasonId: string,
        matchday: number,
    ): Promise<MatchWithTeams[]> {
        return prisma.match.findMany({
            where: { competitionId, seasonId, matchday },
            include: { homeTeam: true, awayTeam: true },
            orderBy: { utcDate: "asc" },
        });
    },

    async findByCompetitionStage(
        competitionId: number,
        seasonId: string,
        stage: string,
    ): Promise<MatchWithTeams[]> {
        return prisma.match.findMany({
            where: { competitionId, seasonId, stage, matchday: null },
            include: { homeTeam: true, awayTeam: true },
            orderBy: { utcDate: "asc" },
        });
    },

    async findByCompetitionSeason(
        competitionId: number,
        seasonId: string,
    ): Promise<MatchWithTeams[]> {
        return prisma.match.findMany({
            where: { competitionId, seasonId },
            include: { homeTeam: true, awayTeam: true },
            orderBy: { utcDate: "asc" },
        });
    },

    async findUpcoming(limit = 10): Promise<MatchWithTeams[]> {
        return prisma.match.findMany({
            where: {
                status: { in: UPCOMING_STATUSES },
                utcDate: { gte: new Date() },
            },
            include: { homeTeam: true, awayTeam: true },
            orderBy: { utcDate: "asc" },
            take: limit,
        });
    },

    async findLive(): Promise<MatchWithTeams[]> {
        return prisma.match.findMany({
            where: { status: { in: LIVE_STATUSES } },
            include: { homeTeam: true, awayTeam: true },
            orderBy: { utcDate: "asc" },
        });
    },

    async findRecentlyFinished(limit = 5): Promise<MatchWithTeams[]> {
        return prisma.match.findMany({
            where: { status: "FINISHED" },
            include: { homeTeam: true, awayTeam: true },
            orderBy: { utcDate: "desc" },
            take: limit,
        });
    },

    async findRecentByTeam(
        teamId: number,
        competitionIds: number[],
        limit = 5,
    ): Promise<MatchWithTeams[]> {
        return prisma.match.findMany({
            where: {
                status: "FINISHED",
                competitionId: { in: competitionIds },
                OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
            },
            include: { homeTeam: true, awayTeam: true },
            orderBy: { utcDate: "desc" },
            take: limit,
        });
    },

    async upsert(data: MatchUpsertInput): Promise<Match> {
        const now = new Date();
        const { rawData, ...rest } = data;
        const rawDataInput = toJsonInput(rawData);
        return prisma.match.upsert({
            where: { id: data.id },
            create: { ...rest, rawData: rawDataInput, lastSyncedAt: now },
            update: { ...rest, rawData: rawDataInput, lastSyncedAt: now },
        });
    },

    async upsertBatch(matches: MatchUpsertInput[]): Promise<void> {
        if (matches.length === 0) return;
        const now = new Date();
        await prisma.$transaction(
            matches.map((m) => {
                const { rawData, ...rest } = m;
                const rawDataInput = toJsonInput(rawData);
                return prisma.match.upsert({
                    where: { id: m.id },
                    create: { ...rest, rawData: rawDataInput, lastSyncedAt: now },
                    update: { ...rest, rawData: rawDataInput, lastSyncedAt: now },
                });
            }),
        );
    },

    async findFinishedMatchesWithoutScoredPredictions(): Promise<Match[]> {
        // Matches that are FINISHED AND have at least one prediction with NULL points_awarded.
        // Used by fetcher to find what needs scoring.
        return prisma.match.findMany({
            where: {
                status: "FINISHED",
                homeScoreFt: { not: null },
                awayScoreFt: { not: null },
                predictions: { some: { pointsAwarded: null } },
            },
        });
    },

    async getMatchdaysForCompetitionSeason(
        competitionId: number,
        seasonId: string,
    ): Promise<number[]> {
        const rows = await prisma.match.findMany({
            where: { competitionId, seasonId, matchday: { not: null } },
            distinct: ["matchday"],
            select: { matchday: true },
            orderBy: { matchday: "asc" },
        });
        return rows
            .map((r) => r.matchday)
            .filter((d): d is number => d != null);
    },

    async getMatchTabsForCompetitionSeason(
        competitionId: number,
        seasonId: string,
    ): Promise<MatchdayTab[]> {
        const rows = await prisma.match.findMany({
            where: { competitionId, seasonId },
            select: { matchday: true, stage: true },
        });

        const matchdays = new Set<number>();
        const stages = new Set<string>();
        for (const r of rows) {
            if (r.matchday != null) {
                matchdays.add(r.matchday);
            } else if (
                r.stage &&
                r.stage !== "GROUP_STAGE" &&
                r.stage !== "REGULAR_SEASON"
            ) {
                stages.add(r.stage);
            }
        }

        const tabs: MatchdayTab[] = [];
        for (const md of [...matchdays].sort((a, b) => a - b)) {
            tabs.push({ kind: "matchday", matchday: md });
        }
        for (const s of [...stages].sort(
            (a, b) => stageRank(a) - stageRank(b) || a.localeCompare(b),
        )) {
            tabs.push({ kind: "stage", stage: s });
        }
        return tabs;
    },

    async findRecentByTeams(
        teamIds: number[],
        competitionIds: number[],
        limitPerTeam = 5,
    ): Promise<Map<number, MatchWithTeams[]>> {
        const result = new Map<number, MatchWithTeams[]>();
        if (teamIds.length === 0) return result;

        const matches = await prisma.match.findMany({
            where: {
                status: "FINISHED",
                competitionId: { in: competitionIds },
                OR: [
                    { homeTeamId: { in: teamIds } },
                    { awayTeamId: { in: teamIds } },
                ],
            },
            include: { homeTeam: true, awayTeam: true },
            orderBy: { utcDate: "desc" },
        });

        const teamSet = new Set(teamIds);
        for (const id of teamIds) result.set(id, []);

        for (const m of matches) {
            for (const id of [m.homeTeamId, m.awayTeamId]) {
                if (!teamSet.has(id)) continue;
                const list = result.get(id)!;
                if (list.length < limitPerTeam) list.push(m);
            }
        }
        return result;
    },
};
