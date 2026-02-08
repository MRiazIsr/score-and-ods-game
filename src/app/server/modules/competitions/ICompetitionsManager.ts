import { Match, Competition, MatchDayWithStatus, ScoreBoardData, PredictedScore } from "@/app/server/modules/competitions/types";

export interface ICompetitionsManager {
    getAllMatchesWithPredictions(competitionId: number, matchDay: number, season: number, userId: string): Promise<Match[]>;
    getActiveSeason(competitionId: number): Promise<number>;
    getCompetitionData(competitionId: number): Promise<Competition>;
    getMatchDaysWithStatus(competitionId: number): Promise<MatchDayWithStatus[]>;
    getMatchScoreByUser(userId: string, competitionId: number, season: number, matchDay: number, matchId: number): Promise<PredictedScore | null>;
    saveMatchScore(competitionId: number, matchDay: number, matchId: number, score: { home: number, away: number }, userId: string): Promise<boolean>;
    getScoreBoardData(competitionId: number): Promise<ScoreBoardData>;
}
