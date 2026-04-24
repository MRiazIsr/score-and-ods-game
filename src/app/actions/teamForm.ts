"use server";

import { getSession } from "@/app/actions/auth";
import { CompetitionsService, type TeamFormResult } from "@/app/server/services/auth/CompetitionsService";
import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";

export async function getTeamForm(teamId: number, limit = 5): Promise<TeamFormResult[]> {
    const session = await getSession();
    if (!session.isLoggedIn) throw new Error("Not authenticated");

    const service = new CompetitionsService();
    return service.getRecentMatchResults(teamId, CompetitionsEntity.competitionsIdArray, limit);
}
