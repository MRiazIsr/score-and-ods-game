import {
    IDynamoDbCompetitionsDataAccess
} from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/IDynamoDbCompetitionsDataAccess";
import {GetCommandOutput, PutCommandOutput} from "@aws-sdk/lib-dynamodb";
import {Competition, Match, MatchResult, ScoreBoardData} from "@/app/server/modules/competitions/types";

export class DynamoDbCompetitionsManager {

    private dataAccess: IDynamoDbCompetitionsDataAccess;

    constructor(dataAccess: IDynamoDbCompetitionsDataAccess) {
        this.dataAccess = dataAccess;
    }

    public async getActiveDayMatches(competitionId: number, season: number, userId: string)
    {
        const competitionRawData: GetCommandOutput = await this.dataAccess.getCompetitionData(competitionId, season);
        const now = new Date();
        const matches: Match[] = competitionRawData.Item?.rawData?.matches;

        // Фильтруем матчи сначала
        const filteredMatches = matches.filter((match: Match) => {
            if (match.competition.type === 'CUP' && match.stage !== 'LEAGUE_STAGE') {
                return match.status === 'TIMED'
            }
            return match.matchday === match.season.currentMatchday;
        });

        return await Promise.all(
            filteredMatches.map(async (match: Match): Promise<Match> => {
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

    public async getCompetitionData(competitionId: number): Promise<Competition[]>
    {
        const helperCompetitionData: GetCommandOutput = await this.dataAccess.getCompetitionHelperData(competitionId);
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

        return true;
    }



    async getScoreBoardData(competitionId: number): Promise<ScoreBoardData> {
        try {
            const season = await this.getActiveSeason(competitionId);
            const competitionData = await this.getCompetitionData(competitionId);
            const competitionName = competitionData.length > 0 ? competitionData[0].name : `Competition ${competitionId}`;

            // Получаем все завершенные матчи для данной компетиции
            const matchesResponse = await this.dataAccess.getCompetitionData(competitionId, season);
            if (!matchesResponse.Item?.rawData) {
                return {
                    competitionId,
                    competitionName,
                    entries: []
                };
            }

            const matchesData = matchesResponse.Item.rawData;
            const finishedMatches = matchesData.matches.filter((match: Match) =>
                match.status === 'FINISHED' || match.status === 'IN_PLAY'
            );

            console.log('FINISHED', finishedMatches);

            const matchResults: Map<number, MatchResult> = new Map();
            finishedMatches.forEach((match: Match) => {
                matchResults.set(match.id, {
                    matchId: match.id,
                    homeScore: match.score.fullTime.home,
                    awayScore: match.score.fullTime.away,
                    status: match.status
                });
            });

            // Получаем всех пользователей
            const usersResponse = await this.dataAccess.getAllUsers();
            console.log('USERS', usersResponse);

            if (!usersResponse.Item || usersResponse.Item.length === 0) {
                return {
                    competitionId,
                    competitionName,
                    entries: []
                };
            }

            // Обрабатываем предсказания каждого пользователя
            const scoreboardEntries = await Promise.all(
                usersResponse.Item?.usersData.map(async (userItem: { userName: string; userId: string; }) => {
                    const userId = userItem.userId;
                    const userName = userItem.userName || 'Unknown User';

                    // Получаем все предсказания пользователя для данной компетеции
                    const predictionsResponse = await this.dataAccess.getUserPredictions(userId, competitionId, season);
                    if (!predictionsResponse.Items || predictionsResponse.Items.length === 0) {
                        return {
                            userId,
                            userName,
                            predictedCount: 0,
                            predictedDifference: 0,
                            predictedOutcome: 0,
                            points: 0
                        };
                    }

                    // Обрабатываем каждое предсказание и рассчитываем очки
                    let totalPoints = 0;
                    let exactScoreCount = 0;
                    let correctDifferenceCount = 0;
                    let correctOutcomeCount = 0;

                    predictionsResponse.Items.forEach(prediction => {
                        // Извлекаем ID матча из SortKey
                        const sortKey = prediction.SortKey;
                        const matchIdMatch = sortKey.match(/MATCH#(\d+)$/);
                        if (!matchIdMatch) return;

                        const matchId = parseInt(matchIdMatch[1]);
                        const matchResult = matchResults.get(matchId);

                        // Пропускаем, если матч еще не завершен или нет предсказания
                        if (!matchResult || matchResult.homeScore === null || matchResult.awayScore === null) return;

                        const predictedHome = prediction.homeScore;
                        const predictedAway = prediction.awayScore;
                        const actualHome = matchResult.homeScore;
                        const actualAway = matchResult.awayScore;

                        // Рассчитываем очки по правилам
                        let points = 0;

                        // Точный счет: 3 очка
                        if (predictedHome === actualHome && predictedAway === actualAway) {
                            points = 3;
                            exactScoreCount++;
                        } 
                        // Правильная разница: 2 очка
                        else if ((predictedHome - predictedAway) === (actualHome - actualAway)) {
                            points = 2;
                            correctDifferenceCount++;
                        } 
                        // Правильный исход: 1 очко
                        else if (
                            (predictedHome > predictedAway && actualHome > actualAway) ||
                            (predictedHome < predictedAway && actualHome < actualAway) ||
                            (predictedHome === predictedAway && actualHome === actualAway)
                        ) {
                            points = 1;
                            correctOutcomeCount++;
                        }

                        totalPoints += points;
                    });

                    return {
                        userId,
                        userName,
                        predictedCount: exactScoreCount,
                        predictedDifference: correctDifferenceCount,
                        predictedOutcome: correctOutcomeCount,
                        points: totalPoints
                    };
                })
            );

            // Сортируем результаты согласно правилам
            // 1. По очкам (по убыванию)
            // 2. По угаданным счетам (по убыванию)
            // 3. По угаданным разницам (по убыванию)
            // 4. По угаданным исходам (по убыванию)
            scoreboardEntries.sort((a, b) => {
                // Сначала сортируем по очкам
                if (b.points !== a.points) {
                    return b.points - a.points;
                }

                // Если очки равны, сортируем по угаданным счетам
                if (b.predictedCount !== a.predictedCount) {
                    return b.predictedCount - a.predictedCount;
                }

                // Если угаданные счета равны, сортируем по угаданным разницам
                if (b.predictedDifference !== a.predictedDifference) {
                    return b.predictedDifference - a.predictedDifference;
                }

                // Если все вышеперечисленное равно, сортируем по угаданным исходам
                return b.predictedOutcome - a.predictedOutcome;
            });

            return {
                competitionId,
                competitionName,
                entries: scoreboardEntries
            };
        } catch (error) {
            console.error('Error calculating scoreboard data:', error);
            throw error;
        }
    }
}