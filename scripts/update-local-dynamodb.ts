#!/usr/bin/env bun
/**
 * Script to update local DynamoDB with latest football data from API Football v4
 * 
 * This script fetches and stores:
 * - Competition Details (with all seasons history)
 * - Matches (grouped by matchday)
 * - Teams (with full squad data, also saved individually)
 * - Standings
 * - Top Scorers
 * - Helper metadata
 * 
 * Usage: bun run scripts/update-local-dynamodb.ts
 * 
 * Prerequisites:
 * - Local DynamoDB running (docker compose up -d dynamodb-local)
 * - API_KEY and API_URL set in .env
 */

import axios from 'axios';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Types (matching the Lambda types)
interface MatchesResponse {
    filters: { season: string };
    resultSet: { count: number; first: string; last: string; played: number };
    competition: Record<string, unknown>;
    matches: Array<Record<string, unknown> & { matchday: number; season?: { currentMatchday?: number } }>;
}

interface StandingsResponse {
    filters: { season: string };
    area: Record<string, unknown>;
    competition: Record<string, unknown>;
    season: Record<string, unknown>;
    standings: unknown[];
}

interface ScorersResponse {
    count: number;
    filters: { season: string };
    competition: Record<string, unknown>;
    season: Record<string, unknown>;
    scorers: unknown[];
}

interface TeamsResponse {
    count: number;
    filters: { season: string };
    competition: Record<string, unknown>;
    season: Record<string, unknown>;
    teams: Array<Record<string, unknown> & { id: number }>;
}

interface CompetitionDetailsResponse {
    area: Record<string, unknown>;
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
    currentSeason: Record<string, unknown>;
    seasons: unknown[];
    lastUpdated: string;
}

// Configuration
const CONFIG = {
    apiKey: process.env.API_KEY,
    apiUrl: process.env.API_URL || 'https://api.football-data.org/v4',
    tableName: process.env.TABLE_NAME || 'SocerGameData',
    region: 'us-east-1',
    endpoint: 'http://localhost:8000',
    competitions: [
        { id: 2021, name: 'Premier League' },
        { id: 2001, name: 'Champions League' },
        { id: 2000, name: 'FIFA World Cup' }
    ]
};

// Validate configuration
if (!CONFIG.apiKey) {
    console.error('❌ ERROR: API_KEY not found in environment variables');
    process.exit(1);
}

// Initialize DynamoDB client for local development
const dynamoDbClient = new DynamoDBClient({
    region: CONFIG.region,
    endpoint: CONFIG.endpoint,
    credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy'
    }
});

const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

/**
 * Fetch data from API Football v4
 */
async function fetchFromApi<T>(endpoint: string): Promise<T> {
    try {
        console.log(`📡 Fetching: ${endpoint}`);
        const response = await axios.get(`${CONFIG.apiUrl}${endpoint}`, {
            headers: {
                'X-Auth-Token': CONFIG.apiKey!
            }
        });
        console.log(`✅ Success: ${endpoint}`);
        return response.data;
    } catch (error: unknown) {
        const err = error as { message?: string; response?: { data?: unknown } };
        console.error(`❌ Error fetching ${endpoint}:`, err.response?.data || err.message);
        throw error;
    }
}

/**
 * Save Competition Details
 */
async function saveCompetitionDetails(competitionId: number): Promise<CompetitionDetailsResponse | null> {
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
            TableName: CONFIG.tableName,
            Item: item
        }));

        console.log(`  ✓ Saved competition details`);
        return competitionDetails;
    } catch (error) {
        console.error(`  ✗ Failed to save competition details:`, error);
        return null;
    }
}

/**
 * Save Teams with full squad data
 */
async function saveTeams(competitionId: number, season: string): Promise<void> {
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
            TableName: CONFIG.tableName,
            Item: teamsItem
        }));

        console.log(`  ✓ Saved ${teamsResponse.teams.length} teams (combined)`);

        // Save each team individually for quick lookups
        let teamsSaved = 0;
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
                TableName: CONFIG.tableName,
                Item: teamItem
            }));
            teamsSaved++;
        }

        console.log(`  ✓ Saved ${teamsSaved} individual team records`);
    } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
            console.log(`  ⚠️  Teams not available`);
        } else {
            throw error;
        }
    }
}

/**
 * Save Standings
 */
async function saveStandings(competitionId: number, season: string): Promise<void> {
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
            TableName: CONFIG.tableName,
            Item: item
        }));

        console.log(`  ✓ Saved standings (${standingsResponse.standings.length} groups)`);
    } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
            console.log(`  ⚠️  Standings not available`);
        } else {
            throw error;
        }
    }
}

/**
 * Save Scorers
 */
async function saveScorers(competitionId: number, season: string): Promise<void> {
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
            TableName: CONFIG.tableName,
            Item: item
        }));

        console.log(`  ✓ Saved ${scorersResponse.scorers.length} scorers`);
    } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
            console.log(`  ⚠️  Scorers not available`);
        } else {
            throw error;
        }
    }
}

/**
 * Save Matches (grouped by matchday)
 */
async function saveMatches(competitionId: number): Promise<{ season: string; matchdays: number[] }> {
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
        TableName: CONFIG.tableName,
        Item: helperItem
    }));

    console.log(`  ✓ Saved HELPER`);

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
            TableName: CONFIG.tableName,
            Item: matchdayItem
        }));

        console.log(`  ✓ Saved matchday ${matchday} (${matches.length} matches)`);
    }

    return { season, matchdays: matchDays };
}

/**
 * Process a single competition
 */
async function processCompetition(competitionId: number, competitionName: string): Promise<void> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏆 Processing: ${competitionName} (ID: ${competitionId})`);
    console.log('='.repeat(60));

    // 1. Fetch and save competition details
    console.log('\n📋 Competition Details...');
    await saveCompetitionDetails(competitionId);

    // 2. Fetch and save matches (this gives us the season)
    console.log('\n⚽ Matches...');
    const { season } = await saveMatches(competitionId);

    // 3. Fetch and save teams with full squad data
    console.log('\n👥 Teams...');
    await saveTeams(competitionId, season);

    // 4. Fetch and save standings
    console.log('\n📊 Standings...');
    await saveStandings(competitionId, season);

    // 5. Fetch and save scorers
    console.log('\n🥅 Scorers...');
    await saveScorers(competitionId, season);

    console.log(`\n✅ Completed: ${competitionName}`);

    // Rate limiting: wait 1 second between competitions
    await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Main execution
 */
async function main(): Promise<void> {
    console.log('\n🚀 Starting DynamoDB Update Script (Extended)');
    console.log('='.repeat(60));
    console.log(`📍 DynamoDB Endpoint: ${CONFIG.endpoint}`);
    console.log(`📦 Table Name: ${CONFIG.tableName}`);
    console.log(`🌐 API URL: ${CONFIG.apiUrl}`);
    console.log(`🔑 API Key: ${CONFIG.apiKey?.substring(0, 8)}...`);
    console.log('='.repeat(60));

    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    for (const competition of CONFIG.competitions) {
        try {
            await processCompetition(competition.id, competition.name);
            successCount++;
        } catch (error) {
            failCount++;
            console.error(`\n⚠️  Skipping ${competition.name} due to errors\n`);
        }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('='.repeat(60));

    if (failCount > 0) {
        console.log('\n⚠️  Some competitions failed. Check logs above for details.');
        process.exit(1);
    } else {
        console.log('\n🎉 All competitions updated successfully!');
    }
}

// Execute
main().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
