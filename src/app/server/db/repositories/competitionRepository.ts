import type { Competition, Prisma, Season } from "@prisma/client";
import { prisma } from "../client";

export type CompetitionWithActiveSeason = Competition & { activeSeason: Season | null };

export const competitionRepository = {
    async findById(id: number): Promise<Competition | null> {
        return prisma.competition.findUnique({ where: { id } });
    },

    async findByIdWithActiveSeason(
        id: number,
    ): Promise<CompetitionWithActiveSeason | null> {
        return prisma.competition.findUnique({
            where: { id },
            include: { activeSeason: true },
        });
    },

    async findManyByIds(ids: number[]): Promise<Competition[]> {
        return prisma.competition.findMany({ where: { id: { in: ids } } });
    },

    async upsert(data: {
        id: number;
        code: string;
        name: string;
        type: string;
        emblemUrl?: string | null;
        currentMatchday?: number | null;
        activeSeasonId?: string | null;
    }): Promise<Competition> {
        return prisma.competition.upsert({
            where: { id: data.id },
            create: {
                ...data,
                lastSyncedAt: new Date(),
            },
            update: {
                code: data.code,
                name: data.name,
                type: data.type,
                emblemUrl: data.emblemUrl,
                currentMatchday: data.currentMatchday,
                activeSeasonId: data.activeSeasonId,
                lastSyncedAt: new Date(),
            },
        });
    },

    async setActiveSeason(competitionId: number, seasonId: string, currentMatchday: number | null): Promise<Competition> {
        return prisma.competition.update({
            where: { id: competitionId },
            data: { activeSeasonId: seasonId, currentMatchday },
        });
    },

    /**
     * Returns the year of the active season for a competition (or null).
     * Matches the shape of the old `getActiveSeason` signature used by services.
     */
    async getActiveSeasonYear(competitionId: number): Promise<number | null> {
        const comp = await prisma.competition.findUnique({
            where: { id: competitionId },
            include: { activeSeason: true },
        });
        return comp?.activeSeason?.year ?? null;
    },

    async getAllMatchdays(competitionId: number, seasonId: string): Promise<number[]> {
        const rows = await prisma.match.findMany({
            where: { competitionId, seasonId, matchday: { not: null } },
            distinct: ["matchday"],
            select: { matchday: true },
            orderBy: { matchday: "asc" },
        });
        return rows.map((r) => r.matchday!).filter((d): d is number => d != null);
    },

    async create(data: Prisma.CompetitionCreateInput): Promise<Competition> {
        return prisma.competition.create({ data });
    },
};
