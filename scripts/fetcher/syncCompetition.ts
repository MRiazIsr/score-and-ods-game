import type { AxiosInstance } from "axios";
import { competitionRepository } from "@/app/server/db/repositories/competitionRepository";
import { seasonRepository } from "@/app/server/db/repositories/seasonRepository";
import type { ApiCompetitionDetailsResponse } from "./types";
import { syncMatches } from "./syncMatches";
import { syncTeams } from "./syncTeams";
import { syncStandings } from "./syncStandings";
import { syncScorers } from "./syncScorers";

/**
 * Orchestrates one full sync for a single competition:
 *   1. Load competition details → upsert Competition + Season (active)
 *   2. Sync teams (needs season context)
 *   3. Sync matches (also awards points on FINISHED)
 *   4. Sync standings
 *   5. Sync scorers (players + top_scorers)
 */
export async function syncCompetition(
    api: AxiosInstance,
    competitionId: number,
): Promise<void> {
    console.log(`[syncCompetition ${competitionId}] start`);
    const { data } = await api.get<ApiCompetitionDetailsResponse>(`/competitions/${competitionId}`);

    const seasonYear = new Date(data.currentSeason.startDate).getUTCFullYear();

    // Step 1: Create competition first (without activeSeason FK) so Season FK is satisfiable.
    await competitionRepository.upsert({
        id: competitionId,
        code: data.code,
        name: data.name,
        type: data.type,
        emblemUrl: data.emblem ?? null,
        currentMatchday: data.currentSeason.currentMatchday,
        activeSeasonId: null,
    });

    // Step 2: Create season now that competition exists.
    const season = await seasonRepository.upsert(
        competitionId,
        seasonYear,
        new Date(data.currentSeason.startDate),
        new Date(data.currentSeason.endDate),
    );

    // Step 3: Link active season onto competition.
    await competitionRepository.setActiveSeason(
        competitionId,
        season.id,
        data.currentSeason.currentMatchday,
    );

    await syncTeams(api, competitionId, season.id);
    await syncMatches(api, competitionId, season.id, seasonYear);
    await syncStandings(api, competitionId, season.id);
    await syncScorers(api, competitionId, season.id);

    console.log(`[syncCompetition ${competitionId}] done`);
}
