/**
 * Diamond Provider — API Response Types
 *
 * Comprehensive TypeScript types derived from analyzing all Diamond API
 * endpoint responses. Each interface maps to a specific API endpoint.
 *
 * Sport ID Mapping:
 *   4 = Cricket
 *   1 = Football (Soccer)
 *   2 = Tennis
 */

// ─────────────────────────────────────────────────────────────────
// ── Base Response Envelope ──
// ─────────────────────────────────────────────────────────────────

export interface DiamondBaseResponse<T = unknown> {
  success: boolean;
  msg: string;
  status: number;
  data: T;
}

/** Some endpoints use a simpler envelope */
export interface DiamondSimpleResponse<T = unknown> {
  status: boolean;
  data: T;
}

// ─────────────────────────────────────────────────────────────────
// ── Sport IDs ──
// ─────────────────────────────────────────────────────────────────

/** Diamond's internal sport ID mapping */
export const DIAMOND_SPORT_ID = {
  CRICKET: 4,
  FOOTBALL: 1,
  TENNIS: 2,
} as const;

export type DiamondSportId =
  (typeof DIAMOND_SPORT_ID)[keyof typeof DIAMOND_SPORT_ID];

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/allSportid (1x startup)
// ── File: getAllSportsId1Time.json
// ─────────────────────────────────────────────────────────────────

export interface DiamondSport {
  /** Sport ID (e.g., 4 = Cricket, 1 = Football, 2 = Tennis) */
  eid: number;
  /** Sport display name */
  ename: string;
  /** Whether sport is currently active */
  active: boolean;
  /** Whether sport appears in tab navigation */
  tab: boolean;
  /** Whether this is the default sport */
  isdefault: boolean;
  /** Display ordering priority */
  oid: number;
}

export type GetAllSportsResponse = DiamondBaseResponse<DiamondSport[]>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/esid?sid={sportId} (Every 1 min)
// ── File: getAllMatchUsingSportsIdFrontData1Min.json
// ─────────────────────────────────────────────────────────────────

/** Single odds entry within a selection */
export interface DiamondOddsEntry {
  /** Selection ID */
  sid: number;
  /** Parent selection ID */
  psid: number;
  /** Decimal odds value */
  odds: number;
  /** "back" or "lay" */
  otype: string;
  /** "back1", "lay1", "back2", "lay2", "back3", "lay3" */
  oname: string;
  /** Tier number (0=best, 1=second, 2=third) */
  tno: number;
  /** Available liquidity/size */
  size: number;
}

/** A selection/runner within a market section */
export interface DiamondMatchSection {
  /** Selection ID */
  sid: number;
  /** Section ordering number */
  sno: number;
  /** "ACTIVE", "SUSPENDED", "Ball Running", "" */
  gstatus: string;
  /** Game status code (1 = active, 0 = suspended) */
  gscode: number;
  /** Selection name (team/player/runner name) */
  nat: string;
  /** Odds array */
  odds: DiamondOddsEntry[];
  // ── Extended fields (present in detailed odds response) ──
  /** Parent selection ID */
  psid?: number;
  /** Parent section row number */
  psrno?: number;
  /** Max bet */
  max?: number;
  /** Min bet */
  min?: number;
  /** Remark */
  rem?: string;
  /** Ball running flag */
  br?: boolean;
  /** IK flag */
  ik?: number;
  /** IKM flag */
  ikm?: number;
}

/** A match in the "front data" listing response */
export interface DiamondMatchListItem {
  /** Game/Match ID — the primary identifier */
  gmid: number;
  /** Match display name (e.g., "India v Netherlands") */
  ename: string;
  /** Sport ID */
  etid: number;
  /** Competition/league ID */
  cid: number;
  /** Competition/league name */
  cname: string;
  /** Is currently in-play (live) */
  iplay: boolean;
  /** Scheduled start time (M/D/YYYY H:mm:ss AM/PM format) */
  stime: string;
  /** Has TV stream available */
  tv: boolean;
  /** Has bookmaker market */
  bm: boolean;
  /** Has fancy market */
  f: boolean;
  /** Has fancy1 market */
  f1: boolean;
  /** Is custom created (0=Betfair, 1=T5/T10 XI, 2=Virtual) */
  iscc: number;
  /** Market ID */
  mid: number;
  /** Market name (e.g., "MATCH_ODDS") */
  mname: string;
  /** Market status ("OPEN", "SUSPENDED", "CLOSED") */
  status: string;
  /** Runner count */
  rc: number;
  /** Game status code */
  gscode: number;
  /** Margin */
  m: number;
  /** Display order ID */
  oid: number;
  /** Game type ("match", "match1", "fancy", "fancy1", "fancy2") */
  gtype: string;
  /** Sections (selections with odds) */
  section: DiamondMatchSection[];
}

