"use server";

import { getSession } from "@/app/actions/auth";
import { CrowdService, type CrowdBucket } from "@/app/server/services/auth/CrowdService";

export async function getCrowdPicks(
    matchId: number,
    competitionId: number,
    season: number,
    matchDay: number,
): Promise<CrowdBucket[]> {
    const session = await getSession();
    if (!session.isLoggedIn) throw new Error("Not authenticated");

    const service = new CrowdService();
    return service.getCrowdPicks(matchId, competitionId, season, matchDay);
}
