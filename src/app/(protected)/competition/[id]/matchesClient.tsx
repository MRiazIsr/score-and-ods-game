"use client";

import {Competition, Match, MatchDayWithStatus} from "@/app/server/modules/competitions/types";
import Image from "next/image";
import {useState, useCallback, useTransition, useEffect, useRef} from "react";
import {getCompetitionMatches} from "@/app/actions/matches";
import { MatchCard } from "@/components/match-card";
import { Button } from "@/components/ui/button";

interface Props {
  competition: Competition;
  matchDays: MatchDayWithStatus[];
}

export default function MatchesClient({competition, matchDays }: Props) {
  const [selectedMatchDay, setSelectedMatchDay] = useState<number>(competition.activeMatchDay);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pending, startTransition] = useTransition();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectMatchDay = useCallback((day: number) => {
    startTransition(async () => {
      const data = await getCompetitionMatches(competition.id, day);
      setSelectedMatchDay(day);
      setMatches(data ?? []);
    });
  }, [competition.id]);

  useEffect(() => {
    selectMatchDay(selectedMatchDay);
  }, [selectedMatchDay, selectMatchDay]);

  const scrollToActive = useCallback(() => {
      if (scrollContainerRef.current && matchDays.length > 0) {
          const nextIndex = matchDays.findIndex(md => md.status === 'NEXT');
          if (nextIndex !== -1) {
              const targetIndex = Math.max(0, nextIndex - 1);
              // Button width (w-20 = 80px) + space (space-x-2 = 8px) = 88px
              const scrollPosition = targetIndex * 88;
              scrollContainerRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
          } else {
             // If no NEXT (all past), scroll to end
             scrollContainerRef.current.scrollTo({ left: scrollContainerRef.current.scrollWidth, behavior: 'smooth' });
          }
      }
  }, [matchDays]);

  useEffect(() => {
      scrollToActive();
  }, [scrollToActive]);

  return (
      <div className="z-10 max-w-5xl w-full items-center justify-between px-4 md:px-0">
        <div className="flex flex-col md:flex-row items-center justify-center mb-6 md:mb-8">
          {competition && (
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                <div className="bg-zinc-100 dark:bg-zinc-200 p-2 md:p-3 rounded-xl flex items-center justify-center">
                  <Image
                      src={competition.emblem}
                      alt={competition.name}
                      width={40}
                      height={40}
                      className="object-contain md:w-[60px] md:h-[60px]"
                  />
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-center text-foreground">
                  {competition.name} Matches
                </h1>
              </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
            <div 
                ref={scrollContainerRef}
                className="overflow-x-auto no-scrollbar scroll-smooth flex-grow"
            >
              <div className="inline-flex space-x-2">
                {matchDays.map((md) => {
                  const isActive = md.matchDay === selectedMatchDay;
                  
                  let statusBorderClass = "";
                  if (md.status === 'PAST') statusBorderClass = "border-b-4 border-red-500 rounded-b-none";
                  else if (md.status === 'NEXT') statusBorderClass = "border-b-4 border-green-500 rounded-b-none";
                  else if (md.status === 'FUTURE') statusBorderClass = "border-b-4 border-blue-500 rounded-b-none";

                  return (
                      <Button
                          key={md.matchDay}
                          variant={isActive ? "default" : "secondary"}
                          onClick={() => setSelectedMatchDay(md.matchDay)}
                          className={`w-20 ${statusBorderClass}`}
                          disabled={pending}
                      >
                        Day {md.matchDay}
                      </Button>
                  );
                })}
              </div>
            </div>
            
            <Button
                variant="outline"
                size="sm"
                onClick={scrollToActive}
                className="flex-shrink-0 whitespace-nowrap"
            >
                Back to actual day
            </Button>
        </div>

        <div className="flex flex-col gap-4 md:gap-6 pb-8">
          {pending ? (
              <div className="flex justify-center py-8">
                  <span className="loading loading-spinner text-primary">Loading matches...</span>
              </div>
          ) : (
             matches.length > 0 ? (
                 matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                 ))
             ) : (
                 <div className="text-center text-muted-foreground py-8">
                     No matches found for this day.
                 </div>
             )
          )}
        </div>
      </div>
  );
}