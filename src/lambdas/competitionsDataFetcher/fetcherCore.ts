import axios from "axios";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import {
    MatchesResponse,
    StandingsResponse,
    ScorersResponse,
    TeamsResponse,
    CompetitionDetailsResponse
} from "@/lambdas/competitionsDataFetcher/types";

// ─── Configuration ───────────────────────────────────────────────────────────

const DEFAULT_COMPETITION_IDS = [2021, 2001, 2000];

const UNFOLD_HEADERS = {
    'X-Unfold-Goals': 'true',
    'X-Unfold-Lineups': 'true',
    'X-Unfold-Bookings': 'true',
    'X-Unfold-Subs': 'true',
};

export interface FetcherConfig {
    apiKey: string;
    apiUrl: string;
    tableName: string;
    docClient: DynamoDBDocumentClient;
}

export const getCompetitionIds = (envValue?: string): number[] => {
    if (!envValue) return DEFAULT_COMPETITION_IDS;

    const parsed = envValue.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    return parsed.length > 0 ? parsed : DEFAULT_COMPETITION_IDS;
};

// ─── API Helpers ─────────────────────────────────────────────────────────────

const fetchFromApi = async <T>(config: FetcherConfig, endpoint: string, extraHeaders: Record<string, string> = {}): Promise<T> => {
    console.log(`Fetching: ${endpoint}`);
    const response = await axios.get(`${config.apiUrl}${endpoint}`, {
        headers: {
            'X-Auth-Token': config.apiKey,
            ...extraHeaders,
        },
    });
    return response.data;
};

const fetchMatchesFromApi = async <T>(config: FetcherConfig, endpoint: string): Promise<T> => {
    return fetchFromApi<T>(config, endpoint, UNFOLD_HEADERS);
};

const getTodayDateUTC = (): string => {
    return new Date().toISOString().split('T')[0];
};

// ─── Save Functions ──────────────────────────────────────────────────────────

export const saveCompetitionDetails = async (config: FetcherConfig, competitionId: number): Promise<CompetitionDetailsResponse | null> => {
    try {
        const competitionDetails = await fetchFromApi<CompetitionDetailsResponse>(
            config, `/competitions/${competitionId}`
        );

        await config.docClient.send(new PutCommand({
            TableName: config.tableName,
            Item: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: 'COMPETITION_DETAILS',
                ...competitionDetails,
                lastUpdated: new Date().toISOString()
            }
        }));

        console.log(`Saved competition details for ${competitionId}`);
        return competitionDetails;
    } catch (error) {
        console.error(`Failed to save competition details for ${competitionId}:`, error);
        return null;
    }
};

export const saveTeams = async (config: FetcherConfig, competitionId: number, season: string): Promise<TeamsResponse | null> => {
    try {
        const teamsResponse = await fetchFromApi<TeamsResponse>(
            config, `/competitions/${competitionId}/teams`
        );

        await config.docClient.send(new PutCommand({
            TableName: config.tableName,
            Item: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: `SEASON#${season}#TEAMS`,
                competitionId,
                season,
                teams: teamsResponse.teams,
                teamCount: teamsResponse.teams.length,
                lastUpdated: new Date().toISOString()
            }
        }));

        console.log(`Saved ${teamsResponse.teams.length} teams for competition ${competitionId}`);

        for (const team of teamsResponse.teams) {
            await config.docClient.send(new PutCommand({
                TableName: config.tableName,
                Item: {
                    PartitionKey: `TEAM_ID#${team.id}`,
                    SortKey: `SEASON#${season}`,
                    ...team,
                    competitionId,
                    season,
                    lastUpdated: new Date().toISOString()
                }
            }));
        }

        console.log(`Saved individual team records for competition ${competitionId}`);
        return teamsResponse;
    } catch (error) {
        console.error(`Failed to save teams for ${competitionId}:`, error);
        return null;
    }
};

