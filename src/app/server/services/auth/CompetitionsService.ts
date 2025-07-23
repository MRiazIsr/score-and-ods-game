import { selectFactory } from "@/app/server/modules/factories/competitionsFactory/CompetitionsFactorySelector";
import { Match, Competition } from "@/app/server/modules/competitions/types";


export class CompetitionsService {

    async getCompetitionActiveMatches(competitionId: number): Promise<Match[]> {
        const competitionFactory = selectFactory(process.env.DB_TYPE);
        const competitionsManager = competitionFactory.createCompetitionsManager();
        const activeSeason: number = await competitionsManager.getActiveSeason(competitionId);

        return await competitionsManager.getActiveDayMatches(competitionId, activeSeason);
    }

    async getCompetitionData(competitionId: number): Promise<Competition[]> {
        const competitionFactory = selectFactory(process.env.DB_TYPE);
        const competitionsManager = competitionFactory.createCompetitionsManager();
        console.log(competitionId);
        console.log(await competitionsManager.getCompetitionData(competitionId));
        return await competitionsManager.getCompetitionData(competitionId);
    }
}