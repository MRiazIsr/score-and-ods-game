import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { buildAuthUrl, getGoogleConfig } from "@/app/lib/oauth/google";
import { buildAppUrl } from "@/app/lib/oauth/url";

const STATE_COOKIE = "oauth_state";
const STATE_MAX_AGE = 600; // 10 minutes

export async function GET(request: Request) {
    const config = getGoogleConfig();
    if (!config) {
        return NextResponse.redirect(buildAppUrl(request, "/login?error=oauth_not_configured"));
    }

    const state = randomBytes(16).toString("hex");
    const url = buildAuthUrl(config, state);

    const response = NextResponse.redirect(url);
    response.cookies.set(STATE_COOKIE, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: STATE_MAX_AGE,
    });
    return response;
}
