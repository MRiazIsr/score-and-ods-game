"use server";

import { getSession } from "@/app/actions/auth";
import { CompetitionsService, type TeamFormResult } from "@/app/server/services/auth/CompetitionsService";
import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";
import { logError } from "@/app/lib/errors";

export async function getTeamForm(teamId: number, limit = 5): Promise<TeamFormResult[]> {
    const session = await getSession();
    if (!session.isLoggedIn) return [];

    try {
        const service = new CompetitionsService();
        return await service.getRecentMatchResults(teamId, CompetitionsEntity.competitionsIdArray, limit);
    } catch (err) {
        logError("actions/teamForm.getTeamForm", err, { teamId, limit });
        return [];
    }
}

export async function getTeamFormBatch(
    teamIds: number[],
    limit = 5,
): Promise<Record<number, TeamFormResult[]>> {
    const session = await getSession();
    if (!session.isLoggedIn) return {};

    try {
        const service = new CompetitionsService();
        return await service.getRecentMatchResultsBatch(
            teamIds,
            CompetitionsEntity.competitionsIdArray,
            limit,
        );
    } catch (err) {
        logError("actions/teamForm.getTeamFormBatch", err, { count: teamIds.length, limit });
        return {};
    }
}
