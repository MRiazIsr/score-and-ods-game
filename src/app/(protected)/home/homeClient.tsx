"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Competition } from "@/app/server/modules/competitions/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
    competitions: Competition[];
}

export default function HomeClient({ competitions }: Props) {
    const router = useRouter();

    const handleCompetitionClick = (competitionId: number) => {
        router.push(`/competition/${competitionId}`);
    };

    return (
        <div className={`z-10 max-w-5xl w-full font-mono text-sm`}>
            <h1 className="text-4xl font-bold mb-8 text-center text-foreground">Choose League</h1>

            <div className="flex flex-wrap gap-8 justify-center">
                {competitions.map((c) => (
                    <Card
                        key={c.id}
                        className="w-64 cursor-pointer hover:scale-105 transition-transform overflow-hidden group"
                        onClick={() => handleCompetitionClick(c.id)}
                    >
                        <CardHeader className="bg-muted/50 py-4 group-hover:bg-muted transition-colors">
                            <CardTitle className="text-center truncate">{c.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-200 p-4 flex items-center justify-center border-t border-border">
                                <Image
                                    src={c.emblem}
                                    alt={c.name}
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}