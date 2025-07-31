"use client";

import { useSession } from "@/app/lib/auth/SessionContext";
import { useActionState, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { montserrat } from "@/app/client/fonts/fonts";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
    const [, logOut, pending] = useActionState(signOut, undefined);
    const session = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const isHomePage = pathname === "/home";
    const isScoreboard = pathname === "/scoreboard";

    const handleNavigation = (path: string) => {
        router.push(path);
        setMenuOpen(false);
    };

    return (
        <header className={`${montserrat.className} fixed top-0 left-0 right-0 z-50 h-14 md:h-12 bg-gradient-to-r from-gray-800 to-gray-900 shadow-xl border-b border-gray-700`}>
            <div className="max-w-7xl mx-auto h-full px-3 md:px-6 flex items-center justify-between">
                {/* Mobile layout */}
                <div className="md:hidden flex items-center justify-between w-full">
                    <h1 className="text-base font-bold text-white">TJ Score Game</h1>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-white p-1"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:flex items-center space-x-4">
                    <h1 className="text-lg font-bold text-white">TJ Score Game</h1>
                    <div className="h-6 w-px bg-gray-600"></div>
                    <p className="text-sm text-gray-300">
                        Welcome, <span className="text-white font-medium">{session?.user?.name || 'User'}</span>
                    </p>
                    <div className="h-6 w-px bg-gray-600"></div>
                    <div className="flex space-x-2">
                        {!isHomePage && (
                            <button
                                onClick={() => handleNavigation('/home')}
                                className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded text-sm"
                            >
                                Home
                            </button>
                        )}
                        {!isScoreboard && (
                            <button
                                onClick={() => handleNavigation('/scoreboard')}
                                className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded text-sm"
                            >
                                Score Board
                            </button>
                        )}
                    </div>
                </div>

                <form action={logOut} className="hidden md:block">
                    <button
                        type="submit"
                        disabled={pending}
                        className="bg-red-500 text-white hover:bg-red-600 py-1 px-3 rounded text-sm"
                    >
                        {pending ? "Logging out..." : "Logout"}
                    </button>
                </form>

                {/* Mobile dropdown menu */}
                {menuOpen && (
                    <div className="absolute top-14 left-0 right-0 bg-gray-800 border-t border-gray-700 md:hidden">
                        <div className="px-3 py-2 space-y-2">
                            <p className="text-xs text-gray-300 border-b border-gray-600 pb-2">
                                Welcome, <span className="text-white">{session?.user?.name || 'User'}</span>
                            </p>
                            {!isHomePage && (
                                <button
                                    onClick={() => handleNavigation('/home')}
                                    className="block w-full text-left bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
                                >
                                    Home
                                </button>
                            )}
                            {!isScoreboard && (
                                <button
                                    onClick={() => handleNavigation('/scoreboard')}
                                    className="block w-full text-left bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
                                >
                                    Score Board
                                </button>
                            )}
                            <form action={logOut} className="pt-2 border-t border-gray-600">
                                <button
                                    type="submit"
                                    disabled={pending}
                                    className="block w-full bg-red-500 text-white hover:bg-red-600 py-2 px-3 rounded text-sm"
                                >
                                    {pending ? "Logging out..." : "Logout"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}