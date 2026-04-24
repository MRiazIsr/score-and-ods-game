import type { AxiosInstance } from "axios";
import { MatchStatus, Prisma } from "@prisma/client";
import { UNFOLD_HEADERS } from "./apiClient";
import type { ApiMatch, ApiMatchesResponse } from "./types";
import { teamRepository } from "@/app/server/db/repositories/teamRepository";
import { matchRepository } from "@/app/server/db/repositories/matchRepository";
import { predictionRepository } from "@/app/server/db/repositories/predictionRepository";
import { competitionRepository } from "@/app/server/db/repositories/competitionRepository";

function normalizeStatus(s: string): MatchStatus {
    const upper = s.toUpperCase();
    if (upper === "CANCELLED") return MatchStatus.CANCELED;
    if (upper === "LIVE") return MatchStatus.IN_PLAY;
    if ((Object.values(MatchStatus) as string[]).includes(upper)) {
        return upper as MatchStatus;
    }
    return MatchStatus.SCHEDULED;
}

/**
 * Pulls all matches for the competition+season from the API,
 * upserts teams (defensive — in case new teams appear),
 * upserts matches,
 * and awards points on any FINISHED matches whose predictions are still unscored.
 */
export async function syncMatches(
    api: AxiosInstance,
    competitionId: number,
    seasonId: string,
    _seasonYear: number,
): Promise<void> {
    const { data } = await api.get<ApiMatchesResponse>(
        `/competitions/${competitionId}/matches`,
        { headers: UNFOLD_HEADERS },
    );

    if (data.matches.length === 0) {
        console.log(`[syncMatches ${competitionId}] no matches`);
        return;
    }

    // Defensive team upsert — API can surface a team that isn't in /teams yet.
    const uniqueTeams = new Map<number, ApiMatch["homeTeam"]>();
    for (const m of data.matches) {
        uniqueTeams.set(m.homeTeam.id, m.homeTeam);
        uniqueTeams.set(m.awayTeam.id, m.awayTeam);
    }
    await teamRepository.upsertBatch(
        [...uniqueTeams.values()].map((t) => ({
            id: t.id,
            name: t.name,
            shortName: t.shortName ?? null,
            tla: t.tla ?? null,
            crestUrl: t.crest ?? null,
        })),
    );

    // Upsert matches — skip malformed entries defensively.
    const validMatches = data.matches.filter(
        (m) =>
            typeof m.id === "number" &&
            typeof m.homeTeam?.id === "number" &&
            typeof m.awayTeam?.id === "number",
    );
    await matchRepository.upsertBatch(
        validMatches.map((m) => ({
            id: m.id,
            competitionId,
            seasonId,
            matchday: m.matchday,
            stage: m.stage,
            homeTeamId: m.homeTeam.id,
            awayTeamId: m.awayTeam.id,
            utcDate: new Date(m.utcDate),
            status: normalizeStatus(m.status),
            homeScoreFt: m.score.fullTime.home ?? null,
            awayScoreFt: m.score.fullTime.away ?? null,
            homeScoreHt: m.score.halfTime.home ?? null,
            awayScoreHt: m.score.halfTime.away ?? null,
            rawData: m as unknown as Prisma.InputJsonValue,
        })),
    );

    console.log(`[syncMatches ${competitionId}] upserted ${data.matches.length} matches`);

    // Award points for FINISHED matches whose predictions are unscored.
    const finished = data.matches.filter(
        (m) =>
            normalizeStatus(m.status) === "FINISHED" &&
            m.score.fullTime.home !== null &&
            m.score.fullTime.away !== null,
    );
    let totalAwarded = 0;
    for (const m of finished) {
        const awarded = await predictionRepository.awardPointsForFinishedMatch(
            m.id,
            m.score.fullTime.home!,
            m.score.fullTime.away!,
        );
        totalAwarded += awarded;
    }
    if (totalAwarded > 0) {
        console.log(
            `[syncMatches ${competitionId}] awarded points on ${totalAwarded} pending predictions`,
        );
    }

    // Keep competition's current_matchday fresh from API signal.
    const firstWithMd = data.matches.find((m) => m.season?.currentMatchday != null);
    if (firstWithMd?.season?.currentMatchday != null) {
        const existing = await competitionRepository.findById(competitionId);
        if (existing && existing.currentMatchday !== firstWithMd.season.currentMatchday) {
            await competitionRepository.setActiveSeason(
                competitionId,
                seasonId,
                firstWithMd.season.currentMatchday,
            );
        }
    }
}
