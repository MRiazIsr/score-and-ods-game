// app/(protected)/home/page.tsx  – SERVER component (no "use client")
import { getCompetitions } from "@/app/actions/competitions";
import HomeClient from "./homeClient";

export default async function HomePage() {
    const competitionsNested = await getCompetitions(); // runs on server
    const competitions = competitionsNested.flat();     // if needed
    return <HomeClient competitions={competitions} />;
}