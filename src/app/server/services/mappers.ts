import type {
    Competition as DbCompetition,
    Match as DbMatch,
    Season as DbSeason,
    Team as DbTeam,
} from "@prisma/client";
import type { Competition, Match, PredictedScore } from "@/app/server/modules/competitions/types";

/** Prisma Team → API Team */
function toApiTeam(t: DbTeam) {
    return {
        id: t.id,
        name: t.name,
        shortName: t.shortName ?? "",
        tla: t.tla ?? "",
        crest: t.crestUrl ?? "",
    };
}

/** Prisma Competition → API Competition. `matchdays` filled by caller from match query. */
export function toApiCompetition(
    c: DbCompetition,
    matchdays: number[],
): Competition {
    return {
        id: c.id,
        name: c.name,
        code: c.code,
        type: c.type,
        emblem: c.emblemUrl ?? "",
        activeMatchDay: c.currentMatchday ?? 0,
        matchDays: matchdays,
    };
}

/** Prisma Match (with teams loaded) + optional prediction → API Match */
export function toApiMatch(
    m: DbMatch & { homeTeam: DbTeam; awayTeam: DbTeam },
    competition: Competition,
    season: DbSeason,
    prediction?: PredictedScore,
): Match {
    const now = new Date();
    return {
        area: { id: 0, name: "", code: "", flag: "" },
        id: m.id,
        utcDate: m.utcDate.toISOString(),
        status: m.status,
        matchday: m.matchday ?? 0,
        stage: m.stage ?? "REGULAR_SEASON",
        group: null,
        lastUpdated: (m.lastSyncedAt ?? m.updatedAt).toISOString(),
        homeTeam: toApiTeam(m.homeTeam),
        awayTeam: toApiTeam(m.awayTeam),
        score: {
            winner: null,
            duration: "REGULAR",
            fullTime: { home: m.homeScoreFt ?? null, away: m.awayScoreFt ?? null },
            halfTime: { home: m.homeScoreHt ?? null, away: m.awayScoreHt ?? null },
        },
        competition,
        season: {
            id: 0,
            startDate: season.startDate?.toISOString() ?? "",
            endDate: season.endDate?.toISOString() ?? "",
            currentMatchday: competition.activeMatchDay,
            winner: null,
        },
        odds: { msg: "" },
        referees: [],
        isStarted: m.utcDate <= now,
        predictedScore: prediction,
    };
}
