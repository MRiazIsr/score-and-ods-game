import { DynamoDbCompetitionsManager } from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/DynamoDbCompetitionsManager";
import { DynamoDbCompetitionsDataAccess } from "@/app/server/modules/dataAccess/DynamoDbCompetitionsDataAccess";
import { ICompetitionsFactory } from "@/app/server/modules/factories/competitionsFactory/ICompetitionsFactory";
import { CompetitionsService } from "@/app/server/services/auth/CompetitionsService";

export class DynamoDbCompetitionsFactory implements ICompetitionsFactory {
    createCompetitionsManager(): DynamoDbCompetitionsManager {
        return new DynamoDbCompetitionsManager(new DynamoDbCompetitionsDataAccess());
    }

    createCompetitionsService(): CompetitionsService {
        return new CompetitionsService();
    }
}