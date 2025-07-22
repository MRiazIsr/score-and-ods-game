import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
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
        return await this.documentClient.send(command);
    }

    static async getCompetitionsActiveSeason(competitionId: number): Promise<GetCommandOutput> {
        const input: GetCommandInput = {
            TableName: this.tableName,
            Key: {
                PartitionKey: `COMPETITION_ID#${competitionId}`,
                SortKey: `HELPER`
            }
        };

        const command = new GetCommand(input);
        return await this.documentClient.send(command);
    }
}