/**
 * Match listing response — grouped by tiers
 * t1 = Main Betfair-sourced matches
 * t2 = Custom/virtual matches (T5 XI, T10 XI, etc.)
 */
export interface DiamondMatchListData {
  t1: DiamondMatchListItem[];
  t2?: DiamondMatchListItem[];
}

export type GetMatchListResponse = DiamondBaseResponse<DiamondMatchListData>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/esid/{gmid} (Every 1 sec — live odds)
// ── File: getMatchOddsFancyBm1Sec.json
// ─────────────────────────────────────────────────────────────────

/** Full market data for a match (detailed odds view) */
export interface DiamondMarketDetail {
  /** Game/Match ID */
  gmid: number;
  /** Market ID */
  mid: number;
  /** Parent market ID */
  pmid: number | null;
  /** Market name ("MATCH_ODDS", "Bookmaker", "Normal", etc.) */
  mname: string;
  /** Remark / promotional text */
  rem: string;
  /**
   * Game type:
   *   "match"  = Match Odds (Betfair exchange)
   *   "match1" = Bookmaker / custom market
   *   "fancy"  = Normal fancy (run-based with numeric result)
   *   "fancy1" = Yes/No fancy (winner-name based result)
   *   "fancy2" = Line market (over/under)
   */
  gtype: string;
  /** Market status ("OPEN", "SUSPENDED", "CLOSED") */
  status: string;
  /** Runner count */
  rc: number;
  /** Visibility flag */
  visible: boolean;
  /** Provider ID */
  pid: number;
  /** Game status code */
  gscode: number;
  /** Max bet */
  maxb: number;
  /** Section order number */
  sno: number;
  /** Display type */
  dtype: number;
  /** Odds count */
  ocnt: number;
  /** Margin */
  m: number;
  /** Market max stake */
  max: number;
  /** Market min stake */
  min: number;
  /** Bet-in-play allowed */
  biplay: boolean;
  /** User max bet override factor */
  umaxbof: number;
  /** Book-in-play allowed */
  boplay: boolean;
  /** In-play flag */
  iplay: boolean;
  /** Bet count */
  btcnt: number;
  /** Company identifier */
  company: string | null;
  /** Sections (runners/selections with full odds depth) */
  section: DiamondMatchSection[];
}

export type GetMatchOddsResponse = DiamondBaseResponse<DiamondMarketDetail[]>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/getDetailsData?sid={sportId}&gmid={gmid} (1x)
// ── File: getGtvDetails1Time.json
// ─────────────────────────────────────────────────────────────────

export interface DiamondMatchDetail {
  /** Game/Match ID */
  gmid: number;
  /** Sport ID */
  etid: number;
  /** Margin */
  m: number;
  /** GTV (game TV type, 0 = none) */
  gtv: number;
  /** Match name */
  ename: string;
  /** Competition ID */
  cid: number;
  /** Competition name */
  cname: string;
  /** In-play flag */
  iplay: boolean;
  /** Game type */
  gtype: string;
  /** Has fancy1 */
  f1: boolean;
  /** Has fancy */
  f: boolean;
  /** Has bookmaker */
  bm: boolean;
  /** Has TV */
  tv: boolean;
  /** Scorecard availability (0=none, 1=available) */
  scard: number;
  /** Is custom created */
  iscc: number;
  /** Scheduled start time */
  stime: string;
  /** Mode */
  mod: number;
  /** Market name */
  mname: string | null;
  /** Legacy/old game ID (Betfair event ID) */
  oldgmid: string;
  /** Port */
  port: number;
}

export type GetMatchDetailResponse = DiamondBaseResponse<DiamondMatchDetail[]>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/betfairscorecardandtv (User call)
// ── File: getLiveTvScoreUserCall.json
// ─────────────────────────────────────────────────────────────────

