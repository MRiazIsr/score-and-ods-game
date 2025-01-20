import type { PutCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { DbUser } from "@/app/server/modules/user/types/userTypes";

export interface IDynamoDbUserDataAccess {
    saveUserNameRowWithId(userName: string, userId: string): Promise<PutCommandOutput>
    saveUser(dbUser: DbUser): Promise<PutCommandOutput>
}