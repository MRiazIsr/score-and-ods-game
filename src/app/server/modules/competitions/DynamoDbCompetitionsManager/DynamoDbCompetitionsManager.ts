import { IDynamoDbCompetitionsDataAccess } from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/IDynamoDbCompetitionsDataAccess";
import { GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import { Match, Competition } from "@/app/server/modules/competitions/types";

export class DynamoDbCompetitionsManager {

    private dataAccess: IDynamoDbCompetitionsDataAccess;

    constructor(dataAccess: IDynamoDbCompetitionsDataAccess) {
        this.dataAccess = dataAccess;
    }

    public async getActiveDayMatches(competitionId: number, season: number)
    {
        const competitionRawData: GetCommandOutput = await this.dataAccess.getCompetitionData(competitionId, season);
        console.log('TEST1 ', competitionRawData.Item);

        const matches: Match[] = competitionRawData.Item?.rawData?.matches;

        return matches.filter((match: Match) => match.matchday === match.season.currentMatchday);
    }

    public async getActiveSeason(competitionId: number): Promise<number>
    {
        const helperCompetitionData: GetCommandOutput = await this.dataAccess.getCompetitionHelperData(competitionId);
        console.log('ACTIVE_SEASON_DATA', helperCompetitionData.Item);
        return helperCompetitionData.Item?.ActiveSeason;
    }

    public async getCompetitionData(competitionId: number): Promise<Competition[]>
    {
        const helperCompetitionData: GetCommandOutput = await this.dataAccess.getCompetitionHelperData(competitionId);
        console.log(helperCompetitionData);
        return helperCompetitionData.Item?.competitionData;
    }

}