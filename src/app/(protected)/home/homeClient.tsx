"use client";

import { useSession } from "@/app/lib/auth/SessionContext";
import { Card } from "@/app/client/components/ui/Card";
import type { Competition } from "@/app/server/modules/competitions/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
    competitions: Competition[];
}

export default function HomeClient({ competitions }: Props) {
    const session = useSession();
    const router = useRouter();

    console.log(session);

    const handleCompetitionClick = (competitionId: number) => {
        router.push(`/competition/${competitionId}`);
    };

    return (
        <div className={`z-10 max-w-5xl w-full items-center justify-between font-mono text-sm`}>
            <h1 className="text-4xl font-bold mb-8 text-center text-white">Choose League</h1>

            <div className="flex flex-wrap gap-8 justify-center">
                {competitions.map((c) => (
                    <div key={c.id} onClick={() => handleCompetitionClick(c.id)}>
                        <Card title={c.name} pointer={true} variant="competition">
                            <div className="w-full h-32 bg-white flex items-center justify-center border-b border-gray-600">
                                <Image
                                    src={c.emblem}
                                    alt={c.name}
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}