import {ICompetitionsManager} from "@/app/server/modules/competitions/ICompetitionsManager";
import { Match, Competition, MatchDayWithStatus, ScoreBoardData, PredictedScore, ScoreBoardEntry } from "@/app/server/modules/competitions/types";
import db from "@/lib/db";
import {IDynamoDbCompetitionsDataAccess} from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/IDynamoDbCompetitionsDataAccess";
import {GetCommandOutput, QueryCommandOutput} from "@aws-sdk/lib-dynamodb";

export class PrismaCompetitionsManager implements ICompetitionsManager {
    
    constructor(private dynamoDataAccess: IDynamoDbCompetitionsDataAccess) {}

    async getAllMatchesWithPredictions(competitionId: number, matchDay: number, season: number, userId: string): Promise<Match[]> {
        // 1. Fetch ALL matches from DynamoDB (Query for all matchdays)
        const allData: QueryCommandOutput = await this.dynamoDataAccess.getCompetitionData(competitionId, season);
        
        // Aggregate matches from all matchday items (new format: item.matches, not item.rawData.matches)
        let allMatches: Match[] = [];
        if (allData.Items) {
            allData.Items.forEach((item: { matches?: Match[] }) => {
                if (item.matches) {
                    allMatches = allMatches.concat(item.matches);
                }
            });
        }
        
        if (allMatches.length === 0) return [];

        // Filter for the requested matchday
        const dayMatches = allMatches.filter(m => m.matchday === matchDay);
        if (dayMatches.length === 0) return [];

        // 2. Calculate form guide based on MATCHDAY (not date)
        const getTeamForm = (teamId: number, currentMatchday: number): ('W' | 'D' | 'L' | 'N')[] => {
            const teamMatches = allMatches.filter(m => 
                (m.homeTeam.id === teamId || m.awayTeam.id === teamId) &&
                m.status === 'FINISHED' &&
                m.matchday < currentMatchday
            ).sort((a, b) => b.matchday - a.matchday);

            const results: ('W' | 'D' | 'L' | 'N')[] = teamMatches.slice(0, 5).map(m => {
                const isHome = m.homeTeam.id === teamId;
                const homeScore = m.score.fullTime.home ?? 0;
                const awayScore = m.score.fullTime.away ?? 0;
                
                if (homeScore === awayScore) return 'D';
                if (isHome) return (homeScore > awayScore ? 'W' : 'L');
                return (awayScore > homeScore ? 'W' : 'L');
            });

            while (results.length < 5) {
                results.push('N');
            }
            return results;
        };

        // 3. Fetch Predictions from Postgres
        const matchIds = dayMatches.map(m => m.id.toString());
        const predictions = await db.prediction.findMany({
            where: {
                userId: userId,
                matchId: { in: matchIds }
            }
        });

        const predictionMap = new Map<string, PredictedScore>();
        predictions.forEach(p => {
             predictionMap.set(p.matchId, {
                 home: p.homeScore,
                 away: p.awayScore,
                 isPredicted: true
             });
        });

        const now = new Date();

        return dayMatches.map(m => {
            const pred = predictionMap.get(m.id.toString());
            const matchDate = new Date(m.utcDate);
            
            return {
                ...m,
                isStarted: matchDate < now,
                formGuide: {
                    home: getTeamForm(m.homeTeam.id, m.matchday),
                    away: getTeamForm(m.awayTeam.id, m.matchday)
                },
                predictedScore: pred || {
                    home: 0,
                    away: 0,
                    isPredicted: false
                }
            };
        });
    }

    async getActiveSeason(competitionId: number): Promise<number> {
        const helperData: GetCommandOutput = await this.dynamoDataAccess.getCompetitionHelperData(competitionId);
        // Helper Item contains activeSeason or season
        const season = helperData.Item?.season || helperData.Item?.activeSeason || helperData.Item?.ActiveSeason || 2024;
        return typeof season === 'string' ? parseInt(season) : season;
    }

    async getCompetitionData(competitionId: number): Promise<Competition> {
        const helperData: GetCommandOutput = await this.dynamoDataAccess.getCompetitionHelperData(competitionId);
        
        // Handle nested structure from matchFetcher (helperItem.competitionData)
        const compData = helperData.Item?.competitionData || helperData.Item?.competition || helperData.Item;
        
        if (!compData) throw new Error("Competition not found in DynamoDB");

        // activeMatchDay and matchDays are inside competitionData
        const rawActiveMatchDay = compData.activeMatchDay ?? helperData.Item?.activeMatchDay ?? 0;
        const rawMatchDays = compData.matchDays ?? helperData.Item?.matchDays ?? [];

        return {
            id: compData.id,
            name: compData.name,
            code: compData.code ?? '',
            emblem: compData.emblem ?? '',
            type: compData.type ?? '',
            activeMatchDay: rawActiveMatchDay,
            matchDays: rawMatchDays
        };
    }

