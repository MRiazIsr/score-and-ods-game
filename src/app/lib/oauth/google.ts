import { getOptionalEnv } from "@/app/lib/helpers/envHeplper";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const SCOPE = "openid email profile";

export interface GoogleConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

export interface GoogleProfile {
    sub: string;
    email: string | null;
    emailVerified: boolean;
    name: string | null;
}

/** Returns config if fully configured, otherwise null (and the caller should surface "not configured"). */
export function getGoogleConfig(): GoogleConfig | null {
    const clientId = getOptionalEnv("GOOGLE_CLIENT_ID");
    const clientSecret = getOptionalEnv("GOOGLE_CLIENT_SECRET");
    const redirectUri = getOptionalEnv("GOOGLE_REDIRECT_URI");
    if (!clientId || !clientSecret || !redirectUri) return null;
    return { clientId, clientSecret, redirectUri };
}

export function buildAuthUrl(config: GoogleConfig, state: string): string {
    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: SCOPE,
        state,
        access_type: "online",
        prompt: "select_account",
    });
    return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(
    config: GoogleConfig,
    code: string,
): Promise<{ accessToken: string }> {
    const body = new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
    });
    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });
    if (!res.ok) {
        throw new Error(`Google token exchange failed: ${res.status}`);
    }
    const json = (await res.json()) as { access_token?: string };
    if (!json.access_token) {
        throw new Error("Google token exchange returned no access_token");
    }
    return { accessToken: json.access_token };
}

export async function fetchProfile(accessToken: string): Promise<GoogleProfile> {
    const res = await fetch(USERINFO_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
        throw new Error(`Google userinfo fetch failed: ${res.status}`);
    }
    const json = (await res.json()) as {
        sub?: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
    };
    if (!json.sub) {
        throw new Error("Google userinfo returned no sub");
    }
    return {
        sub: json.sub,
        email: json.email ?? null,
        emailVerified: json.email_verified === true,
        name: json.name ?? null,
    };
}
