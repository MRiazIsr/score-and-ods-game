import { cookies } from "next/headers";
import { sessionOptions } from "@/app/lib/auth/definitions";
import { unsealData } from "iron-session";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { SessionData } from "@/app/lib/auth/types";
import { SessionProvider } from "@/app/lib/auth/SessionContext";

interface ProtectedLayoutProps {
    children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
    const cookieStore = await cookies();
    const sealed = cookieStore.get(sessionOptions.cookieName)?.value;

    if (!sealed) {
        redirect("/login");
    }

    let session: SessionData | null = null;
    try {
        session = await unsealData<SessionData>(sealed, {
            password: sessionOptions.password,
        });
    } catch {
        redirect("/login");
    }

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <SessionProvider user={session?.user}>
            {children}
        </SessionProvider>
    );}