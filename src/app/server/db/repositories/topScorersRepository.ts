import type { Player, Team, TopScorer } from "@prisma/client";
import { prisma } from "../client";

export type TopScorerUpsertInput = {
    competitionId: number;
    seasonId: string;
    teamId: number;
    playerId: number;
    goals: number;
    assists?: number | null;
    penalties?: number | null;
    playedMatches?: number | null;
};

export type TopScorerWithRelations = TopScorer & {
    player: Player;
    team: Team;
};

export const topScorersRepository = {
    async findForCompetitionSeason(
        competitionId: number,
        seasonId: string,
        limit?: number,
    ): Promise<TopScorerWithRelations[]> {
        return prisma.topScorer.findMany({
            where: { competitionId, seasonId },
            include: { player: true, team: true },
            orderBy: { goals: "desc" },
            take: limit,
        });
    },

    /**
     * Replace top_scorers for (competition, season). Assumes players+teams are
     * already upserted before this is called.
     */
    async replaceForCompetitionSeason(
        competitionId: number,
        seasonId: string,
        rows: TopScorerUpsertInput[],
    ): Promise<void> {
        const now = new Date();
        await prisma.$transaction([
            prisma.topScorer.deleteMany({ where: { competitionId, seasonId } }),
            prisma.topScorer.createMany({
                data: rows.map((r) => ({ ...r, lastSyncedAt: now })),
            }),
        ]);
    },
};
