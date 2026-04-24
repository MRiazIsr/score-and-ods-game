import { UserModel } from "@/app/server/models/UserModel";

export interface CrowdBucket {
    score: string;
    count: number;
    pct: number;
}

export class CrowdService {

    async getCrowdPicks(
        matchId: number,
        competitionId: number,
        season: number,
        matchDay: number,
    ): Promise<CrowdBucket[]> {
        const usersResponse = await UserModel.getAllUsers();
        const usersData = (usersResponse.Item?.usersData as Array<{ userId: string }> | undefined) ?? [];
        if (!usersData.length) return [];

        const userIds = usersData.map((u) => u.userId);
        const picks = await UserModel.batchGetMatchScores(userIds, competitionId, season, matchDay, matchId);
        if (!picks.length) return [];

        const counts = new Map<string, number>();
        for (const pick of picks) {
            const key = `${pick.homeScore}–${pick.awayScore}`;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }

        const total = picks.length;
        const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

        return sorted.slice(0, 5).map(([score, count]) => ({
            score,
            count,
            pct: Math.round((100 * count) / total),
        }));
    }
}