    async getMatchDaysWithStatus(competitionId: number): Promise<MatchDayWithStatus[]> {
        const season = await this.getActiveSeason(competitionId);
        const allData: QueryCommandOutput = await this.dynamoDataAccess.getCompetitionData(competitionId, season);
        
        const now = new Date();
        const matchDayMap = new Map<number, boolean>();

        // allData.Items contains items for each MatchDay (new format: item.matches, not item.rawData.matches)
        (allData.Items || []).forEach((item: { matches?: Match[] }) => {
            const matches: Match[] = item.matches || [];
            matches.forEach(m => {
                 if (!matchDayMap.has(m.matchday)) {
                    matchDayMap.set(m.matchday, true); // Assume finished
                }
                const matchDate = new Date(m.utcDate);
                if (matchDate > now) {
                     matchDayMap.set(m.matchday, false);
                }
            });
        });

        const sortedDays = Array.from(matchDayMap.keys()).sort((a, b) => a - b);
        let foundNext = false;

        return sortedDays.map(day => {
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
    }

    async getMatchScoreByUser(userId: string, competitionId: number, season: number, matchDay: number, matchId: number): Promise<PredictedScore | null> {
         const prediction = await db.prediction.findUnique({
             where: {
                 userId_matchId: {
                     userId: userId,
                     matchId: matchId.toString()
                 }
             }
         });
         
         if (!prediction) return null;

         return {
             home: prediction.homeScore,
             away: prediction.awayScore,
             isPredicted: true
         };
    }

    async saveMatchScore(competitionId: number, matchDay: number, matchId: number, score: { home: number, away: number }, userId: string): Promise<boolean> {
        await db.prediction.upsert({
            where: {
                userId_matchId: {
                    userId: userId,
                    matchId: matchId.toString()
                }
            },
            update: {
                homeScore: score.home,
                awayScore: score.away
            },
            create: {
                userId: userId,
                matchId: matchId.toString(),
                homeScore: score.home,
                awayScore: score.away
            }
        });
        return true;
    }

    async getScoreBoardData(competitionId: number): Promise<ScoreBoardData> {
        const comp = await this.getCompetitionData(competitionId);
        const season = await this.getActiveSeason(competitionId);
        
        // Fetch Matches (Dynamo Query) - new format: item.matches, not item.rawData.matches
        const allData: QueryCommandOutput = await this.dynamoDataAccess.getCompetitionData(competitionId, season);
        const matches: Match[] = (allData.Items || []).flatMap((item: { matches?: Match[] }) => item.matches || []);
        
        // Fetch Users (Postgres)
        const users = await db.user.findMany();
        
        // Fetch All Predictions for these matches (Postgres)
        const matchIds = matches.map(m => m.id.toString());
        
        const predictions = await db.prediction.findMany({
            where: {
                matchId: { in: matchIds }
            }
        });
        
        const matchMap = new Map<string, {home: number, away: number}>();
        matches.forEach(m => {
             if (m.score.fullTime.home !== null && m.score.fullTime.away !== null && (m.status === 'FINISHED' || m.status === 'IN_PLAY')) {
                 matchMap.set(m.id.toString(), { 
                     home: m.score.fullTime.home, 
                     away: m.score.fullTime.away 
                 });
             }
        });

        const entries: ScoreBoardEntry[] = users.map(user => {
            const userPreds = predictions.filter(p => p.userId === user.id);
            
            let totalPoints = 0;
            let exact = 0;
            let diff = 0;
            let outcome = 0;

            userPreds.forEach(p => {
                const actual = matchMap.get(p.matchId);
                if (!actual) return;

                const pH = p.homeScore;
                const pA = p.awayScore;
                const aH = actual.home;
                const aA = actual.away;

                if (pH === aH && pA === aA) {
                    totalPoints += 3;
                    exact++;
                } else if ((pH - pA) === (aH - aA)) {
                    totalPoints += 2;
                    diff++;
                } else if (
                    (pH > pA && aH > aA) ||
                    (pH < pA && aH < aA) ||
                    (pH === pA && aH === aA)
                ) {
                    totalPoints += 1;
                    outcome++;
                }
            });

            return {
                userId: user.id,
                userName: user.username,
                name: user.name ?? 'Unknown',
                predictedCount: exact,
                predictedDifference: diff,
                predictedOutcome: outcome,
                points: totalPoints
            };
        });

        entries.sort((a, b) => {
             if (b.points !== a.points) return b.points - a.points;
             if (b.predictedCount !== a.predictedCount) return b.predictedCount - a.predictedCount;
             if (b.predictedDifference !== a.predictedDifference) return b.predictedDifference - a.predictedDifference;
             return b.predictedOutcome - a.predictedOutcome;
        });

        return {
            competitionId,
            competitionName: comp.name,
            entries
        };
    }
}
