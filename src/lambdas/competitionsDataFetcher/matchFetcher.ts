import { ScheduledHandler } from "aws-lambda";
import axios from "axios";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { 
    MatchesResponse, 
    StandingsResponse, 
    ScorersResponse, 
    TeamsResponse,
    CompetitionDetailsResponse 
} from "@/lambdas/competitionsDataFetcher/types";

// Configuration
const COMPETITION_IDS = {
    PREMIER_LEAGUE: 2021,
    CHAMPIONS_LEAGUE: 2001,
    FIFA_WORLD_CUP: 2000
};

const dynamoDbClient = new DynamoDBClient({
    region: process.env.AWS_DB_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

// API helper function
const fetchFromApi = async <T>(endpoint: string): Promise<T> => {
    const API_KEY = process.env.AWS_APP_SERVICE_KEY;
    const API_URL = process.env.AWS_APP_API_URL;

    if (!API_URL || !API_KEY) {
        throw new Error("Missing API configuration");
    }

    console.log(`Fetching: ${endpoint}`);
    const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: {
            'X-Auth-Token': API_KEY,
        },
    });
    return response.data;
};

// Save Competition Details
const saveCompetitionDetails = async (competitionId: number): Promise<CompetitionDetailsResponse | null> => {
    try {
        const competitionDetails = await fetchFromApi<CompetitionDetailsResponse>(
            `/competitions/${competitionId}`
        );

        const item = {
            PartitionKey: `COMPETITION_ID#${competitionId}`,
            SortKey: 'COMPETITION_DETAILS',
            ...competitionDetails,
            lastUpdated: new Date().toISOString()
        };

        await docClient.send(new PutCommand({
            TableName: process.env.AWS_TABLE_NAME,
            Item: item
        }));

        console.log(`Saved competition details for ${competitionId}`);
        return competitionDetails;
    } catch (error) {
        console.error(`Failed to save competition details for ${competitionId}:`, error);
        return null;
    }
};

// Save Teams with full squad data
const saveTeams = async (competitionId: number, season: string): Promise<TeamsResponse | null> => {
    try {
        const teamsResponse = await fetchFromApi<TeamsResponse>(
            `/competitions/${competitionId}/teams`
        );

        // Save combined teams item
        const teamsItem = {
            PartitionKey: `COMPETITION_ID#${competitionId}`,
            SortKey: `SEASON#${season}#TEAMS`,
            competitionId,
            season,
            teams: teamsResponse.teams,
            teamCount: teamsResponse.teams.length,
            lastUpdated: new Date().toISOString()
        };

        await docClient.send(new PutCommand({
            TableName: process.env.AWS_TABLE_NAME,
            Item: teamsItem
        }));

        console.log(`Saved ${teamsResponse.teams.length} teams for competition ${competitionId}`);

        // Also save each team individually for quick lookups
        for (const team of teamsResponse.teams) {
            const teamItem = {
                PartitionKey: `TEAM_ID#${team.id}`,
                SortKey: `SEASON#${season}`,
                ...team,
                competitionId,
                season,
                lastUpdated: new Date().toISOString()
            };

            await docClient.send(new PutCommand({
                TableName: process.env.AWS_TABLE_NAME,
                Item: teamItem
            }));
        }

        console.log(`Saved individual team records for competition ${competitionId}`);
        return teamsResponse;
    } catch (error) {
        console.error(`Failed to save teams for ${competitionId}:`, error);
        return null;
    }
};

