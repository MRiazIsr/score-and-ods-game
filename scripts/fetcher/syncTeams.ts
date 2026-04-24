import type { AxiosInstance } from "axios";
import { teamRepository } from "@/app/server/db/repositories/teamRepository";
import type { ApiTeamsResponse } from "./types";

export async function syncTeams(
    api: AxiosInstance,
    competitionId: number,
    _seasonId: string,
): Promise<void> {
    try {
        const { data } = await api.get<ApiTeamsResponse>(`/competitions/${competitionId}/teams`);
        await teamRepository.upsertBatch(
            data.teams.map((t) => ({
                id: t.id,
                name: t.name,
                shortName: t.shortName ?? null,
                tla: t.tla ?? null,
                crestUrl: t.crest ?? null,
            })),
        );
        console.log(`[syncTeams ${competitionId}] synced ${data.teams.length} teams`);
    } catch (e) {
        const status = axiosStatus(e);
        if (status === 404) {
            console.log(`[syncTeams ${competitionId}] not available (404)`);
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
