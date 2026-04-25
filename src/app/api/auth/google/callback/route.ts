import { NextResponse } from "next/server";
import { getSession } from "@/app/actions/auth";
import { exchangeCode, fetchProfile, getGoogleConfig } from "@/app/lib/oauth/google";
import { logError } from "@/app/lib/errors";
import { AuthService } from "@/app/server/services/auth/AuthService";

const STATE_COOKIE = "oauth_state";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const cookieState = request.headers
        .get("cookie")
        ?.split(";")
        .map((s) => s.trim())
        .find((s) => s.startsWith(`${STATE_COOKIE}=`))
        ?.split("=")[1];

    const failure = (reason: string) =>
        NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));

    const config = getGoogleConfig();
    if (!config) return failure("oauth_not_configured");

    if (!code || !stateParam || !cookieState || stateParam !== cookieState) {
        return failure("oauth_state_mismatch");
    }

    try {
        const { accessToken } = await exchangeCode(config, code);
        const profile = await fetchProfile(accessToken);

        if (profile.email && !profile.emailVerified) {
            return failure("oauth_email_unverified");
        }

        const authService = new AuthService();
        const sessionUser = await authService.upsertOAuthUser({
            provider: "google",
            providerId: profile.sub,
            email: profile.email,
            emailVerified: profile.emailVerified,
            usernameHint: profile.email ? profile.email.split("@")[0] : profile.name ?? "user",
        });

        const session = await getSession();
        session.isLoggedIn = true;
        session.user = sessionUser;
        await session.save();

        const response = NextResponse.redirect(new URL("/dashboard", request.url));
        response.cookies.delete(STATE_COOKIE);
        return response;
    } catch (err) {
        logError("api/auth/google/callback", err);
        return failure("oauth_failed");
    }
}
