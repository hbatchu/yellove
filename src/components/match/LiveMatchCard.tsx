"use client";

import Link from "next/link";
import type { CricAPIMatch } from "@/types/cricapi";

interface LiveMatchCardProps {
  match: CricAPIMatch;
}

export function LiveMatchCard({ match }: LiveMatchCardProps) {
  const [team1, team2] = match.teams ?? ["TBD", "TBD"];
  const team1Score = match.score?.find((s) => s.inning.includes(team1));
  const team2Score = match.score?.find((s) => s.inning.includes(team2));
  const team1Info = match.teamInfo?.find((t) => t.name === team1 || team1.includes(t.shortname));
  const team2Info = match.teamInfo?.find((t) => t.name === team2 || team2.includes(t.shortname));

  return (
    <Link href={`/matches/${match.id}`} className="block">
      <div className="card-hover group relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl">
        {/* Yellow top glow bar */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FDB913] to-transparent" />

        {/* Subtle inner glow on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(ellipse at top, rgba(253,185,19,0.08) 0%, transparent 60%)" }} />

        <div className="relative p-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
              {match.matchType?.toUpperCase()} · {match.venue?.split(",")[0]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 live-pulse" />
              Live
            </span>
          </div>

          {/* Teams */}
          <div className="space-y-3">
            {[
              { info: team1Info, name: team1, score: team1Score, isPrimary: true },
              { info: team2Info, name: team2, score: team2Score, isPrimary: false },
            ].map(({ info, name, score, isPrimary }) => (
              <div key={name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Team avatar */}
                  <div className="relative shrink-0">
                    {info?.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={info.img}
                        alt={name}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#253570] to-[#1A2B5F] text-sm font-black text-[#FDB913] ring-1 ring-white/10">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="truncate text-sm font-bold text-white/90">
                    {info?.shortname ?? name}
                  </span>
                </div>

                {/* Score */}
                {score ? (
                  <div className="shrink-0 text-right">
                    <span className={`font-display text-lg font-black tabular-nums ${isPrimary ? "text-gradient-yellow" : "text-white/80"}`}>
                      {score.r}/{score.w}
                    </span>
                    <span className="ml-1.5 text-[11px] text-white/30">({score.o})</span>
                  </div>
                ) : (
                  <span className="shrink-0 text-xs text-white/25">Yet to bat</span>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

          {/* Status */}
          <p className="text-[11px] leading-relaxed text-white/40 line-clamp-2">{match.status}</p>
        </div>

        {/* Bottom accent */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </Link>
  );
}
