import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";
import { DashboardService } from "@/app/server/services/auth/DashboardService";
import DashboardClient from "./dashboardClient";

export const revalidate = 60;

export default async function DashboardPage() {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user?.userId) redirect("/login");

    const service = new DashboardService();
    const [feed, stats] = await Promise.all([
        service.getDashboardFeed(session.user.userId),
        service.getUserStats(session.user.userId),
    ]);
    return <DashboardClient feed={feed} stats={stats} />;
}
