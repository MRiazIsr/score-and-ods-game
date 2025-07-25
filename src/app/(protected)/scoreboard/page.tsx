import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";
import { getCompetitions } from "@/app/actions/competitions";
import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";
import ScoreboardClient from "./scoreboardClient";

export default async function ScoreboardPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  // Получаем данные о компетициях
  const competitions = await getCompetitions();

  // Устанавливаем Premier League как компетицию по умолчанию
  const defaultCompetitionId = CompetitionsEntity.competitionsIds.ENGLISH_PREMIER_LEAGUE_ID;

  return (
    <div className="pt-16 px-4 max-w-6xl mx-auto">
      <ScoreboardClient 
        competitions={competitions} 
        defaultCompetitionId={defaultCompetitionId}
        currentUserId={session.user?.id}
      />
    </div>
  );
}
