"use client";

import { useMatches } from "@/hooks/useMatches";
import { MatchCard } from "@/components/match/MatchCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ErrorState } from "@/components/shared/ErrorState";
import Link from "next/link";

export function HomeMatchesSection() {
  const { data: matches, isLoading, isError } = useMatches(0);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <SectionHeading title="Recent & Upcoming" />
        <Link href="/matches" className="text-sm font-semibold text-[#FDB913]/70 transition-colors hover:text-[#FDB913]">
          View all →
        </Link>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shimmer h-36 rounded-2xl border border-white/6 bg-white/3" />
          ))}
        </div>
      )}
      {isError && <ErrorState />}
      {matches && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.slice(0, 9).map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
