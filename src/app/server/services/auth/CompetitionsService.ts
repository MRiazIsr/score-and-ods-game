import type { Competition, Match, ScoreBoardData, ScoreBoardEntry } from "@/app/server/modules/competitions/types";
import { competitionRepository } from "@/app/server/db/repositories/competitionRepository";
import { matchRepository } from "@/app/server/db/repositories/matchRepository";
import { predictionRepository } from "@/app/server/db/repositories/predictionRepository";
import { userRepository } from "@/app/server/db/repositories/userRepository";
import { toApiCompetition, toApiMatch } from "@/app/server/services/mappers";
import { calculatePoints, pointsBreakdown } from "@/app/server/services/ScoringService";

export interface TeamFormResult {
    matchId: number;
    utcDate: string;
    opponent: string;
    isHome: boolean;
    result: "W" | "D" | "L";
    scored: number;
    conceded: number;
}

export class CompetitionsService {
    async getCompetitionData(competitionId: number): Promise<Competition> {
        const comp = await competitionRepository.findByIdWithActiveSeason(competitionId);
        if (!comp) {
            throw new Error(`Competition ${competitionId} not found`);
        }
        const matchdays = comp.activeSeason
            ? await matchRepository.getMatchdaysForCompetitionSeason(competitionId, comp.activeSeason.id)
            : [];
        return toApiCompetition(comp, matchdays);
    }

    async getAllCompetitionMatchDays(competitionId: number): Promise<number[]> {
        const comp = await competitionRepository.findByIdWithActiveSeason(competitionId);
        if (!comp || !comp.activeSeason) return [];
        return matchRepository.getMatchdaysForCompetitionSeason(competitionId, comp.activeSeason.id);
    }

    async getCompetitionActiveMatches(
        competitionId: number,
        matchDay: number,
        userId: string,
    ): Promise<Match[]> {
        const comp = await competitionRepository.findByIdWithActiveSeason(competitionId);
        if (!comp || !comp.activeSeason) return [];

        const [dbMatches, predictions] = await Promise.all([
            matchRepository.findByCompetitionMatchday(competitionId, comp.activeSeason.id, matchDay),
            predictionRepository.findByUserAndCompetition(userId, competitionId, comp.activeSeason.id),
        ]);

        const predMap = new Map(predictions.map((p) => [p.matchId, p]));
        const apiComp = toApiCompetition(comp, [matchDay]); // minimal matchdays array for performance

        return dbMatches.map((m) => {
            const pred = predMap.get(m.id);
            return toApiMatch(
                m,
                apiComp,
                comp.activeSeason!,
                pred ? { home: pred.homeScore, away: pred.awayScore, isPredicted: true } : undefined,
            );
        });
    }

    async saveMatchScore(
        competitionId: number,
        matchDay: number,
        matchId: number,
        score: { home: number; away: number },
        userId: string,
    ): Promise<boolean> {
        const match = await matchRepository.findById(matchId);
        if (!match) {
            throw new Error(`Match ${matchId} not found`);
        }
        // Business rule: cannot change prediction after kickoff.
        if (match.utcDate <= new Date()) {
            throw new Error("Match has already started");
        }
        if (match.competitionId !== competitionId) {
            throw new Error("Match does not belong to the given competition");
        }

        await predictionRepository.upsert(userId, matchId, score.home, score.away);
        return true;
    }

    async getScoreBoardData(competitionId: number): Promise<ScoreBoardData> {
        const comp = await competitionRepository.findByIdWithActiveSeason(competitionId);
        if (!comp || !comp.activeSeason) {
            return { competitionId, competitionName: "", entries: [] };
        }

        const [rows, users] = await Promise.all([
            predictionRepository.findScoreboardRows(competitionId, comp.activeSeason.id),
            userRepository.findAllForLeaderboard(),
        ]);

        type Agg = {
            userId: string;
            predictedCount: number;
            predictedDifference: number;
            predictedOutcome: number;
            points: number;
        };
        const agg = new Map<string, Agg>();

        for (const row of rows) {
            const existing = agg.get(row.userId) ?? {
                userId: row.userId,
                predictedCount: 0,
                predictedDifference: 0,
                predictedOutcome: 0,
                points: 0,
            };
            const kind = pointsBreakdown(row.predicted, row.actual);
            if (kind === "exact") existing.predictedCount++;
            else if (kind === "goalDiff") existing.predictedDifference++;
            else if (kind === "outcome") existing.predictedOutcome++;
            // Prefer cached points; fall back to live calc if null.
            existing.points +=
                row.pointsAwarded ?? calculatePoints(row.predicted, row.actual);
            agg.set(row.userId, existing);
        }

        const entries: ScoreBoardEntry[] = [];
        for (const user of users) {
            const a = agg.get(user.id);
            entries.push({
                userId: user.id,
                userName: user.username,
                name: user.name,
                predictedCount: a?.predictedCount ?? 0,
                predictedDifference: a?.predictedDifference ?? 0,
                predictedOutcome: a?.predictedOutcome ?? 0,
                points: a?.points ?? 0,
            });
        }

        entries.sort(
            (a, b) =>
                b.points - a.points ||
                b.predictedCount - a.predictedCount ||
                b.predictedDifference - a.predictedDifference ||
                b.predictedOutcome - a.predictedOutcome,
        );

        return {
            competitionId,
            competitionName: comp.name,
            entries,
        };
    }

    async getRecentMatchResults(
        teamId: number,
        competitionIds: number[],
        limit = 5,
    ): Promise<TeamFormResult[]> {
        const matches = await matchRepository.findRecentByTeam(teamId, competitionIds, limit);
        const out: TeamFormResult[] = [];
        for (const m of matches) {
            const home = m.homeScoreFt;
            const away = m.awayScoreFt;
            if (home === null || away === null) continue;

            const isHome = m.homeTeamId === teamId;
            const scored = isHome ? home : away;
            const conceded = isHome ? away : home;
            const result: "W" | "D" | "L" =
                scored > conceded ? "W" : scored < conceded ? "L" : "D";

            out.push({
                matchId: m.id,
                utcDate: m.utcDate.toISOString(),
                opponent: isHome ? m.awayTeam.name : m.homeTeam.name,
                isHome,
                result,
                scored,
                conceded,
            });
        }
        return out;
    }

    async findMatchById(
        matchId: number,
        competitionIds: number[],
    ): Promise<{ match: Match; season: number } | null> {
        const m = await matchRepository.findById(matchId);
        if (!m) return null;
        if (!competitionIds.includes(m.competitionId)) return null;

        const comp = await competitionRepository.findByIdWithActiveSeason(m.competitionId);
        if (!comp || !comp.activeSeason) return null;

        const apiComp = toApiCompetition(comp, []);
        const apiMatch = toApiMatch(m, apiComp, comp.activeSeason);
        return { match: apiMatch, season: comp.activeSeason.year };
    }
}
