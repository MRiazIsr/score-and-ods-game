import { predictionRepository } from "@/app/server/db/repositories/predictionRepository";

export interface CrowdBucket {
    score: string;
    count: number;
    pct: number;
}

export class CrowdService {
    async getCrowdPicks(
        matchId: number,
        _competitionId: number,
        _season: number,
        _matchDay: number,
    ): Promise<CrowdBucket[]> {
        const picks = await predictionRepository.findVisibleUsersPredictionsForMatch(matchId);
        if (picks.length === 0) return [];

        const counts = new Map<string, number>();
        for (const p of picks) {
            const key = `${p.homeScore}–${p.awayScore}`;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }

        const total = picks.length;
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

        return sorted.slice(0, 5).map(([score, count]) => ({
            score,
            count,
            pct: Math.round((100 * count) / total),
        }));
    }
}
