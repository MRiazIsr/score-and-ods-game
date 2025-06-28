import { selectFactory } from "@/app/server/modules/factories/authFactory/AuthFactorySelector";
import type { SessionUser, User} from "@/app/server/modules/user/types/userTypes";
import { Md5 } from 'ts-md5'
import { DynamoDbAuthFactory } from "@/app/server/modules/factories/authFactory/DynamoDbAuthFactory";
import { DynamoDbUserManager } from "@/app/server/modules/user/DynamoDbUserManager/DynamoDbUserManager";
import { FormFieldsKeys } from "@/app/server/entities/FormFieldsKeys";
import type { DbUser } from "@/app/server/modules/user/types/userTypes";

export class AuthService {

    public async createUser(user: User): Promise<{message: string}>
    {
        console.log("Creating new user AuthService");
        const authFactory: DynamoDbAuthFactory = selectFactory(process.env.DB_TYPE);
        const userManager: DynamoDbUserManager = authFactory.createUserManager();

        const userExists: string = await userManager.getUserIdByUserName(user.userName);
        if (userExists) {
            throw new Error(`User with this user name already exists`, { cause: FormFieldsKeys.signUpGroup.USERNAME});
        }

        return { message: await userManager.createUser(user) };
    }

    public async signIn(user: User): Promise<{status: boolean, message: string, sessionUser: SessionUser}>
    {
        const authFactory: DynamoDbAuthFactory = selectFactory(process.env.DB_TYPE);
        const userManager: DynamoDbUserManager = authFactory.createUserManager();

        const userId: string = await userManager.getUserIdByUserName(user.userName);
        if (!userId) {
            throw new Error("User not found");
        }

        const userData: DbUser = await userManager.getUserDataById(userId);

        if ( (!userData.password) && (userData.password !== Md5.hashStr(user.password + userData.salt))) {
            throw new Error("Passwords do not match");
        }
        const sessionUser: SessionUser = {
            name: userData.name,
            email: userData.email,
            userId: userId,
            userName: userData.userName,
            userType: userData.userType,
        }

        return { status: true, message: "User Logged In Successfully", sessionUser: sessionUser };
    }
}