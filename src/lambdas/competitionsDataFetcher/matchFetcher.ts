import { ScheduledHandler } from "aws-lambda";
import axios from "axios";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand} from "@aws-sdk/lib-dynamodb";
import { MatchesResponse } from "@/lambdas/competitionsDataFetcher/types";

const dynamoDbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const handler: ScheduledHandler = async() => {
    console.log("matchFetcher handler");
    const EnglishPremierLeagueId = 2021;
    const ChampionsLeagueId = 2001;
    try {
        const competitions = await fetchMatchesFromApi([EnglishPremierLeagueId, ChampionsLeagueId]);
        await saveRawMatchesResponseToDynamoDB(competitions);

    } catch (error) {
        console.log(error);
    }
}

const fetchMatchesFromApi = async (competitionIds: number[]) => {
    const API_KEY: string | undefined = process.env.AWS_APP_SERVICE_KEY;
    const API_URL: string | undefined = process.env.AWS_APP_API_URL;

    // Fixed: Removed duplicate check and fixed typo
    if (!API_URL || !API_KEY) {
        throw new Error("Missing API configuration")
    }

    const matches: Record<string, MatchesResponse> = {};
    for (const competition of competitionIds) {
        matches[competition] = await (await axios.get(`${API_URL}/competitions/${competition}/matches`, {
            headers: {
                'X-Auth-Token': API_KEY,
            },
        })).data;
    }
    return matches;
}

const saveRawMatchesResponseToDynamoDB = async (competitions: Record<string, MatchesResponse>): Promise<void> => {
    for (const competitionId in competitions) {
        const competitionData = competitions[competitionId];

        // Add validation for required fields
        if (!competitionData || !competitionData.filters || competitionData.filters.season === undefined) {
            console.error(`Invalid competition data for ${competitionId}:`, competitionData);
            throw new Error(`Missing required season data for competition ${competitionId}`);
        }

        console.log('COMPT_ID', competitionId, 'SEASON', competitionData.filters.season);
        console.log('LENGTH', competitionData.matches?.length || 0);

        const item = {
            PartitionKey: `COMPETITION_ID#${competitionId}`,
            SortKey: `MATCHES_DATA#SEASON${competitionData.filters.season}`,
            competitionId: parseInt(competitionId),
            rawData: competitionData,
            lastUpdated: new Date().toISOString(),
            matchCount: competitionData.matches?.length || 0
        };

        // Validate that required keys have values
        if (!item.PartitionKey || !item.SortKey) {
            console.error('Invalid item keys:', { PK: item.PartitionKey, SK: item.SortKey });
            throw new Error(`Invalid DynamoDB keys for competition ${competitionId}`);
        }

        const command = new PutCommand({
            TableName: process.env.AWS_TABLE_NAME,
            Item: item
        });

        try {
            await docClient.send(command);
            console.log(`Successfully saved raw matches data for competition ${competitionId}`);
        } catch (error) {
            console.error(`Error saving raw matches data for competition ${competitionId}:`, error);
            throw error;
        }
    }
};