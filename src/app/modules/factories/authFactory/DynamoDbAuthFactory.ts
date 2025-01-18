import {IAuthFactory} from "@/app/modules/factories/authFactory/IAuthFactory";
import {AuthService} from "@/app/services/auth/AuthService";
import {DynamoDbUserDataAccess} from "@/app/modules/dataAccess/DynamoDbUserDataAccess";
import {DynamoDbUserManager} from "@/app/modules/user/DynamoDbUserManager/DynamoDbUserManager";

export class DynamoDbAuthFactory implements IAuthFactory {
    createUserManager(): DynamoDbUserManager {
        return new DynamoDbUserManager(new DynamoDbUserDataAccess());
    }

    createAuthService(): AuthService {
        return new AuthService();
    }
}