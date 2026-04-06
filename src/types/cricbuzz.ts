// Raw response types from Cricbuzz Cricket API (RapidAPI)
// Host: cricbuzz-cricket.p.rapidapi.com

export interface CricbuzzTeam {
  teamId: number;
  teamName: string;
  teamSName: string;
  imageId: number;
}

export interface CricbuzzInningsScore {
  inningsId: number;
  runs: number;
  wickets: number;
  overs: number;
  isDeclared?: boolean;
  isFollowOn?: boolean;
}

export interface CricbuzzMatchScore {
  team1Score?: {
    inngs1?: CricbuzzInningsScore;
    inngs2?: CricbuzzInningsScore;
  };
  team2Score?: {
    inngs1?: CricbuzzInningsScore;
    inngs2?: CricbuzzInningsScore;
  };
}

export interface CricbuzzMatchInfo {
  matchId: number;
  seriesId: number;
  seriesName: string;
  matchDesc: string;
  matchFormat: string; // "T20", "ODI", "TEST", "T20I"
  startDate: string;   // unix ms string
  endDate: string;
  state: string;       // "In Progress" | "Complete" | "Upcoming" | "Toss"
  status: string;
  team1: CricbuzzTeam;
  team2: CricbuzzTeam;
  venueInfo?: { id: number; ground: string; city: string; timezone?: string };
  currBatTeamId?: number;
}

export interface CricbuzzMatch {
  matchInfo: CricbuzzMatchInfo;
  matchScore?: CricbuzzMatchScore;
}

export interface CricbuzzMatchListResponse {
  typeMatches: Array<{
    matchType: string;
    seriesMatches: Array<{
      seriesAdWrapper?: {
        seriesId: number;
        seriesName: string;
        matches: CricbuzzMatch[];
      };
    }>;
  }>;
  filters?: unknown;
}

// /mcenter/v1/{matchId}
export interface CricbuzzBatsman {
  batId: number;
  batName: string;
  batShortName: string;
  isCaptain: boolean;
  isKeeper: boolean;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  outDesc: string;
  bowlerId?: number;
  wicketCode?: string;
  isOverseas?: boolean;
  inMatchChange?: string;
}

export interface CricbuzzBowler {
  bowlId: number;
  bowlName: string;
  bowlShortName?: string;
  overs: string;
  maidens: string;
  runs: number;
  wickets: number;
  economy: number;
  no_balls: string;
  wides: string;
  dots?: number;
  isCaptain?: boolean;
  isKeeper?: boolean;
}

export interface CricbuzzInningsDetail {
  inningsId: number;
  batTeamDetails: {
    batTeamId: number;
    batTeamName: string;
    batTeamShortName?: string;
    batsmenData: Record<string, CricbuzzBatsman>;
    extras?: string;
    total?: string;
  };
  bowlTeamDetails: {
    bowlTeamId: number;
    bowlTeamName: string;
    bowlersData: Record<string, CricbuzzBowler>;
  };
  scoreDetails?: {
    runs: number;
    wickets: number;
    overs: number;
    target?: number;
    isDeclared?: boolean;
    isFollowOn?: boolean;
  };
  extrasData?: {
    extras: number;
    byes?: number;
    legByes?: number;
    wides?: number;
    noBalls?: number;
    penalty?: number;
  };
}

export interface CricbuzzMatchCenterTeam {
  id: number;
  name: string;
  shortName: string;
  imageId?: number;
  playerDetails?: unknown[];
}

export interface CricbuzzMatchCenter {
  matchHeader: {
    matchId: number;
    matchDesc: string;
    matchFormat: string;
    status: string;
    state: string;
    tossResults?: {
      tossWinnerId: number;
      tossWinnerName: string;
      decision: string;
    };
    result?: {
      winningTeam: string;
      winByRuns?: number;
      winByWickets?: number;
    };
    team1: CricbuzzMatchCenterTeam;
    team2: CricbuzzMatchCenterTeam;
    seriesId: number;
    seriesDesc?: string;
    matchStarted: boolean;
    matchEnded: boolean;
    venue?: { id: number; name: string; city: string };
    playersOfTheMatch?: unknown[];
    playersOfTheSeries?: unknown[];
  };
  scorecard?: CricbuzzInningsDetail[];
  miniscore?: unknown;
}

// /series/v1/international|domestic|league
export interface CricbuzzSeriesItem {
  id: number;
  name: string;
  startDt: string; // unix ms string
  endDt: string;
}

export interface CricbuzzSeriesListResponse {
  seriesMapProto: Array<{
    date: string;
    series: CricbuzzSeriesItem[];
  }>;
}

// /series/v1/{seriesId}
export interface CricbuzzSeriesDetailResponse {
  matchDetails?: Array<{
    matchDetailsMap?: {
      key: string;
      match?: CricbuzzMatch[];
    };
  }>;
  seriesMatches?: CricbuzzMatch[];
}

// /players/v1/search
export interface CricbuzzPlayerSearchItem {
  id: number;
  name: string;
  fullName?: string;
  nickName?: string;
  teamName?: string;
  teamSName?: string;
  bat?: string;
  bowl?: string;
  role?: string;
  birthPlace?: string;
  intlTeam?: string;
  plrFmtKey?: string;
  faceImageId?: number;
}

export interface CricbuzzPlayerSearchResponse {
  player: CricbuzzPlayerSearchItem[];
}

// /players/v1/{playerId}
export interface CricbuzzPlayerInfo {
  id: number;
  name: string;
  fullName?: string;
  nickName?: string;
  dob?: string;
  birthCity?: string;
  birthCountry?: string;
  role?: string;
  bat?: string;
  bowl?: string;
  intlTeam?: string;
  teams?: string;
  faceImageId?: number;
}

// /players/v1/{playerId}/career
export interface CricbuzzCareerStat {
  appIndex?: { sectionValue: string };
  values?: Array<{ value: string }>;
  headers?: string[];
}

export interface CricbuzzPlayerCareerResponse {
  batting?: { career?: CricbuzzCareerStat[] };
  bowling?: { career?: CricbuzzCareerStat[] };
}
