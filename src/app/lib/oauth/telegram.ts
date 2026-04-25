import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getOptionalEnv } from "@/app/lib/helpers/envHeplper";

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

export interface TelegramAuthData {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    photoUrl: string | null;
    authDate: number;
}

export type TelegramVerifyResult =
    | { ok: true; data: TelegramAuthData }
    | { ok: false; reason: "no_token" | "missing_hash" | "bad_signature" | "expired" | "missing_id" };

/**
 * Verify a Telegram Login Widget callback.
 * @see https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramAuth(query: Record<string, string>): TelegramVerifyResult {
    const token = getOptionalEnv("TELEGRAM_BOT_TOKEN");
    if (!token) return { ok: false, reason: "no_token" };

    const hash = query.hash;
    if (!hash) return { ok: false, reason: "missing_hash" };

    const dataCheckString = Object.keys(query)
        .filter((k) => k !== "hash")
        .sort()
        .map((k) => `${k}=${query[k]}`)
        .join("\n");

    const secretKey = createHash("sha256").update(token).digest();
    const expected = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    const hashBuf = Buffer.from(hash, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (hashBuf.length !== expectedBuf.length || !timingSafeEqual(hashBuf, expectedBuf)) {
        return { ok: false, reason: "bad_signature" };
    }

    const authDate = Number(query.auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(authDate) || now - authDate > MAX_AUTH_AGE_SECONDS) {
        return { ok: false, reason: "expired" };
    }

    if (!query.id) return { ok: false, reason: "missing_id" };

    return {
        ok: true,
        data: {
            id: query.id,
            firstName: query.first_name ?? null,
            lastName: query.last_name ?? null,
            username: query.username ?? null,
            photoUrl: query.photo_url ?? null,
            authDate,
        },
    };
}
