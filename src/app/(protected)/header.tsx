
"use client";

import { useSession } from "@/app/lib/auth/SessionContext";
import { useActionState } from "react";
import { signOut } from "@/app/actions/auth";
import { montserrat } from "@/app/client/fonts/fonts";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
    const [, logOut, pending] = useActionState(signOut, undefined);
    const session = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const isHomePage = pathname === "/home";
    const isScoreboard = pathname === "/scoreboard";

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <header className={`${montserrat.className} fixed top-0 left-0 right-0 z-50 h-12 bg-gradient-to-r from-gray-800 to-gray-900 shadow-xl border-b border-gray-700`}>
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
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
                                className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded flex items-center space-x-1 text-sm"
                            >
                                <span>Home</span>
                            </button>
                        )}
                        {!isScoreboard && (
                            <button
                                onClick={() => handleNavigation('/scoreboard')}
                                className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded flex items-center space-x-1 text-sm"
                            >
                                <span>Score Board</span>
                            </button>
                        )}
                    </div>
                </div>

                <form action={logOut}>
                    <button
                        type="submit"
                        disabled={pending}
                        className="bg-red-500 text-white hover:bg-red-600 py-1 px-3 rounded flex items-center space-x-1 text-sm"
                    >
                        {pending ? "Logging out..." : "Logout"}
                    </button>
                </form>
            </div>
        </header>
    );
}