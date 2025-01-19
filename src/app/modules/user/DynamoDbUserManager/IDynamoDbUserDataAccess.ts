import type {PutCommandOutput} from "@aws-sdk/lib-dynamodb";

export interface IDynamoDbUserDataAccess {
    saveUserNameRowWithId(userName: string, userId: string): Promise<PutCommandOutput>
    saveUser(dbUser: DbUser): Promise<boolean>
}