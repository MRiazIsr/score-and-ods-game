import { NextResponse } from "next/server";
import { userRepository } from "@/app/server/db/repositories/userRepository";

const USERNAME_REGEX = /^[a-z0-9_]+$/;

export async function GET(request: Request) {
    const url = new URL(request.url);
    const username = url.searchParams.get("username")?.trim().toLowerCase() ?? "";
    const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";

    if (!username && !email) {
        return NextResponse.json({ error: "Provide username or email." }, { status: 400 });
    }

    if (username) {
        if (username.length < 2 || username.length > 32 || !USERNAME_REGEX.test(username)) {
            return NextResponse.json({ field: "username", available: false, reason: "format" });
        }
        const taken = await userRepository.existsByUsername(username);
        return NextResponse.json({ field: "username", available: !taken });
    }

    // email
    const taken = await userRepository.existsByEmail(email);
    return NextResponse.json({ field: "email", available: !taken });
}
