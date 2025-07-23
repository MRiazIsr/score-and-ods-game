"use client";

import { useSession } from "@/app/lib/auth/SessionContext";
import { useActionState } from "react";
import { signOut } from "@/app/actions/auth";
import { Card } from "@/app/client/components/ui/Card";
import type { Competition } from "@/app/server/modules/competitions/types";

interface Props {
    competitions: Competition[];
}

export default function HomeClient({ competitions }: Props) {
    const [, logOut, pending] = useActionState(signOut, undefined);
    const session = useSession();

    return (
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
            <h1 className="text-4xl font-bold mb-8">Welcome to the Dashboard</h1>
            <p className="mb-4">{session.user.name}, you are logged in!</p>

            <form action={logOut}>
                <button
                    type="submit"
                    disabled={pending}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    {pending ? "Logging out..." : "Logout"}
                </button>
            </form>



            <div className="flex flex-wrap gap-8 justify-center">
                {competitions.map((c) => (
                    <Card key={c.id} title={c.name}>
                        {/* оболочка‑позиционер, чтобы круг стоял по центру карточки */}
                        <div className="flex justify-center">
                            {/* сам круг с объёмной тенью */}
                            <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-[inset_4px_4px_10px_rgba(0,0,0,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9),0_6px_12px_rgba(0,0,0,0.12)]">
                                <img
                                    src={c.emblem}
                                    alt={c.name}
                                    className="w-16 h-16 object-contain"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
