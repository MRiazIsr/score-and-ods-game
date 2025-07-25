import { selectFactory } from "@/app/server/modules/factories/competitionsFactory/CompetitionsFactorySelector";
import { Match, Competition, ScoreBoardData } from "@/app/server/modules/competitions/types";


export class CompetitionsService {

    async getCompetitionActiveMatches(competitionId: number, userId: string): Promise<Match[]> {
        const competitionFactory = selectFactory(process.env.DB_TYPE);
        const competitionsManager = competitionFactory.createCompetitionsManager();
        const activeSeason: number = await competitionsManager.getActiveSeason(competitionId);

        return await competitionsManager.getActiveDayMatches(competitionId, activeSeason, userId);
    }

    async getCompetitionData(competitionId: number): Promise<Competition[]> {
        const competitionFactory = selectFactory(process.env.DB_TYPE);
        const competitionsManager = competitionFactory.createCompetitionsManager();
        return await competitionsManager.getCompetitionData(competitionId);
    }

    async saveMatchScore(competitionId: number, matchDay: number, matchId: number, score: { home: number, away: number }, userId: string): Promise<boolean> {
        const competitionFactory = selectFactory(process.env.DB_TYPE);
        const competitionsManager = competitionFactory.createCompetitionsManager();

        return  await competitionsManager.saveMatchScore(competitionId, matchDay, matchId, score, userId);
    }

    async getScoreBoardData(competitionId: number): Promise<ScoreBoardData> {
        const competitionFactory = selectFactory(process.env.DB_TYPE);
        const competitionsManager = competitionFactory.createCompetitionsManager();
        return await competitionsManager.getScoreBoardData(competitionId);
    }
}