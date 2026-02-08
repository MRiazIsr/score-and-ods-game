import {IAuthFactory} from "@/app/server/modules/factories/authFactory/IAuthFactory";
import {AuthService} from "@/app/server/services/auth/AuthService";
import {PrismaUserManager} from "@/app/server/modules/user/PrismaUserManager";
import {IUserManager} from "@/app/server/modules/user/IUserManager";

export class PrismaAuthFactory implements IAuthFactory {
    createUserManager(): IUserManager {
        return new PrismaUserManager();
    }

    createAuthService(): AuthService {
        return new AuthService();
    }
}
