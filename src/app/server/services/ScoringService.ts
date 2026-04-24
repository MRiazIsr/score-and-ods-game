export interface ScoreTuple {
    home: number;
    away: number;
}

export const SCORING_RULES = {
    exact: 3,
    goalDiff: 2,
    outcome: 1,
    miss: 0,
} as const;

export type PointBreakdown = "exact" | "goalDiff" | "outcome" | "miss";

/**
 * Pure function — given a predicted and actual score, return points awarded.
 *
 * Rules:
 *   - Exact score:        3 points
 *   - Correct goal diff:  2 points
 *   - Correct winner:     1 point
 *   - Miss:               0 points
 */
export function calculatePoints(predicted: ScoreTuple, actual: ScoreTuple): number {
    if (predicted.home === actual.home && predicted.away === actual.away) {
        return SCORING_RULES.exact;
    }
    if (predicted.home - predicted.away === actual.home - actual.away) {
        return SCORING_RULES.goalDiff;
    }
    const pOutcome = Math.sign(predicted.home - predicted.away);
    const aOutcome = Math.sign(actual.home - actual.away);
    if (pOutcome === aOutcome) {
        return SCORING_RULES.outcome;
    }
    return SCORING_RULES.miss;
}

export function pointsBreakdown(
    predicted: ScoreTuple,
    actual: ScoreTuple,
): PointBreakdown {
    if (predicted.home === actual.home && predicted.away === actual.away) return "exact";
    if (predicted.home - predicted.away === actual.home - actual.away) return "goalDiff";
    const pOutcome = Math.sign(predicted.home - predicted.away);
    const aOutcome = Math.sign(actual.home - actual.away);
    return pOutcome === aOutcome ? "outcome" : "miss";
}
