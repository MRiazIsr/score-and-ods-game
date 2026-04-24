"use server";

import { getSession } from "@/app/actions/auth";
import { DashboardService, type DashboardFeed, type UserStats } from "@/app/server/services/auth/DashboardService";
import { logError } from "@/app/lib/errors";

const EMPTY_FEED: DashboardFeed = { live: [], upcoming: [], settled: [] };
const EMPTY_STATS: UserStats = { total: 0, weekly: 0, streak: 0, hitRate: 0 };

export async function getDashboardFeed(): Promise<DashboardFeed> {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user?.userId) {
        return EMPTY_FEED;
    }
    try {
        const service = new DashboardService();
        return await service.getDashboardFeed(session.user.userId);
    } catch (err) {
        logError("actions/dashboard.getDashboardFeed", err, { userId: session.user.userId });
        return EMPTY_FEED;
    }
}

export async function getUserStats(): Promise<UserStats> {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user?.userId) {
        return EMPTY_STATS;
    }
    try {
        const service = new DashboardService();
        return await service.getUserStats(session.user.userId);
    } catch (err) {
        logError("actions/dashboard.getUserStats", err, { userId: session.user.userId });
        return EMPTY_STATS;
    }
}
