import type { GetCommandOutput } from "@aws-sdk/lib-dynamodb";

export interface IDynamoDbCompetitionsDataAccess {
    getCompetitionData(competitionId: number, season: number): Promise<GetCommandOutput>
    getCompetitionHelperData(competitionId: number): Promise<GetCommandOutput>
}