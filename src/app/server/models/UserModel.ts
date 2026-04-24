import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    PutCommand,
    PutCommandInput,
    PutCommandOutput,
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandInput,
    GetCommandOutput,
    UpdateCommand,
    UpdateCommandOutput,
    UpdateCommandInput,
    QueryCommandOutput,
    QueryCommandInput,
    QueryCommand,
    BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import type { DbUser } from "@/app/server/modules/user/types/userTypes";


export class UserModel {
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

    static async batchGetMatchScores(
        userIds: string[],
        competitionId: number,
        season: number,
        matchDay: number,
        matchId: number,
    ): Promise<Array<{ homeScore: number; awayScore: number }>> {
        if (!userIds.length) return [];

        const sortKey = `COMPETITION_ID#${competitionId}SEASON#${season}MATCH_DAY#${matchDay}MATCH#${matchId}`;
        const results: Array<{ homeScore: number; awayScore: number }> = [];

        // DynamoDB BatchGet caps at 100 keys per request
        for (let i = 0; i < userIds.length; i += 100) {
            const chunk = userIds.slice(i, i + 100);
            const response = await this.documentClient.send(
                new BatchGetCommand({
                    RequestItems: {
                        [this.tableName]: {
                            Keys: chunk.map((uid) => ({
                                PartitionKey: `USER#${uid}`,
                                SortKey: sortKey,
                            })),
                            ProjectionExpression: "homeScore, awayScore",
                        },
                    },
                }),
            );

            const items = response.Responses?.[this.tableName] ?? [];
            for (const item of items) {
                if (typeof item.homeScore === "number" && typeof item.awayScore === "number") {
                    results.push({ homeScore: item.homeScore, awayScore: item.awayScore });
                }
            }
        }

        return results;
    }

    static async addUserToGlobalList(user: { userName: string; userId: string }): Promise<UpdateCommandOutput> {
        const input: UpdateCommandInput = {
            TableName: this.tableName,
            Key: {
                PartitionKey: "USERS",
                SortKey: "DATA",
            },

            UpdateExpression:
                "SET usersData = list_append(if_not_exists(usersData, :empty), :new)",
            ExpressionAttributeValues: {
                ":new": [user],
                ":empty": [],
                ":uid": user.userId,
            },

            ConditionExpression: "not contains(usersData.userId, :uid)",

            ReturnValues: "ALL_NEW",
        };
        const command = new UpdateCommand(input);
        return this.documentClient.send(command);
    }
}