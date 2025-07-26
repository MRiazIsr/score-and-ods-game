import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import { getCompetitionMatches } from '@/app/actions/matches';
import MatchesClient from './matchesClient';

export default async function CompetitionPage({ params }: {params: Promise<{ id: string }>}) {
    const { id } = await params;
    const session = await getSession();
    if (!session?.isLoggedIn) redirect('/login');

    const competitionId = Number(id);
    if (Number.isNaN(competitionId)) notFound();

    const matches = await getCompetitionMatches(competitionId);

    if (!matches?.length) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl text-white mb-4">No matches found</h1>
                <p className="text-gray-400">
                    There are no active matches for this competition
                </p>
            </div>
        );
    }

    return <MatchesClient matches={matches} />;
}
