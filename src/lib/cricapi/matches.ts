import { cricbuzzGet } from "./client";
import { cachedFetch } from "../cache";
import { transformMatch, extractMatchesFromResponse, imgUrl } from "./_transform";
import type { CricAPIMatch, CricAPIScorecard, InningsScorecard, BatsmanStat, BowlerStat } from "@/types/cricapi";
import type {
  CricbuzzMatchListResponse,
  CricbuzzMatchCenter,
  CricbuzzInningsDetail,
} from "@/types/cricbuzz";

const TTL_CURRENT = 25_000;   // 25s — SSE hot path
const TTL_SCORECARD = 30_000; // 30s
const TTL_LIST = 120_000;     // 2 min

// ---------------------------------------------------------------------------
// Scorecard transformer
// ---------------------------------------------------------------------------

function transformInnings(inning: CricbuzzInningsDetail): InningsScorecard {
  const batData = inning.batTeamDetails;
  const bowlData = inning.bowlTeamDetails;

  const batting: BatsmanStat[] = Object.values(batData.batsmenData ?? {}).map((b) => ({
    batsman: b.batName,
    dismissal: b.outDesc || "not out",
    r: b.runs,
    b: b.balls,
    "4s": b.fours,
    "6s": b.sixes,
    sr: String(b.strikeRate),
  }));

  const bowling: BowlerStat[] = Object.values(bowlData.bowlersData ?? {}).map((b) => ({
    bowler: b.bowlName,
    o: b.overs,
    m: b.maidens,
    r: b.runs,
    w: b.wickets,
    nb: b.no_balls,
    wd: b.wides,
    eco: String(b.economy),
  }));

  return {
    inning: `${batData.batTeamName} Inning ${inning.inningsId}`,
    batting,
    bowling,
    extras: batData.extras,
    target: inning.scoreDetails?.target ? String(inning.scoreDetails.target) : undefined,
  };
}

function transformMatchCenter(data: CricbuzzMatchCenter, matchId: string): CricAPIScorecard {
  const h = data.matchHeader;
  const t1 = h.team1;
  const t2 = h.team2;

  return {
    id: matchId,
    name: `${t1.name} vs ${t2.name}, ${h.matchDesc}`,
    matchType: h.matchFormat.toLowerCase(),
    status: h.status,
    venue: h.venue ? `${h.venue.name}, ${h.venue.city}` : "",
    date: "",
    dateTimeGMT: "",
    teams: [t1.name, t2.name],
    teamInfo: [
      { name: t1.name, shortname: t1.shortName, img: imgUrl(t1.imageId) },
      { name: t2.name, shortname: t2.shortName, img: imgUrl(t2.imageId) },
    ],
    tossResults: h.tossResults
      ? { tossWinner: h.tossResults.tossWinnerName, tossDecision: h.tossResults.decision }
      : undefined,
    matchWinner: h.result?.winningTeam,
    series_id: String(h.seriesId),
    matchStarted: h.matchStarted,
    matchEnded: h.matchEnded,
    scorecard: (data.scorecard ?? []).map(transformInnings),
  };
}

// ---------------------------------------------------------------------------
// Public fetch functions (same signatures as before)
// ---------------------------------------------------------------------------

export async function fetchCurrentMatches(): Promise<CricAPIMatch[]> {
  return cachedFetch(
    "currentMatches",
    () =>
      cricbuzzGet<CricbuzzMatchListResponse>("/matches/v1/live").then(
        extractMatchesFromResponse,
      ),
    TTL_CURRENT,
  );
}

export async function fetchMatches(_offset = 0): Promise<CricAPIMatch[]> {
  return cachedFetch(
    "matchesList",
    async () => {
      const [recent, upcoming] = await Promise.allSettled([
        cricbuzzGet<CricbuzzMatchListResponse>("/matches/v1/recent").then(extractMatchesFromResponse),
        cricbuzzGet<CricbuzzMatchListResponse>("/matches/v1/upcoming").then(extractMatchesFromResponse),
      ]);
      return [
        ...(recent.status === "fulfilled" ? recent.value : []),
        ...(upcoming.status === "fulfilled" ? upcoming.value : []),
      ];
    },
    TTL_LIST,
  );
}

export async function fetchMatchInfo(id: string): Promise<CricAPIMatch> {
  return cachedFetch(
    `matchInfo:${id}`,
    async () => {
      const data = await cricbuzzGet<CricbuzzMatchCenter>(`/mcenter/v1/${id}`);
      const h = data.matchHeader;
      // Construct a minimal CricbuzzMatch to reuse the shared transformer
      return transformMatch({
        matchInfo: {
          matchId: h.matchId,
          seriesId: h.seriesId,
          seriesName: h.seriesDesc ?? "",
          matchDesc: h.matchDesc,
          matchFormat: h.matchFormat,
          startDate: "",
          endDate: "",
          state: h.matchEnded ? "Complete" : h.matchStarted ? "In Progress" : "Upcoming",
          status: h.status,
          team1: { teamId: h.team1.id, teamName: h.team1.name, teamSName: h.team1.shortName, imageId: h.team1.imageId ?? 0 },
          team2: { teamId: h.team2.id, teamName: h.team2.name, teamSName: h.team2.shortName, imageId: h.team2.imageId ?? 0 },
          venueInfo: h.venue ? { id: h.venue.id, ground: h.venue.name, city: h.venue.city } : undefined,
        },
      });
    },
    TTL_SCORECARD,
  );
}

export async function fetchScorecard(id: string): Promise<CricAPIScorecard> {
  return cachedFetch(
    `scorecard:${id}`,
    () =>
      cricbuzzGet<CricbuzzMatchCenter>(`/mcenter/v1/${id}`).then((data) =>
        transformMatchCenter(data, id),
      ),
    TTL_SCORECARD,
  );
}
