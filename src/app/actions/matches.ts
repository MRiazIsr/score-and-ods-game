"use server"

import { Match } from "@/app/server/modules/competitions/types";
import { selectFactory } from "@/app/server/modules/factories/competitionsFactory/CompetitionsFactorySelector";
import {getSession} from "@/app/actions/auth";

type SaveMatchScoreState = {
  success: boolean;
  message: string;
} | undefined;


export async function getCompetitionMatches(competitionId: number): Promise<Match[]> {
  const competitionsFactory = selectFactory(process.env.DB_TYPE);
  const competitionsService = competitionsFactory.createCompetitionsService();
  const session = await getSession();

  return await competitionsService.getCompetitionActiveMatches(competitionId, session.user.userId);
}

export async function saveMatchScore(prevState: SaveMatchScoreState, formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const competitionId = parseInt(formData.get('competitionId') as string);
    const matchId = parseInt(formData.get('matchId') as string);
    const homeScore = parseInt(formData.get('homeScore') as string);
    const awayScore = parseInt(formData.get('awayScore') as string);
    const matchDay = parseInt(formData.get('matchDay') as string);
    const session = await getSession();

    if (isNaN(competitionId) || isNaN(matchId) || isNaN(homeScore) || isNaN(awayScore)) {
      return { success: false, message: 'Invalid data provided' };
    }

    const competitionsFactory = selectFactory(process.env.DB_TYPE);
    const competitionsService = competitionsFactory.createCompetitionsService();

    // Assuming you need to implement this method in your service
    await competitionsService.saveMatchScore(competitionId, matchDay, matchId, { home: homeScore, away: awayScore }, session.user.userId);

    return { success: true, message: 'Score saved successfully!' };
  } catch (error) {
    console.error('Error saving match score:', error);
    return { success: false, message: 'Failed to save score' };
  }
}