export const saveStandings = async (config: FetcherConfig, competitionId: number, season: string): Promise<void> => {
    try {
        const standingsResponse = await fetchFromApi<StandingsResponse>(
            config, `/competitions/${competitionId}/standings`
        );

        await config.docClient.send(new PutCommand({
            TableName: config.tableName,
            Item: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: `SEASON#${season}#STANDINGS`,
                competitionId,
                season,
                standings: standingsResponse.standings,
                area: standingsResponse.area,
                seasonData: standingsResponse.season,
                lastUpdated: new Date().toISOString()
            }
        }));

        console.log(`Saved standings for competition ${competitionId}`);
    } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
            console.log(`Standings not available for competition ${competitionId}`);
        } else {
            console.error(`Failed to save standings for ${competitionId}:`, error);
        }
    }
};

export const saveScorers = async (config: FetcherConfig, competitionId: number, season: string): Promise<void> => {
    try {
        const scorersResponse = await fetchFromApi<ScorersResponse>(
            config, `/competitions/${competitionId}/scorers`
        );

        await config.docClient.send(new PutCommand({
            TableName: config.tableName,
            Item: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: `SEASON#${season}#SCORERS`,
                competitionId,
                season,
                scorers: scorersResponse.scorers,
                scorerCount: scorersResponse.count,
                lastUpdated: new Date().toISOString()
            }
        }));

        console.log(`Saved ${scorersResponse.scorers.length} scorers for competition ${competitionId}`);
    } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
            console.log(`Scorers not available for competition ${competitionId}`);
        } else {
            console.error(`Failed to save scorers for ${competitionId}:`, error);
        }
    }
};

export const saveMatches = async (config: FetcherConfig, competitionId: number): Promise<{ season: string; matchdays: number[] }> => {
    const matchesResponse = await fetchMatchesFromApi<MatchesResponse>(
        config, `/competitions/${competitionId}/matches`
    );

    if (!matchesResponse?.filters?.season) {
        throw new Error(`Missing required season data for competition ${competitionId}`);
    }

    const season = matchesResponse.filters.season;
    const activeMatchDay = matchesResponse.matches?.[0]?.season?.currentMatchday ?? 0;

    // Group matches by compound key: stage + matchday
    const matchesByStageMatchday = new Map<string, typeof matchesResponse.matches>();
    const matchDaysSet = new Set<number>();

    matchesResponse.matches.forEach(match => {
        const stage = match.stage || 'REGULAR_SEASON';
        const matchday = match.matchday ?? 0;
        const key = `${stage}::${matchday}`;

        matchDaysSet.add(matchday);
        if (!matchesByStageMatchday.has(key)) {
            matchesByStageMatchday.set(key, []);
        }
        matchesByStageMatchday.get(key)!.push(match);
    });

    const matchDays = Array.from(matchDaysSet).sort((a, b) => a - b);

    // Save HELPER item
    await config.docClient.send(new PutCommand({
        TableName: config.tableName,
        Item: {
            PartitionKey: `COMPETITION_ID#${competitionId}`,
            SortKey: 'HELPER',
            ActiveSeason: season,
            competitionData: {
                ...matchesResponse.competition,
                activeMatchDay,
                matchDays,
                season,
            },
            lastUpdated: new Date().toISOString()
        }
    }));

    console.log(`Saved HELPER for competition ${competitionId}`);

    // Save each stage+matchday item
    for (const [key, matches] of matchesByStageMatchday) {
        const [stage, matchdayStr] = key.split('::');
        const matchday = parseInt(matchdayStr, 10);

        await config.docClient.send(new PutCommand({
            TableName: config.tableName,
            Item: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: `SEASON#${season}#STAGE#${stage}#MATCHDAY#${matchday}`,
                competitionId,
                season,
                stage,
                matchday,
                matches,
                matchCount: matches.length,
                lastUpdated: new Date().toISOString()
            }
        }));

        console.log(`Saved ${stage} matchday ${matchday} (${matches.length} matches) for competition ${competitionId}`);
    }

    return { season, matchdays: matchDays };
};

