import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    PutCommandInput,
    PutCommandOutput,
    QueryCommand,
    QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import type { GetCommandInput, GetCommandOutput } from "@aws-sdk/lib-dynamodb";

export class CompetitionModel {
    private static client = new DynamoDBClient({
        region: process.env.AWS_REGION || 'eu-central-1',
        // Endpoint только для локальной разработки
        ...(process.env.NODE_ENV === 'development' && {
            endpoint: 'http://localhost:8000'
        })
    });

    private static documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(this.client);
    private static tableName: string = (() => {
        console.log('ENV', process.env.TABLE_NAME);
        if (!process.env.TABLE_NAME) {
            throw new Error('Cannot get table name');
        }
        return process.env.TABLE_NAME;
    })();

    static async getCompetitionData(competitionId: number, season: number): Promise<import("@aws-sdk/lib-dynamodb").QueryCommandOutput> {
         const pk = `COMPETITION_ID#${competitionId}`;
         // Query ALL matchdays for the season using begins_with
        const input: QueryCommandInput = {
            TableName: this.tableName,
            KeyConditionExpression: "PartitionKey = :pk AND begins_with(SortKey, :skPrefix)",
            ExpressionAttributeValues: {
                ":pk": pk,
                ":skPrefix": `SEASON#${season}#MATCHDAY#`
            }
        };
        // This will return Items: [ { matches: [...], matchday: 1 }, { matches: [...], matchday: 2 }, ... ]
        return this.documentClient.send(new QueryCommand(input));
    }

    static async getCompetitionMatchDayMatches(competitionId: number, season: number, matchDay: number): Promise<GetCommandOutput> {
         const pk = `COMPETITION_ID#${competitionId}`;
         const sk = `MATCHES_DATA#SEASON#${season}`;
         const input: GetCommandInput = {
            TableName: this.tableName,
            Key: {
                PartitionKey: pk,
                SortKey: sk
            }
        };
        return this.documentClient.send(new GetCommand(input));
    }

    static async getCompetitionStandings(competitionId: number, season: number): Promise<GetCommandOutput> {
        return this.documentClient.send(new GetCommand({
            TableName: this.tableName,
            Key: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: `SEASON#${season}#STANDINGS`
            }
        }));
    }

    static async getCompetitionScorers(competitionId: number, season: number): Promise<GetCommandOutput> {
        return this.documentClient.send(new GetCommand({
            TableName: this.tableName,
            Key: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: `SEASON#${season}#SCORERS`
            }
        }));
    }

    static async getCompetitionTeams(competitionId: number, season: number): Promise<GetCommandOutput> {
        return this.documentClient.send(new GetCommand({
            TableName: this.tableName,
            Key: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: `SEASON#${season}#TEAMS`
            }
        }));
    }

    static async getCompetitionHelperData(competitionId: number): Promise<GetCommandOutput> {
        const input: GetCommandInput = {
            TableName: this.tableName,
            Key: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: `HELPER`
            }
        };

        const command = new GetCommand(input);
        return this.documentClient.send(command);
    }

    static async getMatchScore(userId: string, competitionId: number, season: number, matchDay: number, matchId: number): Promise<GetCommandOutput> {
        const input: GetCommandInput = {
            TableName: this.tableName,
            Key: {
                PartitionKey: `USER#${userId}`,
                SortKey: `COMPETITION_ID#${competitionId}SEASON#${season}MATCH_DAY#${matchDay}MATCH#${matchId}`,
            }
        }

        const command = new GetCommand(input);
        return this.documentClient.send(command);
    }

    static async saveMatchScore(competitionId: number, matchDay: number, season: number, matchId: number, score: { away: number; home: number }, userId: string): Promise<PutCommandOutput> {
        const input: PutCommandInput = {
            TableName: this.tableName,
            Item: {
                PartitionKey: `USER#${userId}`,
                SortKey: `COMPETITION_ID#${competitionId}SEASON#${season}MATCH_DAY#${matchDay}MATCH#${matchId}`,
                awayScore: score.away,
                homeScore: score.home,
            }
        }

        const command = new PutCommand(input);
        return this.documentClient.send(command);
    }
}