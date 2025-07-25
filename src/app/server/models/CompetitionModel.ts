import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    PutCommandInput,
    PutCommandOutput,
    ScanCommand,
    ScanCommandInput,
    ScanCommandOutput
} from "@aws-sdk/lib-dynamodb";
import type { GetCommandInput, GetCommandOutput } from "@aws-sdk/lib-dynamodb";

export class CompetitionModel {
    private static client: DynamoDBClient = new DynamoDBClient({
        region: 'us-east-1',
        endpoint: "http://localhost:8000",
        credentials: {
            accessKeyId: "fakeKey",
            secretAccessKey: "fakeSecret"
        }
    });
    private static documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(this.client);
    private static tableName: string = (() => {
        console.log('ENV', process.env.TABLE_NAME);
        if (!process.env.TABLE_NAME) {
            throw new Error('Cannot get table name');
        }
        return process.env.TABLE_NAME;
    })();

    static async getCompetitionData(competitionId: number, season: number): Promise<GetCommandOutput> {
        const input: GetCommandInput = {
            TableName: this.tableName,
            Key: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: `MATCHES_DATA#SEASON#${season}`
            }
        }

        const command = new GetCommand(input);
        return this.documentClient.send(command);
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