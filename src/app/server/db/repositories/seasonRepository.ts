import type { Season } from "@prisma/client";
import { prisma } from "../client";

export const seasonRepository = {
    async findById(id: string): Promise<Season | null> {
        return prisma.season.findUnique({ where: { id } });
    },

    async findByCompetitionAndYear(
        competitionId: number,
        year: number,
    ): Promise<Season | null> {
        return prisma.season.findUnique({
            where: { competitionId_year: { competitionId, year } },
        });
    },

    async upsert(
        competitionId: number,
        year: number,
        startDate?: Date | null,
        endDate?: Date | null,
    ): Promise<Season> {
        return prisma.season.upsert({
            where: { competitionId_year: { competitionId, year } },
            create: {
                competitionId,
                year,
                startDate: startDate ?? null,
                endDate: endDate ?? null,
            },
            update: {
                startDate: startDate ?? undefined,
                endDate: endDate ?? undefined,
            },
        });
    },

    async findAllForCompetition(competitionId: number): Promise<Season[]> {
        return prisma.season.findMany({
            where: { competitionId },
            orderBy: { year: "desc" },
        });
    },
};
