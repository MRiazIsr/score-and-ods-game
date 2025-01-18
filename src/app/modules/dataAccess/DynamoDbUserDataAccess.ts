import {IDynamoDbUserDataAccess} from "@/app/modules/user/DynamoDbUserManager/IDynamoDbUserDataAccess";

export class DynamoDbUserDataAccess implements IDynamoDbUserDataAccess {
    async saveUserNameRowWithId(userName: string, userId: string): Promise<boolean>
    {
        return await userModel.saveUserNameUserId(userName, userId);
    }

    async saveUser(dbUser: DbUser): Promise<boolean>
    {
        return await userModel.saveUser(dbUser);
    }
}