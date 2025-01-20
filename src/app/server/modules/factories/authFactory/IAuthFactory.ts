import {AuthService} from "@/app/server/services/auth/AuthService";
import {DynamoDbUserManager} from "@/app/server/modules/user/DynamoDbUserManager/DynamoDbUserManager";

export interface IAuthFactory {
    createUserManager(): DynamoDbUserManager;
    createAuthService(): AuthService;
}