import { selectFactory } from "@/app/server/modules/factories/competitionsFactory/CompetitionsFactorySelector";
import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";
import type { Competition, Match } from "@/app/server/modules/competitions/types";
import { UserModel } from "@/app/server/models/UserModel";
import { computePoints } from "@/app/server/modules/competitions/scoring";
import { getSession } from "@/app/actions/auth";
import LeaguesClient, { type LeagueSummary } from "./leaguesClient";

export const revalidate = 300;

const UPCOMING_STATUSES = new Set(["SCHEDULED", "TIMED"]);

function extractMatchId(sortKey: string): number | null {
    const m = sortKey.match(/MATCH#(\d+)$/);
    return m ? parseInt(m[1], 10) : null;
}

export default async function LeaguesPage() {
    const session = await getSession();
    const userId = session.user?.userId;

    const factory = selectFactory(process.env.DB_TYPE);
    const manager = factory.createCompetitionsManager();

    const leagues: LeagueSummary[] = [];

    for (const cid of CompetitionsEntity.competitionsIdArray) {
        const competition: Competition | undefined = await manager.getCompetitionData(cid);
        if (!competition) continue;

        const season = await manager.getActiveSeason(cid);
        if (!season) {
            leagues.push({
                competition,
                fixturesCount: 0,
                userPoints: 0,
                nextFixtures: [],
                season: 0,
            });
            continue;
        }

        const matches: Match[] = await manager.getAllMatches(cid, season);
        const scheduled = matches
            .filter((m) => UPCOMING_STATUSES.has(m.status) && !!m.homeTeam?.name && !!m.awayTeam?.name)
            .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
            .slice(0, 4);

        let userPoints = 0;
        if (userId) {
            const preds = await UserModel.getUserPredictions(userId, cid, season);
            const predMap = new Map<number, { home: number; away: number }>();
            (preds.Items ?? []).forEach((p) => {
                const id = extractMatchId(p.SortKey as string);
                if (id !== null) predMap.set(id, { home: p.homeScore, away: p.awayScore });
            });

            for (const match of matches) {
                if (match.status !== "FINISHED") continue;
                const predicted = predMap.get(match.id);
                if (!predicted) continue;
                const home = match.score.fullTime.home;
                const away = match.score.fullTime.away;
                if (home === null || away === null) continue;
                userPoints += computePoints(predicted, { home, away });
            }

            // Attach user predictions onto next fixtures for display
            for (const m of scheduled) {
                const pick = predMap.get(m.id);
                if (pick) m.predictedScore = { home: pick.home, away: pick.away, isPredicted: true };
            }
        }

        leagues.push({
            competition,
            fixturesCount: matches.length,
            userPoints,
            nextFixtures: scheduled,
            season,
        });
    }

    return <LeaguesClient leagues={leagues} />;
}
