import { cricbuzzGet } from "./client";
import { cachedFetch } from "../cache";
import type { CricAPIPlayer, CricAPIPlayerInfo, CareerStat, BowlCareerStat } from "@/types/cricapi";
import type {
  CricbuzzPlayerSearchResponse,
  CricbuzzPlayerInfo,
  CricbuzzPlayerCareerResponse,
  CricbuzzCareerStat,
} from "@/types/cricbuzz";

const TTL = 600_000; // 10 min

// ---------------------------------------------------------------------------
// Transformers
// ---------------------------------------------------------------------------

function transformCareerBatRow(row: CricbuzzCareerStat): CareerStat {
  // Cricbuzz career row: values array maps to [mat, inns, no, runs, hs, avg, bf, sr, 100, 50, 4s, 6s]
  const v = row.values?.map((x) => x.value) ?? [];
  return {
    type: row.appIndex?.sectionValue ?? "",
    mat: v[0] ?? "-",
    inns: v[1] ?? "-",
    no: v[2] ?? "-",
    runs: v[3] ?? "-",
    hs: v[4] ?? "-",
    avg: v[5] ?? "-",
    bf: v[6] ?? "-",
    sr: v[7] ?? "-",
    "100": v[8] ?? "-",
    "50": v[9] ?? "-",
    "4s": v[10] ?? "-",
    "6s": v[11] ?? "-",
  };
}

function transformCareerBowlRow(row: CricbuzzCareerStat): BowlCareerStat {
  // values: [mat, inns, ov, runs, wkts, bbi, bbm, avg, econ, sr, 4w, 5w]
  const v = row.values?.map((x) => x.value) ?? [];
  return {
    type: row.appIndex?.sectionValue ?? "",
    mat: v[0] ?? "-",
    inns: v[1] ?? "-",
    ov: v[2] ?? "-",
    runs: v[3] ?? "-",
    wkts: v[4] ?? "-",
    bbi: v[5] ?? "-",
    bbm: v[6] ?? "-",
    avg: v[7] ?? "-",
    econ: v[8] ?? "-",
    sr: v[9] ?? "-",
    "4w": v[10] ?? "-",
    "5w": v[11] ?? "-",
  };
}

// ---------------------------------------------------------------------------
// Public fetch functions (same signatures as before)
// ---------------------------------------------------------------------------

export async function fetchPlayers(search: string): Promise<CricAPIPlayer[]> {
  return cachedFetch(
    `players:${search}`,
    async () => {
      const data = await cricbuzzGet<CricbuzzPlayerSearchResponse>(
        `/players/v1/search?plrN=${encodeURIComponent(search)}`,
      );
      return (data.player ?? []).map((p) => ({
        id: String(p.id),
        name: p.name,
        country: p.intlTeam ?? p.teamName ?? "",
      }));
    },
    TTL,
  );
}

export async function fetchPlayerInfo(id: string): Promise<CricAPIPlayerInfo> {
  return cachedFetch(
    `playerInfo:${id}`,
    async () => {
      const [info, career] = await Promise.allSettled([
        cricbuzzGet<CricbuzzPlayerInfo>(`/players/v1/${id}`),
        cricbuzzGet<CricbuzzPlayerCareerResponse>(`/players/v1/${id}/career`),
      ]);

      const p = info.status === "fulfilled" ? info.value : ({} as CricbuzzPlayerInfo);
      const c = career.status === "fulfilled" ? career.value : null;

      return {
        id: String(p.id ?? id),
        name: p.name ?? "",
        dateOfBirth: p.dob ?? "",
        role: p.role ?? "",
        battingStyle: p.bat ?? "",
        bowlingStyle: p.bowl ?? "",
        country: p.intlTeam ?? p.birthCountry ?? "",
        playerImg: p.faceImageId ? `/api/img/${p.faceImageId}` : "",
        bat: {
          career: c?.batting?.career?.map(transformCareerBatRow) ?? [],
        },
        bowl: {
          career: c?.bowling?.career?.map(transformCareerBowlRow) ?? [],
        },
      } satisfies CricAPIPlayerInfo;
    },
    TTL,
  );
}
