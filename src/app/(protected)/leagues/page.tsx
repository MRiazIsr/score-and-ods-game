import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";
import { competitionRepository } from "@/app/server/db/repositories/competitionRepository";
import { matchRepository } from "@/app/server/db/repositories/matchRepository";
import { predictionRepository } from "@/app/server/db/repositories/predictionRepository";
import { toApiCompetition, toApiMatch } from "@/app/server/services/mappers";
import { getSession } from "@/app/actions/auth";
import LeaguesClient, { type LeagueSummary } from "./leaguesClient";
import type { Match } from "@/app/server/modules/competitions/types";

export const revalidate = 300;

const UPCOMING_STATUSES = new Set(["SCHEDULED", "TIMED"]);

export default async function LeaguesPage() {
    const session = await getSession();
    const userId = session.user?.userId;

    const leagues: LeagueSummary[] = [];

    for (const cid of CompetitionsEntity.competitionsIdArray) {
        const comp = await competitionRepository.findByIdWithActiveSeason(cid);
        if (!comp) continue;

        if (!comp.activeSeason) {
            leagues.push({
                competition: toApiCompetition(comp, []),
                fixturesCount: 0,
                userPoints: 0,
                nextFixtures: [],
                season: 0,
            });
            continue;
        }

        const matchdays = await matchRepository.getMatchdaysForCompetitionSeason(cid, comp.activeSeason.id);
        const apiComp = toApiCompetition(comp, matchdays);

        const allMatches = await matchRepository.findByCompetitionSeason(cid, comp.activeSeason.id);

        const scheduledDb = allMatches
            .filter((m) => UPCOMING_STATUSES.has(m.status) && !!m.homeTeam?.name && !!m.awayTeam?.name)
            .sort((a, b) => a.utcDate.getTime() - b.utcDate.getTime())
            .slice(0, 4);

        let userPoints = 0;
        const predMap = new Map<number, { home: number; away: number }>();

        if (userId) {
            const preds = await predictionRepository.findByUserAndCompetition(userId, cid, comp.activeSeason.id);
            for (const p of preds) {
                predMap.set(p.matchId, { home: p.homeScore, away: p.awayScore });
                if (p.match.status === "FINISHED" && p.pointsAwarded != null) {
                    userPoints += p.pointsAwarded;
                }
            }
        }

        const nextFixtures: Match[] = scheduledDb.map((m) => {
            const pick = predMap.get(m.id);
            return toApiMatch(
                m,
                apiComp,
                comp.activeSeason!,
                pick ? { home: pick.home, away: pick.away, isPredicted: true } : undefined,
            );
        });

        leagues.push({
            competition: apiComp,
            fixturesCount: allMatches.length,
            userPoints,
            nextFixtures,
            season: comp.activeSeason.year,
        });
    }

    return <LeaguesClient leagues={leagues} />;
}
