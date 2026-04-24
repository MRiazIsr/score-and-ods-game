"use server";

import { getSession } from "@/app/actions/auth";
import { CrowdService, type CrowdBucket } from "@/app/server/services/auth/CrowdService";
import { logError } from "@/app/lib/errors";

export async function getCrowdPicks(
    matchId: number,
    competitionId: number,
    season: number,
    matchDay: number,
): Promise<CrowdBucket[]> {
    const session = await getSession();
    if (!session.isLoggedIn) return [];

    try {
        const service = new CrowdService();
        return await service.getCrowdPicks(matchId, competitionId, season, matchDay);
    } catch (err) {
        logError("actions/crowd.getCrowdPicks", err, { matchId, competitionId, season, matchDay });
        return [];
    }
}
