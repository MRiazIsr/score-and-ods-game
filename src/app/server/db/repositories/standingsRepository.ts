import type { Standing, StandingTableType, Team } from "@prisma/client";
import { prisma } from "../client";

export type StandingUpsertInput = {
    competitionId: number;
    seasonId: string;
    tableType: StandingTableType;
    position: number;
    teamId: number;
    played: number;
    won: number;
    draw: number;
    lost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
};

export type StandingWithTeam = Standing & { team: Team };

export const standingsRepository = {
    async findForCompetitionSeason(
        competitionId: number,
        seasonId: string,
        tableType: StandingTableType = "TOTAL",
    ): Promise<StandingWithTeam[]> {
        return prisma.standing.findMany({
            where: { competitionId, seasonId, tableType },
            include: { team: true },
            orderBy: { position: "asc" },
        });
    },

    /**
     * Replace standings for a (competition, season) with a fresh set from the API.
     * Uses a transaction: delete + createMany. Atomic.
     */
    async replaceForCompetitionSeason(
        competitionId: number,
        seasonId: string,
        rows: StandingUpsertInput[],
    ): Promise<void> {
        const now = new Date();
        await prisma.$transaction([
            prisma.standing.deleteMany({ where: { competitionId, seasonId } }),
            prisma.standing.createMany({
                data: rows.map((r) => ({ ...r, lastSyncedAt: now })),
            }),
        ]);
    },
};
