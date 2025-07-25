import { IDynamoDbCompetitionsDataAccess } from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/IDynamoDbCompetitionsDataAccess"
import {type GetCommandOutput, PutCommandOutput,} from "@aws-sdk/lib-dynamodb";
import { CompetitionModel } from "@/app/server/models/CompetitionModel";

export class DynamoDbCompetitionsDataAccess implements IDynamoDbCompetitionsDataAccess {

    async getCompetitionData(competitionId: number, season: number): Promise<GetCommandOutput> {
        return CompetitionModel.getCompetitionData(competitionId, season);
    }

    async getCompetitionHelperData(competitionId: number): Promise<GetCommandOutput> {
        return CompetitionModel.getCompetitionHelperData(competitionId);
    }

    async saveMatchScore(competitionId: number, matchDay: number, activeSeason: number, matchId: number, score: { away: number; home: number }, userId: string): Promise<PutCommandOutput> {
        return CompetitionModel.saveMatchScore(competitionId, matchDay, activeSeason, matchId, score, userId);
    }

    async getMatchScoreByUser(userId: string, competitionId: number, season: number, matchDay: number, matchId: number): Promise<GetCommandOutput> {
        return CompetitionModel.getMatchScore(userId, competitionId, season, matchDay, matchId);
    }
}