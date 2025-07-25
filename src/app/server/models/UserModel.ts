import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    PutCommand,
    DynamoDBDocumentClient,
    GetCommand,
    ScanCommandOutput,
    ScanCommandInput, ScanCommand, QueryCommandOutput, QueryCommandInput, QueryCommand
} from "@aws-sdk/lib-dynamodb";
import type { PutCommandInput, PutCommandOutput, GetCommandInput, GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { DbUser } from "@/app/server/modules/user/types/userTypes";


export class UserModel {
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

    static async saveUserNameRowWithId(userName: string, userId: string): Promise<PutCommandOutput> {
        const input: PutCommandInput = {
            TableName: this.tableName,
            Item: {
                PartitionKey: 'USERNAME#' + userName,
                SortKey: 'USERID',
                userId: userId,
            },
        }
        const command = new PutCommand(input);

        return await this.documentClient.send(command);
    }

    static async saveUser(user: DbUser): Promise<PutCommandOutput> {
        const input: PutCommandInput = {
            TableName: this.tableName,
            Item: {
                PartitionKey: 'USERID#' + user.userId,
                SortKey: 'DATA',
                name: user.name ?? '',
                email: user.email ?? '',
                password: user.password,
                userName: user.userName,
                userType: user.userType,
                salt: user.salt,
            }
        };

        const command = new PutCommand(input);
        return await this.documentClient.send(command);
    }

    static async getUserId(userName: string): Promise<GetCommandOutput> {
        const input: GetCommandInput = {
            TableName: this.tableName,
            Key: {
                PartitionKey: 'USERNAME#' + userName,
                SortKey: 'USERID',
            }
        }

        const command = new GetCommand(input);
        return await this.documentClient.send(command);
    }

    static async getUserDataById(userId: string): Promise<GetCommandOutput> {
        const input: GetCommandInput = {
            TableName: this.tableName,
            Key: {
                PartitionKey: 'USERID#' + userId,
                SortKey: 'DATA',
            }
        };

        const command = new GetCommand(input);
        return await this.documentClient.send(command);
    }


    static async getAllUsers(): Promise<GetCommandOutput> {
        const input: GetCommandInput = {
            TableName: this.tableName,
            Key: {
                PartitionKey: "USERS",
                SortKey: "DATA"
            },
        };

        const command = new GetCommand(input);
        return this.documentClient.send(command);
    }

    static async getUserPredictions(userId: string, competitionId: number, season: number): Promise<QueryCommandOutput> {
        const skPrefix = `COMPETITION_ID#${competitionId}SEASON#${season}`;

        const input: QueryCommandInput = {
            TableName: this.tableName,
            KeyConditionExpression:
                "PartitionKey = :pk AND begins_with(SortKey, :sk)",
            ExpressionAttributeValues: {
                ":pk": `USER#${userId}`,
                ":sk": skPrefix
            },
            ProjectionExpression: "SortKey, homeScore, awayScore",
        };

        const command = new QueryCommand(input);
        return this.documentClient.send(command);
    }
}