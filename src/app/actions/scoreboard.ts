"use server";

import { ScoreBoardData } from "@/app/server/modules/competitions/types";
import { getSession } from "./auth";
import { CompetitionsService } from "@/app/server/services/auth/CompetitionsService";
import { logError } from "@/app/lib/errors";

export async function getScoreBoardData(competitionId: number): Promise<ScoreBoardData> {
    const emptyResponse: ScoreBoardData = {
        competitionId,
        competitionName: competitionId === 2021 ? "Premier League" : "Champions League",
        entries: [],
    };

    const session = await getSession();
    if (!session.isLoggedIn) {
        return emptyResponse;
    }

    try {
        const competitionsService = new CompetitionsService();
        return await competitionsService.getScoreBoardData(competitionId);
    } catch (err) {
        logError("actions/scoreboard.getScoreBoardData", err, { competitionId });
        return emptyResponse;
    }
}
