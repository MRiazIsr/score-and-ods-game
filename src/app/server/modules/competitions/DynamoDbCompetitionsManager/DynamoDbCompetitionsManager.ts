import {
    IDynamoDbCompetitionsDataAccess
} from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/IDynamoDbCompetitionsDataAccess";
import {GetCommandOutput} from "@aws-sdk/lib-dynamodb";
import {Match} from "@/app/server/modules/competitions/types";

export class DynamoDbCompetitionsManager {

    private dataAccess: IDynamoDbCompetitionsDataAccess;

    constructor(dataAccess: IDynamoDbCompetitionsDataAccess) {
        this.dataAccess = dataAccess;
    }

    public async getActiveDayMatches(competitionId: number, season: number) {
        const competitionRawData: GetCommandOutput = await this.dataAccess.getCompetitionData(competitionId, season);

        const matches: Match[] = competitionRawData.Item?.matches;
        return matches.filter((match: Match) => match.matchday === match.season.currentMatchday);
    }

    public async getActiveSeason(competitionId: number): Promise<number> {
        const helperCompetitionData: GetCommandOutput = await this.dataAccess.getCompetitionsActiveSeason(competitionId);

        return helperCompetitionData.Item?.activeSeason;
    }

}