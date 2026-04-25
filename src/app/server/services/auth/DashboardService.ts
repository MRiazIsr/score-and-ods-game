import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";
import { competitionRepository } from "@/app/server/db/repositories/competitionRepository";
import { matchRepository } from "@/app/server/db/repositories/matchRepository";
import { predictionRepository } from "@/app/server/db/repositories/predictionRepository";
import { CompetitionsService, type TeamFormResult } from "@/app/server/services/auth/CompetitionsService";
import { toApiCompetition, toApiMatch } from "@/app/server/services/mappers";
import type { Match } from "@/app/server/modules/competitions/types";

export interface UserStats {
    total: number;
    weekly: number;
    streak: number;
    hitRate: number;
}

export interface DashboardFeed {
    live: Match[];
    upcoming: Match[];
    settled: Match[];
    formByTeam: Record<number, TeamFormResult[]>;
}

function currentIsoWeek(now: Date = new Date()): { start: Date; end: Date } {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const shift = (start.getUTCDay() + 6) % 7; // Monday = 0
    start.setUTCDate(start.getUTCDate() - shift);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);
    return { start, end };
}

export class DashboardService {
    async getDashboardFeed(userId: string): Promise<DashboardFeed> {
        const [liveRaw, upcomingRaw, settledRaw] = await Promise.all([
            matchRepository.findLive(),
            matchRepository.findUpcoming(10),
            matchRepository.findRecentlyFinished(5),
        ]);

        const allMatches = [...liveRaw, ...upcomingRaw, ...settledRaw];
        const matchIds = allMatches.map((m) => m.id);

        const predictions = matchIds.length
            ? (await Promise.all(
                  matchIds.map((mid) => predictionRepository.findByUserAndMatch(userId, mid)),
              )).filter((p): p is NonNullable<typeof p> => p !== null)
            : [];
        const predMap = new Map(predictions.map((p) => [p.matchId, p]));

        const competitionIds = [...new Set(allMatches.map((m) => m.competitionId))];
        const competitions = await Promise.all(
            competitionIds.map((cid) => competitionRepository.findByIdWithActiveSeason(cid)),
        );
        const compMap = new Map(
            competitions
                .filter((c): c is NonNullable<typeof c> => c != null)
                .map((c) => [c.id, c]),
        );

        const mapOne = (m: (typeof allMatches)[number]): Match | null => {
            const comp = compMap.get(m.competitionId);
            if (!comp || !comp.activeSeason) return null;
            const apiComp = toApiCompetition(comp, []);
            const pred = predMap.get(m.id);
            return toApiMatch(
                m,
                apiComp,
                comp.activeSeason,
                pred ? { home: pred.homeScore, away: pred.awayScore, isPredicted: true } : undefined,
            );
        };

        const live = liveRaw.map(mapOne).filter((m): m is Match => m != null);
        const upcoming = upcomingRaw.map(mapOne).filter((m): m is Match => m != null);
        const settled = settledRaw.map(mapOne).filter((m): m is Match => m != null);

        const teamIds = Array.from(
            new Set(allMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId])),
        );
        const formByTeam = teamIds.length
            ? await new CompetitionsService().getRecentMatchResultsBatch(
                  teamIds,
                  CompetitionsEntity.competitionsIdArray,
              )
            : {};

        return { live, upcoming, settled, formByTeam };
    }

    async getUserStats(userId: string): Promise<UserStats> {
        const { start, end } = currentIsoWeek();
        const [total, weekly, recent] = await Promise.all([
            predictionRepository.getTotalPoints(userId),
            predictionRepository.getPointsInRange(userId, start, end),
            predictionRepository.getRecentScoredForUser(userId, 25),
        ]);

        const hitRate = recent.length
            ? Math.round(
                  (100 * recent.filter((p) => (p.pointsAwarded ?? 0) > 0).length) / recent.length,
              )
            : 0;

        let streak = 0;
        for (const p of recent) {
            if ((p.pointsAwarded ?? 0) > 0) streak++;
            else break;
        }

        // `CompetitionsEntity` kept for future scoping (filter stats to tracked competitions);
        // currently all competitions are aggregated globally which matches prior behaviour.
        void CompetitionsEntity;

        return { total, weekly, streak, hitRate };
    }
}
