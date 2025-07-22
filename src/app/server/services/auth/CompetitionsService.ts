import { selectFactory } from "@/app/server/modules/factories/competitionsFactory/CompetitionsFactorySelector";

export class CompetitionsService {

    async getCompetitionActiveMatches(competitionId: number) {
        const competitionFactory = selectFactory(process.env.DB_TYPE);
        const competitionsManager = competitionFactory.createCompetitionsManager();
        const activeSeason: number = await competitionsManager.getActiveSeason(competitionId);

        return await competitionsManager.getActiveDayMatches(competitionId, activeSeason);
    }
}