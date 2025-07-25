import type {GetCommandOutput, PutCommandOutput} from "@aws-sdk/lib-dynamodb";

export interface IDynamoDbCompetitionsDataAccess {
    getCompetitionData(competitionId: number, season: number): Promise<GetCommandOutput>
    getCompetitionHelperData(competitionId: number): Promise<GetCommandOutput>
    saveMatchScore(competitionId: number, matchDay: number , activeSeason: number, matchId: number, score: { home: number, away: number }, userId: string): Promise<PutCommandOutput>
    getMatchScoreByUser(userId: string, competitionId: number, season: number, matchDay: number, matchId: number): Promise<GetCommandOutput>
}