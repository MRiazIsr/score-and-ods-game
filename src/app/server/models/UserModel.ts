import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { type PutCommandOutput } from "@aws-sdk/lib-dynamodb";
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
        console.log("Creating new user DynamoDbUserDataAccess");

        const command = new PutCommand({
            TableName: this.tableName,
            Item: {
                PartitionKey: 'USERNAME#' + userName,
                SortKey: 'USERID',
                userId: userId,
            },
        });

        const response: PutCommandOutput = await this.documentClient.send(command);
        console.log(response);
        return response;
    }

    static async saveUser(dbUser: DbUser): Promise<PutCommandOutput> {
        const command = new PutCommand({
            TableName: this.tableName,
            Item: dbUser,
        });

        const response: PutCommandOutput = await this.documentClient.send(command);
        console.log(response);
        return response;
    }
}