import { selectFactory } from "@/app/server/modules/factories/competitionsFactory/CompetitionsFactorySelector";
import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";
import type { Match } from "@/app/server/modules/competitions/types";
import { computePoints } from "@/app/server/modules/competitions/scoring";
import { UserModel } from "@/app/server/models/UserModel";

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
}

const LIVE_STATUSES = new Set(["IN_PLAY", "LIVE", "PAUSED"]);
const UPCOMING_STATUSES = new Set(["SCHEDULED", "TIMED"]);

function hasResolvedTeams(match: { homeTeam?: { name?: string | null }; awayTeam?: { name?: string | null } }): boolean {
    return !!match.homeTeam?.name && !!match.awayTeam?.name;
}

function currentIsoWeek(now: Date = new Date()): { start: Date; end: Date } {
    const start = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const shift = (start.getUTCDay() + 6) % 7; // Monday = 0
    start.setUTCDate(start.getUTCDate() - shift);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);
    return { start, end };
}

function extractMatchId(sortKey: string): number | null {
    const m = sortKey.match(/MATCH#(\d+)$/);
    return m ? parseInt(m[1], 10) : null;
}

export class DashboardService {

    async getDashboardFeed(userId: string): Promise<DashboardFeed> {
        const allWithPicks = await this.collectMatchesAcrossCompetitions(userId);
        const now = new Date();

        const live: Match[] = [];
        const upcoming: Match[] = [];
        const settled: Match[] = [];

        for (const match of allWithPicks) {
            if (!hasResolvedTeams(match)) continue;
            if (LIVE_STATUSES.has(match.status)) {
                live.push(match);
            } else if (UPCOMING_STATUSES.has(match.status)) {
                if (new Date(match.utcDate) >= now) upcoming.push(match);
            } else if (match.status === "FINISHED") {
                settled.push(match);
            }
        }

        upcoming.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
        settled.sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());
        live.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

        return {
            live,
            upcoming: upcoming.slice(0, 10),
            settled: settled.slice(0, 5),
        };
    }

    async getUserStats(userId: string): Promise<UserStats> {
        const factory = selectFactory(process.env.DB_TYPE);
        const manager = factory.createCompetitionsManager();

        type Pick = { utcDate: string; points: number };
        const picks: Pick[] = [];

        for (const cid of CompetitionsEntity.competitionsIdArray) {
            const season = await manager.getActiveSeason(cid);
            if (!season) continue;

            const [matches, predictionsResult] = await Promise.all([
                manager.getAllMatches(cid, season),
                UserModel.getUserPredictions(userId, cid, season),
            ]);

            const predMap = new Map<number, { home: number; away: number }>();
            (predictionsResult.Items ?? []).forEach((p) => {
                const id = extractMatchId(p.SortKey as string);
                if (id !== null) {
                    predMap.set(id, { home: p.homeScore, away: p.awayScore });
                }
            });

            for (const match of matches) {
                if (match.status !== "FINISHED") continue;
                const predicted = predMap.get(match.id);
                if (!predicted) continue;
                const home = match.score.fullTime.home;
                const away = match.score.fullTime.away;
                if (home === null || away === null) continue;

                const points = computePoints(predicted, { home, away });
                picks.push({ utcDate: match.utcDate, points });
            }
        }

        picks.sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());

        const total = picks.reduce((sum, p) => sum + p.points, 0);

        const { start, end } = currentIsoWeek();
        const weekly = picks
            .filter((p) => {
                const d = new Date(p.utcDate);
                return d >= start && d < end;
            })
            .reduce((sum, p) => sum + p.points, 0);

        const recent = picks.slice(0, 25);
        const hitRate = recent.length
            ? Math.round((100 * recent.filter((p) => p.points > 0).length) / recent.length)
            : 0;

        let streak = 0;
        for (const p of picks) {
            if (p.points > 0) streak++;
            else break;
        }

        return { total, weekly, streak, hitRate };
    }

    private async collectMatchesAcrossCompetitions(userId: string): Promise<Match[]> {
        const factory = selectFactory(process.env.DB_TYPE);
        const manager = factory.createCompetitionsManager();
        const all: Match[] = [];

        for (const cid of CompetitionsEntity.competitionsIdArray) {
            const season = await manager.getActiveSeason(cid);
            if (!season) continue;

            const [matches, predictionsResult] = await Promise.all([
                manager.getAllMatches(cid, season),
                UserModel.getUserPredictions(userId, cid, season),
            ]);

            const predMap = new Map<number, { home: number; away: number }>();
            (predictionsResult.Items ?? []).forEach((p) => {
                const id = extractMatchId(p.SortKey as string);
                if (id !== null) {
                    predMap.set(id, { home: p.homeScore, away: p.awayScore });
                }
            });

            for (const match of matches) {
                const predicted = predMap.get(match.id);
                if (predicted) {
                    match.predictedScore = {
                        home: predicted.home,
                        away: predicted.away,
                        isPredicted: true,
                    };
                }
                all.push(match);
            }
        }

        return all;
    }
}
