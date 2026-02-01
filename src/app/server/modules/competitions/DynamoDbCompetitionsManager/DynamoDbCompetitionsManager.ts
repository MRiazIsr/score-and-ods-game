import {
    IDynamoDbCompetitionsDataAccess
} from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/IDynamoDbCompetitionsDataAccess";
import {GetCommandOutput} from "@aws-sdk/lib-dynamodb";
import {Competition, Match, MatchResult, ScoreBoardData, PredictedScore, MatchDayWithStatus} from "@/app/server/modules/competitions/types";
import { ICompetitionsManager } from "@/app/server/modules/competitions/ICompetitionsManager";

export class DynamoDbCompetitionsManager implements ICompetitionsManager {

    private dataAccess: IDynamoDbCompetitionsDataAccess;

    constructor(dataAccess: IDynamoDbCompetitionsDataAccess) {
        this.dataAccess = dataAccess;
    }

    public async getAllMatchesWithPredictions(competitionId: number, matchDay: number, season: number, userId: string): Promise<Match[]>
    {
        const competitionRawData = await this.dataAccess.getCompetitionData(competitionId, season);
        const now = new Date();
        
        // Aggregate all matches from all matchday items
        let allMatches: Match[] = [];
        if (competitionRawData.Items) {
            competitionRawData.Items.forEach((item: { matches?: Match[] }) => {
                if (item.matches) {
                    allMatches = allMatches.concat(item.matches);
                }
            });
        }
        
        if (allMatches.length === 0) return [];

        // Calculate form guide based on MATCHDAY (not date)
        // Shows results from previous matchdays, always 5 dots (padded with 'N' for no data)
        const getTeamForm = (teamId: number, currentMatchday: number): ('W' | 'D' | 'L' | 'N')[] => {
            // Filter finished matches for this team in PREVIOUS matchdays
            const teamMatches = allMatches.filter(m => 
                (m.homeTeam.id === teamId || m.awayTeam.id === teamId) &&
                m.status === 'FINISHED' &&
                m.matchday < currentMatchday
            ).sort((a, b) => b.matchday - a.matchday); // Sort desc by matchday (newest first)

            const results: ('W' | 'D' | 'L' | 'N')[] = teamMatches.slice(0, 5).map(m => {
                const isHome = m.homeTeam.id === teamId;
                const homeScore = m.score.fullTime.home ?? 0;
                const awayScore = m.score.fullTime.away ?? 0;
                
                if (homeScore === awayScore) return 'D';
                if (isHome) return (homeScore > awayScore ? 'W' : 'L');
                return (awayScore > homeScore ? 'W' : 'L');
            });

            // Pad with 'N' (no data) to always show 5 dots
            while (results.length < 5) {
                results.push('N');
            }

            return results;
        };

        // Filter matches for the requested matchday
        const matchdayMatches = allMatches.filter((match) => match.matchday === matchDay);

        return await Promise.all(
            matchdayMatches.map(async (match: Match): Promise<Match> => {
                const matchDate = new Date(match.utcDate);
                match.isStarted = matchDate < now;
                match.formGuide = {
                    home: getTeamForm(match.homeTeam.id, match.matchday),
                    away: getTeamForm(match.awayTeam.id, match.matchday)
                };

                try {
                    const matchScore = await this.getMatchScoreByUser(userId, match.competition.id, season, match.matchday, match.id);

                    match.predictedScore = matchScore ? {
                        home: matchScore.home,
                        away: matchScore.away,
                        isPredicted: true,
                    } : {
                        home: 0,
                        away: 0,
                        isPredicted: false
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

    public async getMatchScoreByUser(userId: string, competitionId: number, season: number, matchDay: number, matchId: number): Promise<PredictedScore | null>
    {
        const output = await this.dataAccess.getMatchScoreByUser(userId, competitionId, season, matchDay, matchId);
        if (output.Item) {
             return {
                 home: output.Item.homeScore,
                 away: output.Item.awayScore,
                 isPredicted: true
             };
        }
        return null;
    }

    public async saveMatchScore(competitionId: number, matchDay: number, matchId: number, score: { home: number, away: number }, userId: string): Promise<boolean>
    {
        const activeSeason: number = await this.getActiveSeason(competitionId);
        await this.dataAccess.saveMatchScore(competitionId, matchDay, activeSeason, matchId, score, userId);

        return true;
    }

    public async getMatchDaysWithStatus(competitionId: number): Promise<MatchDayWithStatus[]> {
        const season = await this.getActiveSeason(competitionId);
        // Now returns a QueryOutput with multiple Items (one per matchday)
        const competitionRawData = await this.dataAccess.getCompetitionData(competitionId, season);
        
        // Aggregate matches from all items
        let matches: Match[] = [];
        if (competitionRawData.Items) {
            competitionRawData.Items.forEach(item => {
                if (item.matches) {
                    matches = matches.concat(item.matches);
                }
            });
        }
        
        const now = new Date();

        const matchDayMap = new Map<number, boolean>(); // day -> isFinished

        matches.forEach(match => {
            const matchDate = new Date(match.utcDate);
            const isPast = matchDate < now;
            
            if (!matchDayMap.has(match.matchday)) {
                matchDayMap.set(match.matchday, true); // Assume finished until proven otherwise
            }
            
            // If any match in this day is NOT past, the day is NOT finished
            if (!isPast) {
                matchDayMap.set(match.matchday, false);
            }
        });

        const sortedDays = Array.from(matchDayMap.keys()).sort((a, b) => a - b);
        
        let foundNext = false;
        
        const allDaysWithStatus = sortedDays.map(day => {
            const isFinished = matchDayMap.get(day);
            
            if (isFinished) {
                return { matchDay: day, status: 'PAST' as const };
            } else if (!foundNext) {
                foundNext = true;
                return { matchDay: day, status: 'NEXT' as const };
            } else {
                return { matchDay: day, status: 'FUTURE' as const };
            }
        });

        return allDaysWithStatus;
    }



    async getScoreBoardData(competitionId: number): Promise<ScoreBoardData> {
        try {
            const season = await this.getActiveSeason(competitionId);
            const competitionData = await this.getCompetitionData(competitionId);
            const competitionName = competitionData.name ?? `Competition ${competitionId}`;

            // Fetch ALL matchdays via Query
            const matchesResponse = await this.dataAccess.getCompetitionData(competitionId, season);
            
            let matches: Match[] = [];
            if (matchesResponse.Items) {
                matchesResponse.Items.forEach(item => {
                    if (item.matches) {
                        matches = matches.concat(item.matches);
                    }
                });
            }

            if (matches.length === 0) {
                return {
                    competitionId,
                    competitionName,
                    entries: []
                };
            }

            const finishedMatches = matches.filter((match: Match) =>
                match.status === 'FINISHED' || match.status === 'IN_PLAY'
            );

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
                    const user = await this.dataAccess.getUserById(userItem.userId);
                    const userId = userItem.userId;
                    const userName = user.Item?.userName || 'Unknown User';
                    const name = user.Item?.name || 'Unknown Name';

                    // Получаем все предсказания пользователя для данной компетеции
                    const predictionsResponse = await this.dataAccess.getUserPredictions(userId, competitionId, season);
                    if (!predictionsResponse.Items || predictionsResponse.Items.length === 0) {
                        return {
                            userId,
                            userName,
                            name,
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
                        name,
                        predictedCount: exactScoreCount,
                        predictedDifference: correctDifferenceCount,
                        predictedOutcome: correctOutcomeCount,
                        points: totalPoints
                    };
                })
            );

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