type T = (key: string, values?: Record<string, string | number | Date>) => string;

const KNOWN_STAGES = new Set([
    "PRELIMINARY_ROUND",
    "PRELIMINARY_SEMI_FINALS",
    "PRELIMINARY_FINAL",
    "PLAYOFFS",
    "PLAYOFFS_ROUND_1",
    "PLAYOFFS_ROUND_2",
    "FIRST_ROUND",
    "SECOND_ROUND",
    "THIRD_ROUND",
    "LEAGUE_STAGE",
    "LAST_32",
    "LAST_16",
    "QUARTER_FINALS",
    "SEMI_FINALS",
    "THIRD_PLACE",
    "FINAL",
]);

function titleCase(s: string): string {
    return s
        .toLowerCase()
        .split(/[_\s]+/)
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
}

export function stageLabel(t: T, stage: string): string {
    if (!stage) return "";
    if (!KNOWN_STAGES.has(stage)) return titleCase(stage);
    // next-intl typed messages cannot be indexed by a runtime string statically,
    // but at runtime the call resolves correctly. We assert the call site.
    const key = `competition.stage.${stage}`;
    try {
        const out = (t as (key: string) => string)(key);
        return out && out !== key ? out : titleCase(stage);
    } catch {
        return titleCase(stage);
    }
}