export interface DiamondScoreTvData {
  /** Score iframe/embed URL */
  diamond_score_one: string | null;
  /** Live TV stream URL */
  diamond_tv_one: string | null;
}

export type GetScoreTvResponse = DiamondSimpleResponse<DiamondScoreTvData>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/posted-market-result (Result fetching)
// ── File: GetResult.json
// ─────────────────────────────────────────────────────────────────

export interface DiamondMarketResult {
  _id: string;
  /** Market name key */
  mname: string;
  /** Game/match ID */
  gmid: number;
  /** Human-readable market name */
  marketName: string;
  /**
   * Game type (uppercase):
   *   "MATCH"  → Match Odds / Bookmaker
   *   "FANCY"  → Normal fancy
   *   "FANCY1" → Yes/No fancy
   *   "MATCH1" → Bookmaker variants
   */
  gtype: string;
  /** Sport ID */
  sportsid: number;
  /** Settlement status ("SETTLE", "PENDING", "VOID") */
  status: string;
  /** Competition name */
  cname: string;
  /** Event name */
  ename: string;
  /** Winner name (for match/yes-no markets) */
  winnerName: string | null;
  /** Winner ID (for numeric/run-based markets) */
  winnerId: number | null;
  /** Previous winner name (before rollback) */
  oldWinnerName: string | null;
  /** Previous winner ID */
  oldWinnerId: number | null;
  /** Whether result callback was sent */
  callbacksent: boolean;
  /** Whether result was rolled back */
  rollback: boolean;
  /** Number of rollbacks */
  rollbackCount: number;
  /** Is priority market */
  priority: boolean;
  /** Remark (e.g., "UPDATED BY AI (CRICBUZZ)") */
  remark: string | null;
  /** Scheduled start time */
  stime: string;
  /** Created timestamp */
  createdAt: string;
  /** Last updated timestamp */
  updatedAt: string;
  /** Created by */
  createdBy: string;
  /** Updated by */
  updatedBy: string | null;
  /** Document updated timestamp */
  docupdatedat: string;
}

export interface GetMarketResultsResponse {
  success: boolean;
  message: string;
  total: number;
  page: number;
  limit: number;
  pages: number;
  markets: DiamondMarketResult[];
}

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/tree (Every 1 day)
// ── File: getSideBarTree1Day.json
// ─────────────────────────────────────────────────────────────────

/** A match leaf node in the sidebar tree */
export interface DiamondTreeMatch {
  gmid: string;
  name: string;
  etid: number;
  iscc: number;
}

/** A competition node in the sidebar tree */
export interface DiamondTreeCompetition {
  cid: string;
  name: string;
  children: DiamondTreeMatch[];
}

/** A sport node in the sidebar tree */
export interface DiamondTreeSport {
  etid: number;
  name: string;
  oid: number;
  children: DiamondTreeCompetition[] | null;
}

export interface DiamondTreeData {
  t1: DiamondTreeSport[];
}

export type GetSidebarTreeResponse = DiamondBaseResponse<DiamondTreeData>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/topevents (Every 1 hour)
// ── File: getTopEvents1H.json
// ─────────────────────────────────────────────────────────────────

export interface DiamondTopEvent {
  name: string;
  sportId: number;
  id: string;
  /** Composite lookup ID: "{gmid}_{sportId}" */
  lid: string;
}

export type GetTopEventsResponse = DiamondBaseResponse<DiamondTopEvent[]>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/welcomebanner (Every 1 hour)
// ── File: getWelcomeBanner1H.json
// ─────────────────────────────────────────────────────────────────

export interface DiamondBannerData {
  desktopbanner: string;
  mobilebanner: string;
}

export type GetWelcomeBannerResponse =
  DiamondSimpleResponse<DiamondBannerData>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/post-market (POST)
// ── File: PriorityMarketPost.json
// ─────────────────────────────────────────────────────────────────

export interface PostMarketPayload {
  sportsid: number;
  gmid: string;
  marketName: string;
  mname: string;
  gtype: string;
}

export type PostMarketResponse = DiamondBaseResponse<DiamondTopEvent[]>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /sports/virtual/tvurl?gmid={gmid} (User call)
// ── File: virtualCricketStreamUserCall.json
// ─────────────────────────────────────────────────────────────────

export interface DiamondVirtualTvData {
  tv_url: string;
}

export type GetVirtualTvResponse = DiamondSimpleResponse<DiamondVirtualTvData>;
