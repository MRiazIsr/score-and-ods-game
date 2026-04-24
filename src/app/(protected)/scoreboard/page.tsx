import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";
import { getCompetitions } from "@/app/actions/competitions";
import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";
import ScoreboardClient from "./scoreboardClient";
import {Competition} from "@/app/server/modules/competitions/types";

export default async function ScoreboardPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  const competitions: Competition[] = await getCompetitions();

  const defaultCompetitionId = CompetitionsEntity.competitionsIds.ENGLISH_PREMIER_LEAGUE_ID;

  return (
    <div
      className="w-full"
      style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 48px" }}
    >
      <ScoreboardClient
        competitions={competitions}
        defaultCompetitionId={defaultCompetitionId}
        currentUserId={session.user?.userId}
      />
    </div>
  );
}
