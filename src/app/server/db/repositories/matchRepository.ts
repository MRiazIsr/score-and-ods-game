import type { Match, MatchStatus, Team } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../client";

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
};
