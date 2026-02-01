import { ICompetitionsManager } from "@/app/server/modules/competitions/ICompetitionsManager";
import { CompetitionsService } from "@/app/server/services/auth/CompetitionsService";

export interface ICompetitionsFactory {
    createCompetitionsManager(): ICompetitionsManager;
    createCompetitionsService(): CompetitionsService;
}