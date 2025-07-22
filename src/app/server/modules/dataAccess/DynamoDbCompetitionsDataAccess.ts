import { IDynamoDbCompetitionsDataAccess } from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/IDynamoDbCompetitionsDataAccess"
import {type GetCommandOutput, } from "@aws-sdk/lib-dynamodb";
import { CompetitionModel } from "@/app/server/models/CompetitionModel";


export class DynamoDbCompetitionsDataAccess implements IDynamoDbCompetitionsDataAccess {

    async getCompetitionData(competitionId: number, season: number): Promise<GetCommandOutput> {
        return CompetitionModel.getCompetitionData(competitionId, season);
    }

    async getCompetitionsActiveSeason(competitionId: number): Promise<GetCommandOutput> {
        return CompetitionModel.getCompetitionsActiveSeason(competitionId);
    }
}