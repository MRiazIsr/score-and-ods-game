"use server";

import { ScoreBoardData } from "@/app/server/modules/competitions/types";
import { getSession } from "./auth";
import { CompetitionsService } from "@/app/server/services/auth/CompetitionsService";

export async function getScoreBoardData(competitionId: number): Promise<ScoreBoardData> {
  // Проверяем авторизацию
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error("Not authenticated");
  }

  try {
    const competitionsService = new CompetitionsService();
    const scoreBoardData = await competitionsService.getScoreBoardData(competitionId);
    return scoreBoardData;
  } catch (error) {
    console.error('Error fetching scoreboard data:', error);

    // Возвращаем пустые данные в случае ошибки
    return {
      competitionId,
      competitionName: competitionId === 2021 ? "Premier League" : "Champions League",
      entries: []
    };
  }
}
