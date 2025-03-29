import { IDynamoDbUserDataAccess}  from "@/app/server/modules/user/DynamoDbUserManager/IDynamoDbUserDataAccess";
import type { PutCommandOutput, GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import { UserModel } from "@/app/server/models/UserModel"
import type { DbUser } from "@/app/server/modules/user/types/userTypes";

export class DynamoDbUserDataAccess implements IDynamoDbUserDataAccess {

    async saveUserNameRowWithId(userName: string, userId: string): Promise<PutCommandOutput>
    {
        console.log("Creating new user DynamoDbUserDataAccess");
        return await UserModel.saveUserNameRowWithId(userName, userId);
    }

    async saveUser(user: DbUser): Promise<PutCommandOutput>
    {
        return await UserModel.saveUser(user);
    }

    async getUserIdByUserName(userName: string): Promise<GetCommandOutput>
    {
        return await UserModel.getUserId(userName);
    }

    async getUserDataById(userId: string): Promise<GetCommandOutput>
    {
        return await UserModel.getUserDataById(userId);
    }
}