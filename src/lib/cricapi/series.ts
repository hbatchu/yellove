import { cricbuzzGet } from "./client";
import { cachedFetch } from "../cache";
import { extractMatchesFromResponse } from "./_transform";
import type { CricAPISeries, CricAPISeriesInfo } from "@/types/cricapi";
import type {
  CricbuzzSeriesListResponse,
  CricbuzzSeriesItem,
  CricbuzzMatchListResponse,
} from "@/types/cricbuzz";

const TTL = 300_000; // 5 min

// ---------------------------------------------------------------------------
// Transformers
// ---------------------------------------------------------------------------

function transformSeriesItem(s: CricbuzzSeriesItem): CricAPISeries {
  const toDate = (ms: string) => {
    const n = parseInt(ms, 10);
    return isNaN(n) ? "" : new Date(n).toISOString().split("T")[0];
  };
  return {
    id: String(s.id),
    name: s.name,
    startDate: toDate(s.startDt),
    endDate: toDate(s.endDt),
    odi: 0,
    t20: 0,
    test: 0,
    squads: 0,
    matches: 0,
  };
}

function extractAllSeries(data: CricbuzzSeriesListResponse): CricAPISeries[] {
  const out: CricAPISeries[] = [];
  for (const group of data.seriesMapProto ?? []) {
    for (const s of group.series ?? []) {
      out.push(transformSeriesItem(s));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Public fetch functions (same signatures as before)
// ---------------------------------------------------------------------------

export async function fetchSeriesList(_offset = 0): Promise<CricAPISeries[]> {
  return cachedFetch(
    "seriesList",
    async () => {
      const [intl, domestic, league] = await Promise.allSettled([
        cricbuzzGet<CricbuzzSeriesListResponse>("/series/v1/international"),
        cricbuzzGet<CricbuzzSeriesListResponse>("/series/v1/domestic"),
        cricbuzzGet<CricbuzzSeriesListResponse>("/series/v1/league"),
      ]);
      return [
        ...(intl.status === "fulfilled" ? extractAllSeries(intl.value) : []),
        ...(domestic.status === "fulfilled" ? extractAllSeries(domestic.value) : []),
        ...(league.status === "fulfilled" ? extractAllSeries(league.value) : []),
      ];
    },
    TTL,
  );
}

export async function fetchSeriesInfo(id: string): Promise<CricAPISeriesInfo> {
  return cachedFetch(
    `seriesInfo:${id}`,
    async () => {
      // Cricbuzz series detail returns same match-list shape as /matches/v1/*
      const data = await cricbuzzGet<CricbuzzMatchListResponse>(`/series/v1/${id}`);
      const matchList = extractMatchesFromResponse(data);

      // Look up series metadata from the cached list (best effort)
      const seriesList = await fetchSeriesList().catch(() => []);
      const info = seriesList.find((s) => s.id === id);

      return {
        info: info ?? {
          id,
          name: "",
          startDate: "",
          endDate: "",
          odi: 0,
          t20: 0,
          test: 0,
          squads: 0,
          matches: matchList.length,
        },
        matchList,
      };
    },
    TTL,
  );
}
