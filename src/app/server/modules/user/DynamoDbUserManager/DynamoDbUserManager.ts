import {IDynamoDbUserDataAccess} from "@/app/server/modules/user/DynamoDbUserManager/IDynamoDbUserDataAccess";
import type {DbUser, User} from "@/app/server/modules/user/types/userTypes";
import type {GetCommandOutput} from "@aws-sdk/lib-dynamodb";
import {UserTypeEntity} from "@/app/server/entities/UserTypesEntity";
import {Md5} from 'ts-md5'

export class DynamoDbUserManager {
    private dataAccess: IDynamoDbUserDataAccess;

    constructor(userDataAccess: IDynamoDbUserDataAccess) {
        this.dataAccess = userDataAccess;
    }

    public async createUser(user: User): Promise<string>
    {
        const userId: string = crypto.randomUUID();
        const salt: string = crypto.randomUUID();

        const formatedUser: DbUser = {
            userId: userId,
            name: user.name ?? '',
            email: user.email ?? '',
            userName: user.userName,
            password: Md5.hashStr(user.password + salt),
            userType: user.userType ?? UserTypeEntity.GAMER,
            salt: salt,
        }
        const isUserNameSaved = await this.dataAccess.saveUserNameRowWithId(formatedUser.userName, userId);
        const isUserSaved = await this.dataAccess.saveUser(formatedUser)

        if (!isUserNameSaved) {
            throw new Error("User name already exists");
        }
        if (!isUserSaved) {
            throw new Error("User already exists");
        }

        return 'User created successfully';
    }

    public async getUserIdByUserName(userName: string): Promise<string>
    {
        const userIdOutput: GetCommandOutput = await this.dataAccess.getUserIdByUserName(userName);

        return userIdOutput.Item?.userId;
    }

    public async getUserDataById(userId: string): Promise<DbUser>
    {
        const userDataOutput = await this.dataAccess.getUserDataById(userId);
        if (!userDataOutput.Item) {
            throw new Error("User data not found");
        }

        return {
            name: userDataOutput.Item.name,
            email: userDataOutput.Item.email,
            userName: userDataOutput.Item.userName,
            password: userDataOutput.Item.password,
            salt: userDataOutput.Item.salt,
            userType: userDataOutput.Item.userId,
            userId: '',
        };
    }
}