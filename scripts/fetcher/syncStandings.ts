import type { AxiosInstance } from "axios";
import type { StandingTableType } from "@prisma/client";
import { standingsRepository } from "@/app/server/db/repositories/standingsRepository";
import { teamRepository } from "@/app/server/db/repositories/teamRepository";
import type { ApiStandingsResponse } from "./types";

export async function syncStandings(
    api: AxiosInstance,
    competitionId: number,
    seasonId: string,
): Promise<void> {
    try {
        const { data } = await api.get<ApiStandingsResponse>(`/competitions/${competitionId}/standings`);
        if (data.standings.length === 0) {
            console.log(`[syncStandings ${competitionId}] no standings`);
            return;
        }

        // Collect all unique teams from standings (defensive upsert).
        const uniqueTeams = new Map<number, (typeof data.standings)[number]["table"][number]["team"]>();
        for (const group of data.standings) {
            for (const row of group.table) {
                uniqueTeams.set(row.team.id, row.team);
            }
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

        // Flatten all (type, row) combinations into a single standings upsert list.
        const rows: Parameters<typeof standingsRepository.replaceForCompetitionSeason>[2] = [];
        for (const group of data.standings) {
            const tableType = group.type as StandingTableType;
            for (const r of group.table) {
                rows.push({
                    competitionId,
                    seasonId,
                    tableType,
                    position: r.position,
                    teamId: r.team.id,
                    played: r.playedGames,
                    won: r.won,
                    draw: r.draw,
                    lost: r.lost,
                    points: r.points,
                    goalsFor: r.goalsFor,
                    goalsAgainst: r.goalsAgainst,
                    goalDifference: r.goalDifference,
                });
            }
        }

        await standingsRepository.replaceForCompetitionSeason(competitionId, seasonId, rows);
        console.log(`[syncStandings ${competitionId}] synced ${rows.length} rows`);
    } catch (e) {
        const status = axiosStatus(e);
        if (status === 404) {
            console.log(`[syncStandings ${competitionId}] not available (404)`);
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
