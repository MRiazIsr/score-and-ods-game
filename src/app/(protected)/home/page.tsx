"use client"

import { useSession } from "@/app/lib/auth/SessionContext";
import {useActionState} from "react";
import { signOut} from "@/app/actions/auth";

export default function Home() {
    const [ , logOutAction, pending] = useActionState(signOut, undefined);
    const session = useSession()

    return (
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
            <h1 className="text-4xl font-bold mb-8">Welcome to the Dashboard</h1>
            <p className="mb-4">{session.user.name} You are logged in!</p>
            <form action={logOutAction}>
                <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={pending}
                >
                    {pending ? "Logging out..." : "Logout"}
                </button>
            </form>
        </div>
    );
}