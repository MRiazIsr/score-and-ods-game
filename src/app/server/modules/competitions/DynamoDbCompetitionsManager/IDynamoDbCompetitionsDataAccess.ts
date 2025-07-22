import type { GetCommandOutput } from "@aws-sdk/lib-dynamodb";

export interface IDynamoDbCompetitionsDataAccess {
    getCompetitionData(competitionId: number, season: number): Promise<GetCommandOutput>
    getCompetitionsActiveSeason(competitionId: number): Promise<GetCommandOutput>
}