import type { Team } from "@prisma/client";
import { prisma } from "../client";

export type TeamUpsertInput = {
    id: number;
    name: string;
    shortName?: string | null;
    tla?: string | null;
    crestUrl?: string | null;
};

export const teamRepository = {
    async findById(id: number): Promise<Team | null> {
        return prisma.team.findUnique({ where: { id } });
    },

    async findManyByIds(ids: number[]): Promise<Team[]> {
        return prisma.team.findMany({ where: { id: { in: ids } } });
    },

    async upsert(data: TeamUpsertInput): Promise<Team> {
        return prisma.team.upsert({
            where: { id: data.id },
            create: data,
            update: {
                name: data.name,
                shortName: data.shortName,
                tla: data.tla,
                crestUrl: data.crestUrl,
            },
        });
    },

    async upsertBatch(teams: TeamUpsertInput[]): Promise<void> {
        const valid = teams.filter((t) => typeof t.id === "number" && !!t.name);
        if (valid.length === 0) return;
        await prisma.$transaction(
            valid.map((t) =>
                prisma.team.upsert({
                    where: { id: t.id },
                    create: t,
                    update: {
                        name: t.name,
                        shortName: t.shortName,
                        tla: t.tla,
                        crestUrl: t.crestUrl,
                    },
                }),
            ),
        );
    },
};
