//import { randomUUID } from "node:crypto";
import { IDynamoDbUserDataAccess } from "@/app/server/modules/user/DynamoDbUserManager/IDynamoDbUserDataAccess";
import type { DbUser, User } from "@/app/server/modules/user/types/userTypes";

export class DynamoDbUserManager {
    private dataAccess: IDynamoDbUserDataAccess;

    constructor(userDataAccess: IDynamoDbUserDataAccess) {
        this.dataAccess = userDataAccess;
    }

    public async createUser(user: User): Promise<string> {
        console.log("Creating new user DynamoDbUserManager");

        const userId: string = crypto.randomUUID();
        console.log("Creating new user TEST");

        console.log("DynamoDbUserManager userId: ", userId);

        const dbUser: DbUser = {
            PartitionKey: 'USERID#' + userId,
            SortKey: 'Data',
            name: user.name ?? '',
            email: user.email ?? '',
            userName: user.userName,
            password: user.password,
        }
        console.log("DynamoDbUserManager dbUser: ", dbUser);

        const isUserNameSaved = await this.dataAccess.saveUserNameRowWithId(user.userName.toLowerCase(), userId);

        console.log("DynamoDbUserManager isUserNameSaved: ", isUserNameSaved);
        const isUserSaved = await this.dataAccess.saveUser(dbUser)
        console.log("DynamoDbUserManager isUserSaved: ", isUserSaved);

        if (!isUserNameSaved) {
            throw new Error("User name already exists");
        }
        if (!isUserSaved) {
            throw new Error("User already exists");
        }

        return 'User created successfully';
    }
}