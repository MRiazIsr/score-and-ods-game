import type { GetCommandOutput, PutCommandOutput } from "@aws-sdk/lib-dynamodb";
import type { DbUser } from "@/app/server/modules/user/types/userTypes";

export interface IDynamoDbUserDataAccess {
    saveUserNameRowWithId(userName: string, userId: string): Promise<PutCommandOutput>
    saveUser(user: DbUser): Promise<PutCommandOutput>
    getUserIdByUserName(userName: string): Promise<GetCommandOutput>
    getUserDataById(userId: string): Promise<GetCommandOutput>
    addUserToGlobalList(user: { userName: string; userId: string }): Promise<PutCommandOutput>
}