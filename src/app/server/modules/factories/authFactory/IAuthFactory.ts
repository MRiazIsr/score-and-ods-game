import {IUserManager} from "@/app/server/modules/user/IUserManager";
import {AuthService} from "@/app/server/services/auth/AuthService";

export interface IAuthFactory {
    createUserManager(): IUserManager;
    createAuthService(): AuthService;
}