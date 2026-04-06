import Link from "next/link";
import type { CricAPIMatch } from "@/types/cricapi";

function statusConfig(match: CricAPIMatch) {
  if (!match.matchEnded && match.matchStarted)
    return { label: "LIVE", cls: "bg-red-500/15 text-red-400 border-red-500/20" };
  if (match.matchEnded)
    return { label: "ENDED", cls: "bg-white/5 text-white/40 border-white/8" };
  return { label: "UPCOMING", cls: "bg-[#FDB913]/10 text-[#FDB913] border-[#FDB913]/20" };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return dateStr;
  }
}

export function MatchCard({ match }: { match: CricAPIMatch }) {
  const [team1, team2] = match.teams ?? ["TBD", "TBD"];
  const team1Info = match.teamInfo?.find((t) => t.name === team1 || team1.includes(t.shortname));
  const team2Info = match.teamInfo?.find((t) => t.name === team2 || team2.includes(t.shortname));
  const team1Score = match.score?.find((s) => s.inning.includes(team1));
  const team2Score = match.score?.find((s) => s.inning.includes(team2));
  const status = statusConfig(match);

  return (
    <Link href={`/matches/${match.id}`} className="block">
      <div className="card-hover group relative overflow-hidden rounded-2xl border border-white/6 bg-white/3 backdrop-blur-sm">
        {/* Top accent line — yellow for live, subtle for others */}
        <div className={`absolute inset-x-0 top-0 h-px ${
          match.matchStarted && !match.matchEnded
            ? "bg-gradient-to-r from-transparent via-red-500 to-transparent"
            : match.matchEnded
            ? "bg-gradient-to-r from-transparent via-white/10 to-transparent"
            : "bg-gradient-to-r from-transparent via-[#FDB913]/60 to-transparent"
        }`} />

        <div className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/30 leading-relaxed">
              {match.matchType?.toUpperCase()} · {match.venue?.split(",")[0]}
            </span>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${status.cls}`}>
              {status.label}
            </span>
          </div>

          {/* Teams */}
          <div className="space-y-2.5">
            {[
              { info: team1Info, name: team1, score: team1Score },
              { info: team2Info, name: team2, score: team2Score },
            ].map(({ info, name, score }) => (
              <div key={name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {info?.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={info.img} alt={name} className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/8" />
                  ) : (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 text-xs font-bold text-white/60">
                      {name.charAt(0)}
                    </div>
                  )}
                  <span className="truncate text-sm font-semibold text-white/80">
                    {info?.shortname ?? name}
                  </span>
                </div>
                {score ? (
                  <span className="shrink-0 font-display text-sm font-bold tabular-nums text-white/70">
                    {score.r}/{score.w}
                    <span className="ml-1 text-[10px] font-normal text-white/30">({score.o})</span>
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 border-t border-white/5 pt-2.5">
            <p className="text-[11px] text-white/30 line-clamp-1">
              {match.matchEnded ? match.status : formatDate(match.dateTimeGMT)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
