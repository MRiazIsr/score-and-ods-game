"use server";

import { Match, MatchdayTab } from "@/app/server/modules/competitions/types";
import { CompetitionsService, type TeamFormResult } from "@/app/server/services/auth/CompetitionsService";
import { getSession } from "@/app/actions/auth";
import { friendlyMessage, logError } from "@/app/lib/errors";

type SaveMatchScoreState =
    | {
          success: boolean;
          message: string;
      }
    | undefined;

export async function getCompetitionMatches(
    competitionId: number,
    tab: MatchdayTab,
): Promise<{ matches: Match[]; formByTeam: Record<number, TeamFormResult[]> }> {
    try {
        const service = new CompetitionsService();
        const session = await getSession();
        return await service.getCompetitionTabMatches(
            competitionId,
            tab,
            session.user.userId,
        );
    } catch (err) {
        logError("actions/matches.getCompetitionMatches", err, {
            competitionId,
            tabKind: tab.kind,
            tabValue: tab.kind === "matchday" ? tab.matchday : tab.stage,
        });
        return { matches: [], formByTeam: {} };
    }
}

export async function saveMatchScore(
    prevState: SaveMatchScoreState,
    formData: FormData,
): Promise<{ success: boolean; message: string }> {
    const competitionId = parseInt(formData.get("competitionId") as string);
    const matchId = parseInt(formData.get("matchId") as string);
    const homeScore = parseInt(formData.get("homeScore") as string);
    const awayScore = parseInt(formData.get("awayScore") as string);
    const matchDay = parseInt(formData.get("matchDay") as string);

    const session = await getSession();

    if (!session.isLoggedIn || !session.user?.userId) {
        return { success: false, message: "Please sign in to save your prediction." };
    }

    if (
        isNaN(competitionId) ||
        isNaN(matchId) ||
        isNaN(homeScore) ||
        isNaN(awayScore)
    ) {
        return { success: false, message: "Invalid data provided." };
    }

    try {
        const service = new CompetitionsService();
        await service.saveMatchScore(
            competitionId,
            matchDay,
            matchId,
            { home: homeScore, away: awayScore },
            session.user.userId,
        );
        return { success: true, message: "Score saved successfully!" };
    } catch (err) {
        logError("actions/matches.saveMatchScore", err, {
            userId: session.user.userId,
            competitionId,
            matchId,
            matchDay,
        });
        return { success: false, message: friendlyMessage(err, "Failed to save score.") };
    }
}
