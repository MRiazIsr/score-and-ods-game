"use server";

import { getSession } from "@/app/actions/auth";
import { DashboardService, type DashboardFeed, type UserStats } from "@/app/server/services/auth/DashboardService";

export async function getDashboardFeed(): Promise<DashboardFeed> {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
        throw new Error("Not authenticated");
    }
    const service = new DashboardService();
    return service.getDashboardFeed(session.user.userId);
}

export async function getUserStats(): Promise<UserStats> {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
        throw new Error("Not authenticated");
    }
    const service = new DashboardService();
    return service.getUserStats(session.user.userId);
}
