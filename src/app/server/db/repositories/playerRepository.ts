import type { Player } from "@prisma/client";
import { prisma } from "../client";

export type PlayerUpsertInput = {
    id: number;
    name: string;
    position?: string | null;
    nationality?: string | null;
    dateOfBirth?: Date | null;
};

export const playerRepository = {
    async findById(id: number): Promise<Player | null> {
        return prisma.player.findUnique({ where: { id } });
    },

    async upsert(data: PlayerUpsertInput): Promise<Player> {
        return prisma.player.upsert({
            where: { id: data.id },
            create: data,
            update: {
                name: data.name,
                position: data.position,
                nationality: data.nationality,
                dateOfBirth: data.dateOfBirth,
            },
        });
    },

    async upsertBatch(players: PlayerUpsertInput[]): Promise<void> {
        if (players.length === 0) return;
        await prisma.$transaction(
            players.map((p) =>
                prisma.player.upsert({
                    where: { id: p.id },
                    create: p,
                    update: {
                        name: p.name,
                        position: p.position,
                        nationality: p.nationality,
                        dateOfBirth: p.dateOfBirth,
                    },
                }),
            ),
        );
    },
};
