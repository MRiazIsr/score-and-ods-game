import {AuthService} from "@/app/services/auth/AuthService";
import {DynamoDbUserManager} from "@/app/modules/user/DynamoDbUserManager/DynamoDbUserManager";

export interface IAuthFactory {
    createUserManager(): DynamoDbUserManager;
    createAuthService(): AuthService;
}