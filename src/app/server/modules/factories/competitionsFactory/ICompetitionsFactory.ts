import { DynamoDbCompetitionsManager } from "@/app/server/modules/competitions/DynamoDbCompetitionsManager/DynamoDbCompetitionsManager";
import { CompetitionsService } from "@/app/server/services/auth/CompetitionsService";

export interface ICompetitionsFactory {
    createCompetitionsManager(): DynamoDbCompetitionsManager;
    createCompetitionsService(): CompetitionsService;
}