import {IDynamoDbUserDataAccess} from "@/app/modules/user/DynamoDbUserManager/IDynamoDbUserDataAccess";
import type {PutCommandOutput} from "@aws-sdk/lib-dynamodb";

export class DynamoDbUserDataAccess implements IDynamoDbUserDataAccess {
    async saveUserNameRowWithId(userName: string, userId: string): Promise<boolean>
    {
        return await userModel.saveUserNameUserId(userName, userId);
    }

    async saveUser(dbUser: DbUser): Promise<PutCommandOutput>
    {
        return await userModel.saveUser(dbUser);
    }
}