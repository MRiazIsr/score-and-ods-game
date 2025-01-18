import { selectFactory } from "@/app/modules/factories/authFactory/AuthFactorySelector";

export class AuthService {
    public async signUp(user: User) {
        const authFactory = selectFactory(process.env.DB_TYPE);
        const userManager = authFactory.createUserManager();

        return await userManager.createUser(user);
    }
}