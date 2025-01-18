import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { type PutCommandInput, type PutCommandOutput } from "@aws-sdk/lib-dynamodb";

export class UserModel {
    //TODO DBUserPater: pk: USERID#UID sk: DATA (or sk: GAME_ID#1) AND Service row pk: USERNAME#pechata sk: userId { userId: UID}. If user changing userName we will destroy this and create new one
    private client: DynamoDBClient = new DynamoDBClient();
    private documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(this.client);
    private tableName: string = (() => {
        if (!process.env.TABLE_NAME) {
            throw new Error('Cannot get table name');
        }
        return process.env.TABLE_NAME;
    })();
}