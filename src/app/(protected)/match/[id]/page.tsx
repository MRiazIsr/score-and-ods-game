import { notFound } from "next/navigation";
import { CompetitionsService, type TeamFormResult } from "@/app/server/services/auth/CompetitionsService";
import { CompetitionsEntity } from "@/app/server/entities/CompetitionsEntity";
import { CrowdService, type CrowdBucket } from "@/app/server/services/auth/CrowdService";
import { CompetitionModel } from "@/app/server/models/CompetitionModel";
import { selectFactory } from "@/app/server/modules/factories/competitionsFactory/CompetitionsFactorySelector";
import type { Match } from "@/app/server/modules/competitions/types";
import { getSession } from "@/app/actions/auth";
import MatchDetailClient from "./matchDetailClient";

export const revalidate = 60;

function h2hInSeason(matches: Match[], homeId: number, awayId: number): Match[] {
    return matches
        .filter(
            (m) =>
                m.status === "FINISHED" &&
                m.score.fullTime.home !== null &&
                m.score.fullTime.away !== null &&
                ((m.homeTeam.id === homeId && m.awayTeam.id === awayId) ||
                    (m.homeTeam.id === awayId && m.awayTeam.id === homeId)),
        )
        .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
        .slice(0, 3);
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const matchId = Number(id);
    if (Number.isNaN(matchId)) notFound();

    const session = await getSession();
    const userId = session.user?.userId;
    if (!userId) notFound();

    const competitionsService = new CompetitionsService();
    const found = await competitionsService.findMatchById(matchId, CompetitionsEntity.competitionsIdArray);
    if (!found) notFound();

    const { match, season } = found;

    // Attach user prediction to match
    try {
        const existing = await CompetitionModel.getMatchScore(
            userId,
            match.competition.id,
            season,
            match.matchday,
            match.id,
        );
        if (existing.Item) {
            match.predictedScore = {
                home: existing.Item.homeScore as number,
                away: existing.Item.awayScore as number,
                isPredicted: true,
            };
        }
    } catch (e) {
        console.error("Error loading user prediction:", e);
    }

    const crowdService = new CrowdService();
    const factory = selectFactory(process.env.DB_TYPE);
    const manager = factory.createCompetitionsManager();

    const [homeForm, awayForm, crowd, allMatchesInCompetition]: [
        TeamFormResult[],
        TeamFormResult[],
        CrowdBucket[],
        Match[],
    ] = await Promise.all([
        competitionsService.getRecentMatchResults(
            match.homeTeam.id,
            CompetitionsEntity.competitionsIdArray,
            5,
        ),
        competitionsService.getRecentMatchResults(
            match.awayTeam.id,
            CompetitionsEntity.competitionsIdArray,
            5,
        ),
        crowdService.getCrowdPicks(match.id, match.competition.id, season, match.matchday),
        manager.getAllMatches(match.competition.id, season),
    ]);

    const h2h = h2hInSeason(allMatchesInCompetition, match.homeTeam.id, match.awayTeam.id);

    return (
        <MatchDetailClient
            match={match}
            season={season}
            homeForm={homeForm}
            awayForm={awayForm}
            crowd={crowd}
            h2h={h2h}
        />
    );
}
