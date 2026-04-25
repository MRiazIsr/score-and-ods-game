import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import MatchesClient from './matchesClient';
import { getAllMatchTabs, getCompetitionData } from "@/app/actions/competitions";

export default async function CompetitionPage({ params }: {params: Promise<{ id: string }>}) {
    const { id } = await params;
    const session = await getSession();
    if (!session?.isLoggedIn) redirect('/login');

    const competitionId = Number(id);
    if (Number.isNaN(competitionId)) notFound();

    const competition = await getCompetitionData(competitionId);
    if (!competition) notFound();
    const matchTabs = await getAllMatchTabs(competitionId);

    return <MatchesClient competition={competition} matchTabs={matchTabs} />;
}
