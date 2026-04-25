"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/app/lib/auth/definitions";
import type { SessionData } from "@/app/lib/auth/types";
import { isLocale } from "@/i18n/request";

export async function setLocale(next: string): Promise<void> {
    if (!isLocale(next)) return;
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.locale = next;
    await session.save();
}
