import type {GetCommandOutput, PutCommandOutput, QueryCommandOutput} from "@aws-sdk/lib-dynamodb";
import type { Match } from "@/app/server/modules/competitions/types";

export interface IDynamoDbCompetitionsDataAccess {
    getCompetitionData(competitionId: number, season: number): Promise<GetCommandOutput>
    getAllMatchesBySeason(competitionId: number, season: number): Promise<Match[]>
    getCompetitionHelperData(competitionId: number): Promise<GetCommandOutput>
    saveMatchScore(competitionId: number, matchDay: number , activeSeason: number, matchId: number, score: { home: number, away: number }, userId: string): Promise<PutCommandOutput>
    getMatchScoreByUser(userId: string, competitionId: number, season: number, matchDay: number, matchId: number): Promise<GetCommandOutput>
    getAllUsers(): Promise<GetCommandOutput>
    getUserPredictions(userId: string, competitionId: number, season: number): Promise<QueryCommandOutput>
    getUserById(userId: string): Promise<GetCommandOutput>
}