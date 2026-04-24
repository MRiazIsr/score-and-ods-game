/**
 * Fetcher entry point — runs one full sync cycle across all tracked competitions
 * and exits. Designed to be invoked by a systemd-timer (hourly) on the VPS.
 *
 * Build: `npm run fetcher:build` → dist/fetcher/index.js
 * Run:   `node dist/fetcher/index.js`
 */
import { createApiClient, loadConfig } from "./apiClient";
import { syncCompetition } from "./syncCompetition";
import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";
import { prisma } from "@/app/server/db/client";

async function main(): Promise<number> {
    const config = loadConfig();
    const api = createApiClient(config);

    const ids = CompetitionsEntity.competitionsIdArray;
    console.log(`[fetcher] starting sync for ${ids.length} competitions: ${ids.join(", ")}`);

    let failures = 0;
    for (const cid of ids) {
        try {
            await syncCompetition(api, cid);
        } catch (e) {
            failures++;
            console.error(`[fetcher] competition ${cid} failed:`, e);
        }
    }

    console.log(`[fetcher] done; ${ids.length - failures} ok, ${failures} failed`);
    return failures === 0 ? 0 : 1;
}

main()
    .then((code) => {
        return prisma.$disconnect().then(() => process.exit(code));
    })
    .catch((err) => {
        console.error("[fetcher] fatal error:", err);
        return prisma.$disconnect().then(() => process.exit(2));
    });
