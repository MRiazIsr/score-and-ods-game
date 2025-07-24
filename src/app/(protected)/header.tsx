
"use client";

import { useSession } from "@/app/lib/auth/SessionContext";
import { useActionState } from "react";
import { signOut } from "@/app/actions/auth";
import { montserrat } from "@/app/client/fonts/fonts";

export default function Header() {
    const [, logOut, pending] = useActionState(signOut, undefined);
    const session = useSession();

    return (
        <header className={`${montserrat.className} fixed top-0 left-0 right-0 z-50 h-12 bg-gradient-to-r from-gray-800 to-gray-900 shadow-xl border-b border-gray-700`}>
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-lg font-bold text-white">TJ Score Game</h1>
                    <div className="h-6 w-px bg-gray-600"></div>
                    <p className="text-sm text-gray-300">
                        Welcome, <span className="text-white font-medium">{session?.user?.name || 'User'}</span>
                    </p>
                </div>

                <form action={logOut}>
                    <button
                        type="submit"
                        disabled={pending}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        {pending ? "Logging out..." : "Logout"}
                    </button>
                </form>
            </div>
        </header>
    );
}