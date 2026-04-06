"use client";

import { useLiveScores } from "@/hooks/useLiveScores";
import { LiveMatchCard } from "@/components/match/LiveMatchCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import Link from "next/link";

export function HomeLiveSection() {
  const { liveMatches, connected } = useLiveScores();
  const live = liveMatches.filter((m) => m.matchStarted && !m.matchEnded);

  if (!connected && !live.length) {
    return (
      <div>
        <SectionHeading title="Live Now" accent />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-44 rounded-2xl border border-white/6 bg-white/3" />
          ))}
        </div>
      </div>
    );
  }

  if (!live.length) {
    return (
      <div>
        <SectionHeading title="Live Now" accent />
        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/2 py-14 text-center">
          <div className="mb-3 text-3xl">🏏</div>
          <p className="font-semibold text-white/50">No live matches right now</p>
          <p className="mt-1 text-sm text-white/25">Check the schedule for upcoming matches</p>
          <Link
            href="/matches"
            className="mt-5 inline-block rounded-full bg-[#FDB913] px-5 py-2 text-sm font-bold text-[#0A0F1E] transition-all hover:bg-[#FFD860]"
          >
            View Schedule
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <SectionHeading title="Live Now" accent />
        <Link href="/live" className="text-sm font-semibold text-[#FDB913]/70 transition-colors hover:text-[#FDB913]">
          View all →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {live.slice(0, 6).map((match) => (
          <LiveMatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
