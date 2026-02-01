import {IUserManager} from "@/app/server/modules/user/IUserManager";
import {DynamoDbUserManager} from "@/app/server/modules/user/DynamoDbUserManager/DynamoDbUserManager";
import {DynamoDbUserDataAccess} from "@/app/server/modules/dataAccess/DynamoDbUserDataAccess";
import {IAuthFactory} from "@/app/server/modules/factories/authFactory/IAuthFactory";
import {AuthService} from "@/app/server/services/auth/AuthService";

export class DynamoDbAuthFactory implements IAuthFactory {
    createUserManager(): IUserManager {
        return new DynamoDbUserManager(new DynamoDbUserDataAccess());
    }

    createAuthService(): AuthService {
        return new AuthService();
    }
}