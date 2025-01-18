import {DynamoDbUserDataAccess} from "@/app/modules/dataAccess/DynamoDbUserDataAccess";
import {randomUUID} from "node:crypto";
import {IDynamoDbUserDataAccess} from "@/app/modules/user/DynamoDbUserManager/IDynamoDbUserDataAccess";

export class DynamoDbUserManager {
    private dataAccess: IDynamoDbUserDataAccess;

    constructor(userDataAccess: IDynamoDbUserDataAccess) {
        this.dataAccess = userDataAccess;
    }

    public async createUser(user: User): Promise<boolean> {
        const userId: string = randomUUID();
        const dbUser: DynamoDbUser = {
            pk: userId,
            sk: 'Data',
            email: user.email ?? '',
            password: user.password,
            name: user.name,
            userName: user.userName,
        }

        const isUserNameSaved = await this.dataAccess.saveUserNameRowWithId(user.userName.toLowerCase(), userId);
        const isUserSaved = await this.dataAccess.saveUser(dbUser)
        if (!isUserNameSaved) {
            throw new Error("User name already exists");
        }
        if (!isUserSaved) {
            throw new Error("User already exists");
        }

        return true;
    }
}