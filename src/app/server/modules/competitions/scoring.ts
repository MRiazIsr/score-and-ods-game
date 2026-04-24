import { RULES } from "./constants";

export interface ScoreTuple {
    home: number;
    away: number;
}

export function computePoints(predicted: ScoreTuple, actual: ScoreTuple): number {
    if (predicted.home === actual.home && predicted.away === actual.away) {
        return RULES.exact;
    }
    if (predicted.home - predicted.away === actual.home - actual.away) {
        return RULES.goalDiff;
    }
    const pWin = Math.sign(predicted.home - predicted.away);
    const aWin = Math.sign(actual.home - actual.away);
    if (pWin === aWin) return RULES.outcome;
    return RULES.miss;
}

export type PointBreakdown = "exact" | "goalDiff" | "outcome" | "miss";

export function breakdown(predicted: ScoreTuple, actual: ScoreTuple): PointBreakdown {
    if (predicted.home === actual.home && predicted.away === actual.away) return "exact";
    if (predicted.home - predicted.away === actual.home - actual.away) return "goalDiff";
    const pWin = Math.sign(predicted.home - predicted.away);
    const aWin = Math.sign(actual.home - actual.away);
    return pWin === aWin ? "outcome" : "miss";
}
