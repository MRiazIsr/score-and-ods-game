"use client";

import { useSession } from "@/app/lib/auth/SessionContext";
import { useActionState, useEffect, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { PitchrLogo } from "@/app/client/components/stadium/Logo";

function useIsNarrowViewport(): boolean {
    const [isNarrow, setIsNarrow] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        setIsNarrow(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return isNarrow;
}

function navItems() {
    return [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/leagues", label: "Leagues" },
        { href: "/scoreboard", label: "Global Leaderboard" },
    ];
}

export default function Header() {
    const [, logOut, pending] = useActionState(signOut, undefined);
    const session = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const isNarrow = useIsNarrowViewport();

    const name = session?.user?.name || "Player";
    const initial = name.slice(0, 2).toUpperCase();

    const go = (path: string) => {
        router.push(path);
        setMenuOpen(false);
    };

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50"
            style={{
                height: 56,
                background: "#fff",
                borderBottom: "1px solid #E4E1D6",
            }}
        >
            <div
                className="flex items-center justify-between h-full"
                style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}
            >
                {/* left: logo + primary nav */}
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" aria-label="Pitchr home">
                        <PitchrLogo />
                    </Link>

                    <nav className="flex gap-1" style={{ display: isNarrow ? "none" : "flex" }}>
                        {navItems().map((item) => {
                            const active = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <button
                                    key={item.href}
                                    type="button"
                                    onClick={() => go(item.href)}
                                    style={{
                                        padding: "7px 12px",
                                        background: active ? "#E0E7FF" : "transparent",
                                        color: active ? "#1E3A8A" : "#4A5148",
                                        border: "none",
                                        borderRadius: 4,
                                        fontSize: 13,
                                        fontWeight: active ? 700 : 500,
                                        cursor: "pointer",
                                        transition: "background 0.15s, color 0.15s",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* right: avatar + sign out */}
                <div className="items-center gap-3" style={{ display: isNarrow ? "none" : "flex" }}>
                    <div className="text-ink2 text-right" style={{ fontSize: 12, lineHeight: 1.2 }}>
                        <div className="uppercase" style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>
                            Signed in
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0B0F0A" }}>{name}</div>
                    </div>
                    <div
                        className="flex items-center justify-center font-display"
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            background: "#9D0010",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                        }}
                    >
                        {initial}
                    </div>
                    <form action={logOut}>
                        <button
                            type="submit"
                            disabled={pending}
                            className="uppercase"
                            style={{
                                padding: "7px 12px",
                                background: "transparent",
                                color: pending ? "#9CA3AF" : "#4A5148",
                                border: "1.5px solid #E4E1D6",
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                cursor: pending ? "not-allowed" : "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            {pending ? "Signing out…" : "Sign out"}
                        </button>
                    </form>
                </div>

                {/* mobile menu button */}
                {isNarrow && (
                    <button
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Toggle menu"
                        style={{
                            width: 36,
                            height: 36,
                            background: "transparent",
                            border: "1.5px solid #E4E1D6",
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B0F0A" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                )}
            </div>

            {/* mobile drawer */}
            {isNarrow && menuOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: 56,
                        left: 0,
                        right: 0,
                        background: "#fff",
                        borderBottom: "1px solid #E4E1D6",
                        boxShadow: "0 12px 24px rgba(15,25,15,0.08)",
                        padding: 16,
                    }}
                >
                    <div className="text-ink2" style={{ fontSize: 11, marginBottom: 10 }}>
                        Signed in as <strong style={{ color: "#0B0F0A" }}>{name}</strong>
                    </div>
                    <div className="grid gap-2">
                        {navItems().map((item) => {
                            const active = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <button
                                    key={item.href}
                                    type="button"
                                    onClick={() => go(item.href)}
                                    style={{
                                        padding: "10px 12px",
                                        background: active ? "#E0E7FF" : "#F4F2EC",
                                        color: active ? "#1E3A8A" : "#0B0F0A",
                                        border: "none",
                                        borderRadius: 6,
                                        fontSize: 13,
                                        fontWeight: active ? 700 : 500,
                                        cursor: "pointer",
                                        textAlign: "left",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                        <form action={logOut}>
                            <button
                                type="submit"
                                disabled={pending}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    background: "#9D0010",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: pending ? "not-allowed" : "pointer",
                                    fontFamily: "inherit",
                                }}
                            >
                                {pending ? "Signing out…" : "Sign out"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
}
