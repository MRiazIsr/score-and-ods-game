import { selectFactory } from "@/app/server/modules/factories/competitionsFactory/CompetitionsFactorySelector";
import { Match, Competition, ScoreBoardData } from "@/app/server/modules/competitions/types";

export interface TeamFormResult {
    matchId: number;
    utcDate: string;
    opponent: string;
    isHome: boolean;
    result: "W" | "D" | "L";
    scored: number;
    conceded: number;
}


export class CompetitionsService {

    async getCompetitionActiveMatches(competitionId: number, matchDay: number, userId: string): Promise<Match[]> {
        const competitionFactory = selectFactory(process.env.DB_TYPE);
        const competitionsManager = competitionFactory.createCompetitionsManager();
        const activeSeason: number = await competitionsManager.getActiveSeason(competitionId);

        return await competitionsManager.getAllMatchesWithPredictions(competitionId, matchDay, activeSeason, userId);
    }

    async getCompetitionData(competitionId: number): Promise<Competition> {
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

    async getAllCompetitionMatchDays(competitionId: number): Promise<number[]> {
        const competitionFactory = selectFactory(process.env.DB_TYPE);
        const competitionsManager = competitionFactory.createCompetitionsManager();
        const competitionData: Competition = await competitionsManager.getCompetitionData(competitionId);

        return competitionData.matchDays;
    }

    async getRecentMatchResults(teamId: number, competitionIds: number[], limit = 5): Promise<TeamFormResult[]> {
        const factory = selectFactory(process.env.DB_TYPE);
        const manager = factory.createCompetitionsManager();

        const all: TeamFormResult[] = [];

        for (const cid of competitionIds) {
            const season = await manager.getActiveSeason(cid);
            if (!season) continue;

            const matches: Match[] = await manager.getAllMatches(cid, season);
            for (const match of matches) {
                if (match.status !== "FINISHED") continue;
                const home = match.score.fullTime.home;
                const away = match.score.fullTime.away;
                if (home === null || away === null) continue;

                const isHome = match.homeTeam.id === teamId;
                const isAway = match.awayTeam.id === teamId;
                if (!isHome && !isAway) continue;

                const scored = isHome ? home : away;
                const conceded = isHome ? away : home;
                const result: "W" | "D" | "L" = scored > conceded ? "W" : scored < conceded ? "L" : "D";

                all.push({
                    matchId: match.id,
                    utcDate: match.utcDate,
                    opponent: isHome ? match.awayTeam.name : match.homeTeam.name,
                    isHome,
                    result,
                    scored,
                    conceded,
                });
            }
        }

        all.sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());
        return all.slice(0, limit);
    }

    async findMatchById(matchId: number, competitionIds: number[]): Promise<{ match: Match; season: number } | null> {
        const factory = selectFactory(process.env.DB_TYPE);
        const manager = factory.createCompetitionsManager();

        for (const cid of competitionIds) {
            const season = await manager.getActiveSeason(cid);
            if (!season) continue;

            const matches: Match[] = await manager.getAllMatches(cid, season);
            const match = matches.find((m) => m.id === matchId);
            if (match) return { match, season };
        }
        return null;
    }
}