"use client";

import { useLiveScores } from "@/hooks/useLiveScores";
import type { CricAPIMatch } from "@/types/cricapi";

function formatScore(match: CricAPIMatch): string {
  if (!match.score?.length) return match.status;
  return match.score
    .map((s) => `${s.inning.replace(" Inning 1", "").replace(" Inning 2", " (2nd)")} ${s.r}/${s.w} (${s.o})`)
    .join("  ·  ");
}

export function LiveTicker() {
  const { liveMatches } = useLiveScores();
  const items = liveMatches.filter((m) => m.matchStarted && !m.matchEnded);

  if (!items.length) return null;

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-b border-white/5 bg-[#0A0F1E]">
      {/* Left fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0A0F1E] to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0A0F1E] to-transparent" />

      {/* Label */}
      <div className="absolute inset-y-0 left-0 z-20 flex items-center">
        <div className="flex h-full items-center gap-1.5 border-r border-white/8 bg-[#0A0F1E] px-3">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 live-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Live</span>
        </div>
      </div>

      <div className="ticker-animate flex whitespace-nowrap py-2 pl-28">
        {doubled.map((match, idx) => (
          <span key={`${match.id}-${idx}`} className="mr-10 inline-flex items-center gap-2 text-xs">
            <span className="font-bold text-[#FDB913]">
              {match.teamInfo?.[0]?.shortname ?? match.teams?.[0] ?? "?"} vs {match.teamInfo?.[1]?.shortname ?? match.teams?.[1] ?? "?"}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-white/60">{formatScore(match)}</span>
            <span className="text-white/15">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
