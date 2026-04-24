import type { UserPrediction } from "@prisma/client";
import { prisma } from "../client";
import { calculatePoints } from "@/app/server/services/ScoringService";

export type PredictionWithMatch = UserPrediction & {
    match: { utcDate: Date; status: string };
};

export const predictionRepository = {
    async upsert(
        userId: string,
        matchId: number,
        homeScore: number,
        awayScore: number,
    ): Promise<UserPrediction> {
        return prisma.userPrediction.upsert({
            where: { userId_matchId: { userId, matchId } },
            create: {
                userId,
                matchId,
                homeScore,
                awayScore,
                pointsAwarded: null,
            },
            update: { homeScore, awayScore },
        });
    },

    async findByUserAndMatch(
        userId: string,
        matchId: number,
    ): Promise<UserPrediction | null> {
        return prisma.userPrediction.findUnique({
            where: { userId_matchId: { userId, matchId } },
        });
    },

    async findAllByUser(userId: string): Promise<UserPrediction[]> {
        return prisma.userPrediction.findMany({ where: { userId } });
    },

    async findByMatch(matchId: number): Promise<UserPrediction[]> {
        return prisma.userPrediction.findMany({ where: { matchId } });
    },

    async findByUserAndCompetition(
        userId: string,
        competitionId: number,
        seasonId: string,
    ): Promise<PredictionWithMatch[]> {
        return prisma.userPrediction.findMany({
            where: {
                userId,
                match: { competitionId, seasonId },
            },
            include: { match: { select: { utcDate: true, status: true } } },
        });
    },

    async findVisibleUsersPredictionsForMatch(matchId: number): Promise<UserPrediction[]> {
        return prisma.userPrediction.findMany({
            where: {
                matchId,
                user: { isDeleted: false, isBanned: false },
            },
        });
    },

    /**
     * Total points across all finished matches for a user.
     * Dashboard widget.
     */
    async getTotalPoints(userId: string): Promise<number> {
        const agg = await prisma.userPrediction.aggregate({
            _sum: { pointsAwarded: true },
            where: { userId },
        });
        return agg._sum.pointsAwarded ?? 0;
    },

    /**
     * Points earned on matches whose utc_date falls inside [start, end).
     * Dashboard widget (current ISO week).
     */
    async getPointsInRange(
        userId: string,
        start: Date,
        end: Date,
    ): Promise<number> {
        const agg = await prisma.userPrediction.aggregate({
            _sum: { pointsAwarded: true },
            where: {
                userId,
                match: { utcDate: { gte: start, lt: end } },
            },
        });
        return agg._sum.pointsAwarded ?? 0;
    },

    /**
     * Recent scored predictions for a user, newest first.
     * Used to compute streak and hit-rate on Dashboard.
     */
    async getRecentScoredForUser(
        userId: string,
        limit = 25,
    ): Promise<PredictionWithMatch[]> {
        return prisma.userPrediction.findMany({
            where: {
                userId,
                pointsAwarded: { not: null },
                match: { status: "FINISHED" },
            },
            include: { match: { select: { utcDate: true, status: true } } },
            orderBy: { match: { utcDate: "desc" } },
            take: limit,
        });
    },

    /**
     * Scoreboard rows: (userId, username, totals + breakdowns) for a competition.
     * Computed on-the-fly for correctness; `points_awarded` is already cached.
     * Breakdowns (exact/goalDiff/outcome) computed via ScoringService.breakdown from
     * predicted+actual scores since we store only pointsAwarded.
     */
    async findScoreboardRows(
        competitionId: number,
        seasonId: string,
    ): Promise<
        Array<{
            userId: string;
            predicted: { home: number; away: number };
            actual: { home: number; away: number };
            pointsAwarded: number | null;
        }>
    > {
        const rows = await prisma.userPrediction.findMany({
            where: {
                match: {
                    competitionId,
                    seasonId,
                    status: "FINISHED",
                    homeScoreFt: { not: null },
                    awayScoreFt: { not: null },
                },
                user: { isDeleted: false, isBanned: false },
            },
            include: {
                match: {
                    select: { homeScoreFt: true, awayScoreFt: true },
                },
            },
        });
        return rows.map((r) => ({
            userId: r.userId,
            predicted: { home: r.homeScore, away: r.awayScore },
            actual: { home: r.match.homeScoreFt!, away: r.match.awayScoreFt!  },
            pointsAwarded: r.pointsAwarded,
        }));
    },

    /**
     * After a match becomes FINISHED, compute points for every prediction where
     * points_awarded IS NULL and apply as a batched transaction.
     *
     * Returns count of updated rows.
     */
    async awardPointsForFinishedMatch(
        matchId: number,
        actualHome: number,
        actualAway: number,
    ): Promise<number> {
        const pending = await prisma.userPrediction.findMany({
            where: { matchId, pointsAwarded: null },
            select: { id: true, homeScore: true, awayScore: true },
        });
        if (pending.length === 0) return 0;

        await prisma.$transaction(
            pending.map((p) =>
                prisma.userPrediction.update({
                    where: { id: p.id },
                    data: {
                        pointsAwarded: calculatePoints(
                            { home: p.homeScore, away: p.awayScore },
                            { home: actualHome, away: actualAway },
                        ),
                    },
                }),
            ),
        );
        return pending.length;
    },

    /**
     * Reset cached points for a match (e.g. scoring rule change).
     * Next fetcher run will re-award.
     */
    async clearPointsForMatch(matchId: number): Promise<number> {
        const r = await prisma.userPrediction.updateMany({
            where: { matchId },
            data: { pointsAwarded: null },
        });
        return r.count;
    },
};