// Save Standings
const saveStandings = async (competitionId: number, season: string): Promise<void> => {
    try {
        const standingsResponse = await fetchFromApi<StandingsResponse>(
            `/competitions/${competitionId}/standings`
        );

        const item = {
            PartitionKey: `COMPETITION_ID#${competitionId}`,
            SortKey: `SEASON#${season}#STANDINGS`,
            competitionId,
            season,
            standings: standingsResponse.standings,
            area: standingsResponse.area,
            seasonData: standingsResponse.season,
            lastUpdated: new Date().toISOString()
        };

        await docClient.send(new PutCommand({
            TableName: process.env.AWS_TABLE_NAME,
            Item: item
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

// Save Scorers
const saveScorers = async (competitionId: number, season: string): Promise<void> => {
    try {
        const scorersResponse = await fetchFromApi<ScorersResponse>(
            `/competitions/${competitionId}/scorers`
        );

        const item = {
            PartitionKey: `COMPETITION_ID#${competitionId}`,
            SortKey: `SEASON#${season}#SCORERS`,
            competitionId,
            season,
            scorers: scorersResponse.scorers,
            scorerCount: scorersResponse.count,
            lastUpdated: new Date().toISOString()
        };

        await docClient.send(new PutCommand({
            TableName: process.env.AWS_TABLE_NAME,
            Item: item
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

// Save Matches (grouped by matchday)
const saveMatches = async (competitionId: number): Promise<{ season: string; matchdays: number[] }> => {
    const matchesResponse = await fetchFromApi<MatchesResponse>(
        `/competitions/${competitionId}/matches`
    );

    if (!matchesResponse || !matchesResponse.filters || matchesResponse.filters.season === undefined) {
        throw new Error(`Missing required season data for competition ${competitionId}`);
    }

    const season = matchesResponse.filters.season;
    const activeMatchDay = matchesResponse.matches?.[0]?.season?.currentMatchday ?? 0;
    
    // Group matches by matchday
    const matchesByMatchday = new Map<number, typeof matchesResponse.matches>();
    const matchDaysSet = new Set<number>();
    
    matchesResponse.matches.forEach(match => {
        matchDaysSet.add(match.matchday);
        if (!matchesByMatchday.has(match.matchday)) {
            matchesByMatchday.set(match.matchday, []);
        }
        matchesByMatchday.get(match.matchday)!.push(match);
    });

    const matchDays = Array.from(matchDaysSet).sort((a, b) => a - b);

    // Save HELPER item
    const helperItem = {
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
    };

    await docClient.send(new PutCommand({
        TableName: process.env.AWS_TABLE_NAME,
        Item: helperItem
    }));

    console.log(`Saved HELPER for competition ${competitionId}`);

    // Save each matchday as a separate item
    for (const [matchday, matches] of matchesByMatchday) {
        const matchdayItem = {
            PartitionKey: `COMPETITION_ID#${competitionId}`,
            SortKey: `SEASON#${season}#MATCHDAY#${matchday}`,
            competitionId,
            season,
            matchday,
            matches,
            matchCount: matches.length,
            lastUpdated: new Date().toISOString()
        };

        await docClient.send(new PutCommand({
            TableName: process.env.AWS_TABLE_NAME,
            Item: matchdayItem
        }));

        console.log(`Saved matchday ${matchday} (${matches.length} matches) for competition ${competitionId}`);
    }

    return { season, matchdays: matchDays };
};

// Process a single competition
const processCompetition = async (competitionId: number, competitionName: string): Promise<void> => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Processing: ${competitionName} (ID: ${competitionId})`);
    console.log('='.repeat(50));

    // 1. Fetch and save competition details
    await saveCompetitionDetails(competitionId);

    // 2. Fetch and save matches (this gives us the season)
    const { season } = await saveMatches(competitionId);

    // 3. Fetch and save teams with full squad data
    await saveTeams(competitionId, season);

    // 4. Fetch and save standings
    await saveStandings(competitionId, season);

    // 5. Fetch and save scorers
    await saveScorers(competitionId, season);

    console.log(`Completed: ${competitionName}\n`);

    // Rate limiting: wait 500ms between competitions
    await new Promise(resolve => setTimeout(resolve, 500));
};

// Main Lambda handler
export const handler: ScheduledHandler = async () => {
    console.log("matchFetcher handler started");
    console.log(`Table: ${process.env.AWS_TABLE_NAME}`);
    
    const competitions = [
        { id: COMPETITION_IDS.PREMIER_LEAGUE, name: 'Premier League' },
        { id: COMPETITION_IDS.CHAMPIONS_LEAGUE, name: 'Champions League' },
        { id: COMPETITION_IDS.FIFA_WORLD_CUP, name: 'FIFA World Cup' }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const { id, name } of competitions) {
        try {
            await processCompetition(id, name);
            successCount++;
        } catch (error) {
            failCount++;
            console.error(`Failed to process ${name}:`, error);
            // Continue with next competition
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Summary');
    console.log('='.repeat(50));
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);

    if (failCount > 0) {
        throw new Error(`${failCount} competition(s) failed to process`);
    }
};