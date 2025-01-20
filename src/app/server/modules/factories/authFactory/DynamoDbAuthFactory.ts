import {IAuthFactory} from "@/app/server/modules/factories/authFactory/IAuthFactory";
import {AuthService} from "@/app/server/services/auth/AuthService";
import {DynamoDbUserDataAccess} from "@/app/server/modules/dataAccess/DynamoDbUserDataAccess";
import {DynamoDbUserManager} from "@/app/server/modules/user/DynamoDbUserManager/DynamoDbUserManager";

export class DynamoDbAuthFactory implements IAuthFactory {
    createUserManager(): DynamoDbUserManager {
        return new DynamoDbUserManager(new DynamoDbUserDataAccess());
    }

    createAuthService(): AuthService {
        return new AuthService();
    }
}