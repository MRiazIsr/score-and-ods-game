"use server";

import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";
import { Competition, MatchdayTab } from "@/app/server/modules/competitions/types";
import { CompetitionsService } from "@/app/server/services/auth/CompetitionsService";
import { logError } from "@/app/lib/errors";

export async function getCompetitions(): Promise<Array<Competition>> {
    const service = new CompetitionsService();
    const competitions: Competition[] = [];

    for (const competitionId of CompetitionsEntity.competitionsIdArray) {
        try {
            competitions.push(await service.getCompetitionData(competitionId));
        } catch (err) {
            logError("actions/competitions.getCompetitions.one", err, { competitionId });
        }
    }

    return competitions;
}

export async function getCompetitionData(competitionId: number): Promise<Competition | null> {
    try {
        const service = new CompetitionsService();
        return await service.getCompetitionData(competitionId);
    } catch (err) {
        logError("actions/competitions.getCompetitionData", err, { competitionId });
        return null;
    }
}

export async function getAllMatchDays(competitionId: number): Promise<number[]> {
    try {
        const service = new CompetitionsService();
        return await service.getAllCompetitionMatchDays(competitionId);
    } catch (err) {
        logError("actions/competitions.getAllMatchDays", err, { competitionId });
        return [];
    }
}

export async function getAllMatchTabs(competitionId: number): Promise<MatchdayTab[]> {
    try {
        const service = new CompetitionsService();
        return await service.getAllCompetitionMatchTabs(competitionId);
    } catch (err) {
        logError("actions/competitions.getAllMatchTabs", err, { competitionId });
        return [];
    }
}
