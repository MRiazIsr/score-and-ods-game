import type { Prisma, User } from "@prisma/client";
import { prisma } from "../client";

const activeUserWhere = { isDeleted: false };
const visibleUserWhere = { isDeleted: false, isBanned: false };

export const userRepository = {
    async findById(id: string): Promise<User | null> {
        return prisma.user.findFirst({ where: { id, ...activeUserWhere } });
    },

    async findByUsername(username: string): Promise<User | null> {
        return prisma.user.findFirst({ where: { username, ...activeUserWhere } });
    },

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findFirst({ where: { email, ...activeUserWhere } });
    },

    async existsByUsername(username: string): Promise<boolean> {
        const u = await prisma.user.findFirst({
            where: { username },
            select: { id: true },
        });
        return u !== null;
    },

    async existsByEmail(email: string): Promise<boolean> {
        const u = await prisma.user.findFirst({
            where: { email },
            select: { id: true },
        });
        return u !== null;
    },

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({ data });
    },

    async findAllForLeaderboard(): Promise<User[]> {
        return prisma.user.findMany({
            where: visibleUserWhere,
            orderBy: { createdAt: "asc" },
        });
    },

    async findAllVisibleIds(): Promise<string[]> {
        const rows = await prisma.user.findMany({
            where: visibleUserWhere,
            select: { id: true },
        });
        return rows.map((r) => r.id);
    },

    async softDelete(id: string): Promise<void> {
        await prisma.user.update({
            where: { id },
            data: { isDeleted: true },
        });
    },

    async setBanned(id: string, isBanned: boolean): Promise<void> {
        await prisma.user.update({
            where: { id },
            data: { isBanned },
        });
    },

    async setAdmin(id: string, isAdmin: boolean): Promise<void> {
        await prisma.user.update({
            where: { id },
            data: { isAdmin },
        });
    },
};