// ─── High-Level Operations ───────────────────────────────────────────────────

export const processCompetitionBulk = async (config: FetcherConfig, competitionId: number): Promise<void> => {
    console.log(`\nProcessing (bulk): competition ${competitionId}`);

    await saveCompetitionDetails(config, competitionId);
    const { season } = await saveMatches(config, competitionId);
    await saveTeams(config, competitionId, season);
    await saveStandings(config, competitionId, season);
    await saveScorers(config, competitionId, season);

    console.log(`Completed (bulk): competition ${competitionId}\n`);
};

export const processCompetitionLive = async (config: FetcherConfig, competitionId: number): Promise<void> => {
    const today = getTodayDateUTC();

    const matchesResponse = await fetchMatchesFromApi<MatchesResponse>(
        config, `/competitions/${competitionId}/matches?dateFrom=${today}&dateTo=${today}`
    );

    if (!matchesResponse?.matches?.length) {
        return;
    }

    const season = matchesResponse.filters.season;
    const activeMatchDay = matchesResponse.matches[0]?.season?.currentMatchday ?? 0;

    // Group today's matches by stage + matchday
    const matchesByStageMatchday = new Map<string, typeof matchesResponse.matches>();

    matchesResponse.matches.forEach(match => {
        const stage = match.stage || 'REGULAR_SEASON';
        const matchday = match.matchday ?? 0;
        const key = `${stage}::${matchday}`;

        if (!matchesByStageMatchday.has(key)) {
            matchesByStageMatchday.set(key, []);
        }
        matchesByStageMatchday.get(key)!.push(match);
    });

    // Merge updated matches into existing stage+matchday items
    for (const [key, todayMatches] of matchesByStageMatchday) {
        const [stage, matchdayStr] = key.split('::');
        const matchday = parseInt(matchdayStr, 10);
        const sortKey = `SEASON#${season}#STAGE#${stage}#MATCHDAY#${matchday}`;

        try {
            const existing = await config.docClient.send(new GetCommand({
                TableName: config.tableName,
                Key: {
                    PartitionKey: `COMPETITION_ID#${competitionId}`,
                    SortKey: sortKey,
                }
            }));

            let allMatches = todayMatches;

            if (existing.Item?.matches) {
                const todayMatchIds = new Set(todayMatches.map(m => m.id));
                const unchangedMatches = (existing.Item.matches as typeof todayMatches)
                    .filter(m => !todayMatchIds.has(m.id));
                allMatches = [...unchangedMatches, ...todayMatches];
            }

            await config.docClient.send(new PutCommand({
                TableName: config.tableName,
                Item: {
                    PartitionKey: `COMPETITION_ID#${competitionId}`,
                    SortKey: sortKey,
                    competitionId,
                    season,
                    stage,
                    matchday,
                    matches: allMatches,
                    matchCount: allMatches.length,
                    lastUpdated: new Date().toISOString()
                }
            }));

            console.log(`Live update: competition ${competitionId} ${stage} matchday ${matchday} (${todayMatches.length} matches updated)`);
        } catch (error) {
            console.error(`Failed to update ${stage} matchday ${matchday} for competition ${competitionId}:`, error);
        }
    }

    // Update HELPER if activeMatchDay changed
    try {
        const helperResult = await config.docClient.send(new GetCommand({
            TableName: config.tableName,
            Key: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: 'HELPER',
            }
        }));

        if (helperResult.Item && helperResult.Item.competitionData?.activeMatchDay !== activeMatchDay) {
            await config.docClient.send(new PutCommand({
                TableName: config.tableName,
                Item: {
                    ...helperResult.Item,
                    competitionData: {
                        ...helperResult.Item.competitionData,
                        activeMatchDay,
                    },
                    lastUpdated: new Date().toISOString()
                }
            }));

            console.log(`Updated activeMatchDay to ${activeMatchDay} for competition ${competitionId}`);
        }
    } catch (error) {
        console.error(`Failed to update HELPER for competition ${competitionId}:`, error);
    }
};
