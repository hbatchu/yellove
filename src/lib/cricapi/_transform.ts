// Shared Cricbuzz → CricAPI transformation utilities
import type { CricAPIMatch, TeamInfo, Score } from "@/types/cricapi";
import type { CricbuzzMatch, CricbuzzMatchListResponse } from "@/types/cricbuzz";

export function imgUrl(imageId: number | undefined): string {
  return imageId ? `/api/img/${imageId}` : "";
}

export function transformMatch(m: CricbuzzMatch): CricAPIMatch {
  const { matchInfo, matchScore } = m;
  const t1 = matchInfo.team1;
  const t2 = matchInfo.team2;

  const teamInfo: TeamInfo[] = [
    { name: t1.teamName, shortname: t1.teamSName, img: imgUrl(t1.imageId) },
    { name: t2.teamName, shortname: t2.teamSName, img: imgUrl(t2.imageId) },
  ];

  const scores: Score[] = [];
  const addScore = (inng: { runs: number; wickets: number; overs: number } | undefined, label: string) => {
    if (inng) scores.push({ r: inng.runs, w: inng.wickets, o: inng.overs, inning: label });
  };
  addScore(matchScore?.team1Score?.inngs1, `${t1.teamName} Inning 1`);
  addScore(matchScore?.team1Score?.inngs2, `${t1.teamName} Inning 2`);
  addScore(matchScore?.team2Score?.inngs1, `${t2.teamName} Inning 1`);
  addScore(matchScore?.team2Score?.inngs2, `${t2.teamName} Inning 2`);

  const startMs = parseInt(matchInfo.startDate, 10);
  const dateISO = isNaN(startMs) ? "" : new Date(startMs).toISOString();

  return {
    id: String(matchInfo.matchId),
    name: `${t1.teamName} vs ${t2.teamName}, ${matchInfo.matchDesc}`,
    matchType: matchInfo.matchFormat.toLowerCase(),
    status: matchInfo.status,
    venue: matchInfo.venueInfo
      ? `${matchInfo.venueInfo.ground}, ${matchInfo.venueInfo.city}`
      : "",
    date: dateISO.split("T")[0] ?? "",
    dateTimeGMT: dateISO,
    teams: [t1.teamName, t2.teamName],
    teamInfo,
    score: scores,
    series_id: String(matchInfo.seriesId),
    matchStarted: matchInfo.state !== "Upcoming",
    matchEnded: matchInfo.state === "Complete",
  };
}

export function extractMatchesFromResponse(data: CricbuzzMatchListResponse): CricAPIMatch[] {
  const out: CricAPIMatch[] = [];
  for (const typeMatch of data.typeMatches ?? []) {
    for (const sm of typeMatch.seriesMatches ?? []) {
      for (const m of sm.seriesAdWrapper?.matches ?? []) {
        out.push(transformMatch(m));
      }
    }
  }
  return out;
}
