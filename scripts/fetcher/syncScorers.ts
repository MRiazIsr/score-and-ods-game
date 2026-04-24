import type { AxiosInstance } from "axios";
import { playerRepository } from "@/app/server/db/repositories/playerRepository";
import { teamRepository } from "@/app/server/db/repositories/teamRepository";
import { topScorersRepository } from "@/app/server/db/repositories/topScorersRepository";
import type { ApiScorersResponse } from "./types";

export async function syncScorers(
    api: AxiosInstance,
    competitionId: number,
    seasonId: string,
): Promise<void> {
    try {
        const { data } = await api.get<ApiScorersResponse>(`/competitions/${competitionId}/scorers`);
        if (data.scorers.length === 0) {
            console.log(`[syncScorers ${competitionId}] empty`);
            return;
        }

        // Upsert unique players.
        const uniquePlayers = new Map<number, (typeof data.scorers)[number]["player"]>();
        const uniqueTeams = new Map<number, (typeof data.scorers)[number]["team"]>();
        for (const s of data.scorers) {
            uniquePlayers.set(s.player.id, s.player);
            uniqueTeams.set(s.team.id, s.team);
        }

        await playerRepository.upsertBatch(
            [...uniquePlayers.values()].map((p) => ({
                id: p.id,
                name: p.name,
                position: p.position ?? null,
                nationality: p.nationality ?? null,
                dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
            })),
        );
        await teamRepository.upsertBatch(
            [...uniqueTeams.values()].map((t) => ({
                id: t.id,
                name: t.name,
                shortName: t.shortName ?? null,
                tla: t.tla ?? null,
                crestUrl: t.crest ?? null,
            })),
        );

        await topScorersRepository.replaceForCompetitionSeason(
            competitionId,
            seasonId,
            data.scorers.map((s) => ({
                competitionId,
                seasonId,
                teamId: s.team.id,
                playerId: s.player.id,
                goals: s.goals,
                assists: s.assists ?? null,
                penalties: s.penalties ?? null,
                playedMatches: s.playedMatches ?? null,
            })),
        );

        console.log(`[syncScorers ${competitionId}] synced ${data.scorers.length} scorers`);
    } catch (e) {
        const status = axiosStatus(e);
        if (status === 404) {
            console.log(`[syncScorers ${competitionId}] not available (404)`);
            return;
        }
        throw e;
    }
}

function axiosStatus(e: unknown): number | undefined {
    if (e && typeof e === "object" && "response" in e) {
        const r = (e as { response?: { status?: number } }).response;
        return r?.status;
    }
    return undefined;
}
