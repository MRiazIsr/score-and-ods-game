import { ICompetitionsFactory } from "@/app/server/modules/factories/competitionsFactory/ICompetitionsFactory";
import { PrismaCompetitionsManager } from "@/app/server/modules/competitions/PrismaCompetitionsManager";
import { CompetitionsService } from "@/app/server/services/auth/CompetitionsService";
import { DynamoDbCompetitionsDataAccess } from "@/app/server/modules/dataAccess/DynamoDbCompetitionsDataAccess";

export class PrismaCompetitionsFactory implements ICompetitionsFactory {
    createCompetitionsManager(): PrismaCompetitionsManager {
        return new PrismaCompetitionsManager(new DynamoDbCompetitionsDataAccess());
    }

    createCompetitionsService(): CompetitionsService {
        return new CompetitionsService();
    }
}
