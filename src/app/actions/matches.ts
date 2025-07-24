"use server"

import { Match } from "@/app/server/modules/competitions/types";
import { selectFactory } from "@/app/server/modules/factories/competitionsFactory/CompetitionsFactorySelector";

export async function getCompetitionMatches(competitionId: number): Promise<Match[]> {
  const competitionsFactory = selectFactory(process.env.DB_TYPE);
  const competitionsService = competitionsFactory.createCompetitionsService();

  return await competitionsService.getCompetitionActiveMatches(competitionId);
}
