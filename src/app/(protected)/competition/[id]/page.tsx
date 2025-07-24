import { getCompetitionMatches } from "@/app/actions/matches";
import MatchesClient from "./matchesClient";
import { notFound } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export default async function CompetitionPage({ params }: Props) {
  // В Next.js 15.4 params должен быть разрешен перед использованием
  const resolvedParams = await Promise.resolve(params);
  const competitionId = parseInt(resolvedParams.id, 10);

  if (isNaN(competitionId)) {
    notFound();
  }

  const matches = await getCompetitionMatches(competitionId);

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl text-white mb-4">No matches found</h1>
        <p className="text-gray-400">There are no active matches for this competition</p>
      </div>
    );
  }

  return <MatchesClient matches={matches} />;
}
