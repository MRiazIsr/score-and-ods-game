"use server"

import {ICompetitionsFactory} from "@/app/server/modules/factories/competitionsFactory/ICompetitionsFactory";
import {selectFactory} from "@/app/server/modules/factories/competitionsFactory/CompetitionsFactorySelector";
import {CompetitionsEntity} from "@/app/server/entities/CompetitionsEntity";
import { Competition } from "@/app/server/modules/competitions/types";

export async function getCompetitions(): Promise<Array<Competition[]>> {
    const competitionsFactory: ICompetitionsFactory = selectFactory(process.env.DB_TYPE);
    const competitionsService = competitionsFactory.createCompetitionsService();

    const competitions = [];

    for (const competitionId of CompetitionsEntity.competitionsIdArray) {
        competitions.push(await competitionsService.getCompetitionData(competitionId));
    }

    return competitions;
}