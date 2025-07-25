import {
    IDynamoDbCompetitionsDataAccess
} from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/IDynamoDbCompetitionsDataAccess";
import {GetCommandOutput, PutCommandOutput} from "@aws-sdk/lib-dynamodb";
import {Competition, Match} from "@/app/server/modules/competitions/types";

export class DynamoDbCompetitionsManager {

    private dataAccess: IDynamoDbCompetitionsDataAccess;

    constructor(dataAccess: IDynamoDbCompetitionsDataAccess) {
        this.dataAccess = dataAccess;
    }

    public async getActiveDayMatches(competitionId: number, season: number, userId: string)
    {
        const competitionRawData: GetCommandOutput = await this.dataAccess.getCompetitionData(competitionId, season);

        const matches: Match[] = competitionRawData.Item?.rawData?.matches;

        // Фильтруем матчи сначала
        const filteredMatches = matches.filter((match: Match) => {
            if (match.competition.type === 'CUP' && match.stage !== 'LEAGUE_STAGE') {
                return match.status === 'TIMED'
            }
            return match.matchday === match.season.currentMatchday && match.status === 'TIMED';
        });

        return await Promise.all(
            filteredMatches.map(async (match: Match) => {
                try {
                    const matchScore: GetCommandOutput = await this.getMatchScoreByUser(
                        userId,
                        match.competition.id,
                        season,
                        match.matchday,
                        match.id
                    );

                    match.predictedScore = {
                        home: matchScore.Item?.homeScore ?? 0,
                        away: matchScore.Item?.awayScore ?? 0,
                    };
                } catch (error) {
                    console.error('Error fetching match score:', error);
                    match.predictedScore = {
                        home: 0,
                        away: 0,
                    };
                }

                return match;
            })
        );
    }


    public async getActiveSeason(competitionId: number): Promise<number>
    {
        const helperCompetitionData: GetCommandOutput = await this.dataAccess.getCompetitionHelperData(competitionId);
        return helperCompetitionData.Item?.ActiveSeason;
    }

    public async getCompetitionData(competitionId: number): Promise<Competition[]>
    {
        const helperCompetitionData: GetCommandOutput = await this.dataAccess.getCompetitionHelperData(competitionId);
        console.log(helperCompetitionData);
        return helperCompetitionData.Item?.competitionData;
    }

    public async getMatchScoreByUser(userId: string, competitionId: number, season: number, matchDay: number, matchId: number): Promise<GetCommandOutput>
    {
        return await this.dataAccess.getMatchScoreByUser(userId, competitionId, season, matchDay, matchId);
    }

    public async saveMatchScore(competitionId: number, matchDay: number, matchId: number, score: { home: number, away: number }, userId: string): Promise<boolean>
    {
        const activeSeason: number = await this.getActiveSeason(competitionId);
        const saveResult: PutCommandOutput = await this.dataAccess.saveMatchScore(competitionId, matchDay, activeSeason, matchId, score, userId);

        console.log(saveResult);

        return true;
    }

}