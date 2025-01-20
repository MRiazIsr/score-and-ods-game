import { selectFactory } from "@/app/server/modules/factories/authFactory/AuthFactorySelector";
import type { User } from "@/app/server/modules/user/types/userTypes";

export class AuthService {
    public async createUser(user: User): Promise<{message: string}> {
        console.log("Creating new user AuthService");
        const authFactory = selectFactory(process.env.DB_TYPE);
        const userManager = authFactory.createUserManager();

        return { message: await userManager.createUser(user) };
    }
}