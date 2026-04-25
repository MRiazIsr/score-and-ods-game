import type { Prisma, User } from "@prisma/client";
import { prisma } from "../client";

const activeUserWhere = { isDeleted: false };
const visibleUserWhere = { isDeleted: false, isBanned: false };

const USERNAME_MAX_LEN = 64;

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 32) || "user";
}

function randomSuffix(bytes = 2): string {
    return Array.from(
        crypto.getRandomValues(new Uint8Array(bytes)),
        (b) => b.toString(16).padStart(2, "0"),
    ).join("");
}

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

    async findByGoogleId(googleId: string): Promise<User | null> {
        return prisma.user.findFirst({ where: { googleId, ...activeUserWhere } });
    },

    async findByTelegramId(telegramId: string): Promise<User | null> {
        return prisma.user.findFirst({ where: { telegramId, ...activeUserWhere } });
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

    async createOAuth(data: {
        username: string;
        email: string | null;
        googleId?: string;
        telegramId?: string;
    }): Promise<User> {
        return prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                googleId: data.googleId,
                telegramId: data.telegramId,
            },
        });
    },

    async linkGoogleId(userId: string, googleId: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { googleId },
        });
    },

    async linkTelegramId(userId: string, telegramId: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { telegramId },
        });
    },

    /**
     * Build a unique username from a seed: slugified seed + random hex suffix.
     * Retries with longer suffix on collision so we always converge.
     */
    async generateUniqueUsername(seed: string): Promise<string> {
        const base = slugify(seed);
        for (let bytes = 2; bytes <= 6; bytes++) {
            const candidate = `${base}_${randomSuffix(bytes)}`.slice(0, USERNAME_MAX_LEN);
            const taken = await this.existsByUsername(candidate);
            if (!taken) return candidate;
        }
        // Extreme fallback — should never hit with 6-byte (12 hex char) suffix space.
        throw new Error("Could not generate unique username");
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
