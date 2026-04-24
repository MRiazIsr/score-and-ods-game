import {
    IDynamoDbCompetitionsDataAccess
} from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/IDynamoDbCompetitionsDataAccess";
import {GetCommandOutput} from "@aws-sdk/lib-dynamodb";
import {Competition, Match, ScoreBoardData} from "@/app/server/modules/competitions/types";
import { breakdown, computePoints } from "@/app/server/modules/competitions/scoring";

export class DynamoDbCompetitionsManager {

    private dataAccess: IDynamoDbCompetitionsDataAccess;

    constructor(dataAccess: IDynamoDbCompetitionsDataAccess) {
        this.dataAccess = dataAccess;
    }

    public async getAllMatchesWithPredictions(competitionId: number, matchDay: number, season: number, userId: string): Promise<Match[]>
    {
        const allMatches: Match[] = await this.dataAccess.getAllMatchesBySeason(competitionId, season);
        const now = new Date();
        const filtered = allMatches.filter((match) => match.matchday === matchDay);

        return await Promise.all(
            filtered.map(async (match: Match): Promise<Match> => {
                const matchDate = new Date(match.utcDate);
                match.isStarted = matchDate < now;
                try {
                    const matchScore: GetCommandOutput = await this.getMatchScoreByUser(userId, match.competition.id, season, match.matchday, match.id);

                    match.predictedScore = {
                        home: matchScore.Item?.homeScore ?? 0,
                        away: matchScore.Item?.awayScore ?? 0,
                        isPredicted: !!matchScore.Item,
                    };
                } catch (error) {
                    console.error('Error fetching match score:', error);
                    match.predictedScore = {
                        home: 0,
                        away: 0,
                        isPredicted: false,
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

    public async getCompetitionData(competitionId: number): Promise<Competition>
    {
        const helperCompetitionData: GetCommandOutput = await this.dataAccess.getCompetitionHelperData(competitionId);
        return helperCompetitionData.Item?.competitionData;
    }

    public async getAllMatches(competitionId: number, season: number): Promise<Match[]>
    {
        return this.dataAccess.getAllMatchesBySeason(competitionId, season);
    }

    public async getMatchScoreByUser(userId: string, competitionId: number, season: number, matchDay: number, matchId: number): Promise<GetCommandOutput>
    {
        return await this.dataAccess.getMatchScoreByUser(userId, competitionId, season, matchDay, matchId);
    }

    public async saveMatchScore(competitionId: number, matchDay: number, matchId: number, score: { home: number, away: number }, userId: string): Promise<boolean>
    {
        const activeSeason: number = await this.getActiveSeason(competitionId);
        await this.dataAccess.saveMatchScore(competitionId, matchDay, activeSeason, matchId, score, userId);
        return true;
    }

    async getScoreBoardData(competitionId: number): Promise<ScoreBoardData> {
        try {
            const season = await this.getActiveSeason(competitionId);
            const competitionData = await this.getCompetitionData(competitionId);
            const competitionName = competitionData?.name ?? `Competition ${competitionId}`;

            const allMatches: Match[] = await this.dataAccess.getAllMatchesBySeason(competitionId, season);
            const settledMatches = allMatches.filter((match) =>
                match.status === 'FINISHED' || match.status === 'IN_PLAY'
            );

            const actualByMatchId = new Map<number, { home: number; away: number }>();
            settledMatches.forEach((match) => {
                const home = match.score.fullTime.home;
                const away = match.score.fullTime.away;
                if (home !== null && away !== null) {
                    actualByMatchId.set(match.id, { home, away });
                }
            });

            const usersResponse = await this.dataAccess.getAllUsers();

            if (!usersResponse.Item?.usersData?.length) {
                return { competitionId, competitionName, entries: [] };
            }

            const scoreboardEntries = await Promise.all(
                (usersResponse.Item.usersData as Array<{ userName: string; userId: string }>).map(async (userItem) => {
                    const user = await this.dataAccess.getUserById(userItem.userId);
                    const userId = userItem.userId;
                    const userName = user.Item?.userName || 'Unknown User';
                    const name = user.Item?.name || 'Unknown Name';

                    const predictionsResponse = await this.dataAccess.getUserPredictions(userId, competitionId, season);
                    const items = predictionsResponse.Items ?? [];

                    let totalPoints = 0;
                    let exactScoreCount = 0;
                    let correctDifferenceCount = 0;
                    let correctOutcomeCount = 0;

                    items.forEach((prediction) => {
                        const matchIdMatch = (prediction.SortKey as string).match(/MATCH#(\d+)$/);
                        if (!matchIdMatch) return;

                        const matchId = parseInt(matchIdMatch[1], 10);
                        const actual = actualByMatchId.get(matchId);
                        if (!actual) return;

                        const predicted = { home: prediction.homeScore, away: prediction.awayScore };
                        const points = computePoints(predicted, actual);
                        totalPoints += points;

                        const kind = breakdown(predicted, actual);
                        if (kind === 'exact') exactScoreCount++;
                        else if (kind === 'goalDiff') correctDifferenceCount++;
                        else if (kind === 'outcome') correctOutcomeCount++;
                    });

                    return {
                        userId,
                        userName,
                        name,
                        predictedCount: exactScoreCount,
                        predictedDifference: correctDifferenceCount,
                        predictedOutcome: correctOutcomeCount,
                        points: totalPoints,
                    };
                })
            );

            scoreboardEntries.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.predictedCount !== a.predictedCount) return b.predictedCount - a.predictedCount;
                if (b.predictedDifference !== a.predictedDifference) return b.predictedDifference - a.predictedDifference;
                return b.predictedOutcome - a.predictedOutcome;
            });

            return { competitionId, competitionName, entries: scoreboardEntries };
        } catch (error) {
            console.error('Error calculating scoreboard data:', error);
            throw error;
        }
    }
}
