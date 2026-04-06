import type { Metadata } from "next";
import { HomeLiveSection } from "@/components/home/HomeLiveSection";
import { HomeMatchesSection } from "@/components/home/HomeMatchesSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Yellove — Live Cricket Scores",
};

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-background">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-60" />

        {/* Floating gradient orbs */}
        <div
          className="float-orb pointer-events-none absolute -left-32 top-0 h-[500px] w-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #FDB913 0%, transparent 70%)" }}
        />
        <div
          className="float-orb-slow pointer-events-none absolute -right-40 top-10 h-[400px] w-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)" }}
        />
        <div
          className="float-orb pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #FDB913 0%, transparent 70%)" }}
        />

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-36">
          {/* Live badge */}
          <div className="fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-red-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 live-pulse" />
            Live Scores · Real-Time
          </div>

          {/* Main headline */}
          <h1 className="fade-in-up font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl xl:text-9xl"
            style={{ animationDelay: "0.1s" }}>
            <span className="text-gradient-white block">CRICKET.</span>
            <span className="text-gradient-yellow block">LIVE. LOUD.</span>
          </h1>

          {/* Subtext */}
          <p className="fade-in-up mt-6 max-w-xl text-base text-white/40 sm:text-lg"
            style={{ animationDelay: "0.2s" }}>
            Ball-by-ball scores, full scorecards and live match action —
            built for fans who can&apos;t look away.
          </p>

          {/* CTA buttons */}
          <div className="fade-in-up mt-8 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.3s" }}>
            <Link
              href="/live"
              className="glow-yellow-sm inline-flex items-center gap-2 rounded-full bg-[#FDB913] px-6 py-3 text-sm font-bold text-[#0A0F1E] transition-all hover:glow-yellow hover:bg-[#FFD860]"
            >
              <span className="h-2 w-2 rounded-full bg-[#0A0F1E] live-pulse" />
              Watch Live
            </Link>
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 backdrop-blur transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              View Schedule →
            </Link>
          </div>

          {/* Stats strip */}
          <div className="fade-in-up mt-14 flex flex-wrap gap-6 sm:gap-10"
            style={{ animationDelay: "0.4s" }}>
            {[
              { label: "Live Matches", value: "24/7" },
              { label: "Coverage", value: "Global" },
              { label: "Update Speed", value: "30s" },
              { label: "Formats", value: "T20 · ODI · Test" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-black text-[#FDB913] sm:text-3xl">{stat.value}</p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-white/30">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="relative bg-background">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="relative mx-auto max-w-7xl space-y-14 px-4 py-12">
          <HomeLiveSection />
          <HomeMatchesSection />
        </div>
      </div>
    </div>
  );
}
