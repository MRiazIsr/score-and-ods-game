import { NextResponse } from "next/server";
import { getSession } from "@/app/actions/auth";
import { verifyTelegramAuth } from "@/app/lib/oauth/telegram";
import { logError } from "@/app/lib/errors";
import { AuthService } from "@/app/server/services/auth/AuthService";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const query: Record<string, string> = {};
    for (const [k, v] of url.searchParams.entries()) {
        query[k] = v;
    }

    const failure = (reason: string) =>
        NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));

    const verified = verifyTelegramAuth(query);
    if (!verified.ok) {
        if (verified.reason === "no_token") return failure("oauth_not_configured");
        return failure("oauth_failed");
    }

    try {
        const authService = new AuthService();
        const sessionUser = await authService.upsertOAuthUser({
            provider: "telegram",
            providerId: verified.data.id,
            email: null,
            usernameHint:
                verified.data.username ||
                verified.data.firstName ||
                `tg${verified.data.id}`,
        });

        const session = await getSession();
        session.isLoggedIn = true;
        session.user = sessionUser;
        await session.save();

        return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (err) {
        logError("api/auth/telegram/callback", err, { telegramId: verified.data.id });
        return failure("oauth_failed");
    }
}
