/**
 * Exchange Provider — API Response Types
 *
 * Comprehensive TypeScript types derived from analyzing all Exchange API
 * endpoint responses (diamond-proxy layer). Each interface maps to a
 * specific API endpoint.
 *
 * Sport ID Mapping:
 *   4 = Cricket
 *   1 = Football (Soccer)
 *   2 = Tennis
 */

// ─────────────────────────────────────────────────────────────────
// ── Base Response Envelopes ──
// ─────────────────────────────────────────────────────────────────

export interface ExchangeBaseResponse<T = unknown> {
  success: boolean;
  msg: string;
  status: number;
  data: T;
}

export interface ExchangeSimpleResponse<T = unknown> {
  status: boolean;
  data: T;
}

export interface ExchangePaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  total: number;
  page: number;
  limit: number;
  pages: number;
  markets: T;
}

// ─────────────────────────────────────────────────────────────────
// ── Sport IDs ──
// ─────────────────────────────────────────────────────────────────

export const EXCHANGE_SPORT_ID = {
  CRICKET: 4,
  FOOTBALL: 1,
  TENNIS: 2,
} as const;

export type ExchangeSportId =
  (typeof EXCHANGE_SPORT_ID)[keyof typeof EXCHANGE_SPORT_ID];

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/sports (1× startup)
// ── File: getAllSportsId1Time.json
// ─────────────────────────────────────────────────────────────────

export interface ExchangeSport {
  /** Sport ID (e.g., 4 = Cricket, 1 = Football) */
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

export type GetAllSportsResponse = ExchangeBaseResponse<ExchangeSport[]>;

// ─────────────────────────────────────────────────────────────────
// ── Shared: Odds & Section Types ──
// ─────────────────────────────────────────────────────────────────

/** Single odds entry within a selection */
export interface ExchangeOddsEntry {
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
export interface ExchangeMatchSection {
  /** Selection ID */
  sid: number;
  /** Section ordering number */
  sno: number;
  /** "ACTIVE", "SUSPENDED", "Ball Running", "" */
  gstatus: string;
  /** Game status code (1 = active, 0 = suspended) */
  gscode: number;
  /** Selection name (team/player/runner) */
  nat: string;
  /** Odds array */
  odds: ExchangeOddsEntry[];
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

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/matches?sid={id} (Every 1 min)
// ── File: getAllMatchUsingSportsIdFrontData1Min.json
// ─────────────────────────────────────────────────────────────────

/** A match in the front data listing response */
export interface ExchangeMatchListItem {
  /** Game/Match ID — the primary identifier */
  gmid: number;
  /** Match display name */
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
  /** Game type ("match", "match1", "fancy", etc.) */
  gtype: string;
  /** Sections (selections with odds) */
  section: ExchangeMatchSection[];
}

/** Match listing grouped by tiers */
export interface ExchangeMatchListData {
  t1: ExchangeMatchListItem[];
  t2?: ExchangeMatchListItem[];
}

export type GetMatchListResponse = ExchangeBaseResponse<ExchangeMatchListData>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/match/odds/:gmid (Every 1 sec demand)
// ── File: getMatchOddsFancyBm1Sec.json
// ─────────────────────────────────────────────────────────────────

/** Full market data for a match (detailed odds view) */
export interface ExchangeMarketDetail {
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
  /** Game type ("match", "match1", "fancy", "fancy1", "fancy2") */
  gtype: string;
  /** Market status */
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
  section: ExchangeMatchSection[];
}

export type GetMatchOddsResponse = ExchangeBaseResponse<ExchangeMarketDetail[]>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/match/details (1×)
// ── File: getGtvDetails1Time.json
// ─────────────────────────────────────────────────────────────────

export interface ExchangeMatchDetail {
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

export type GetMatchDetailResponse = ExchangeBaseResponse<ExchangeMatchDetail[]>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/match/tv (User call → cached 1×)
// ── File: getLiveTvScoreUserCall.json
// ─────────────────────────────────────────────────────────────────

export interface ExchangeScoreTvData {
  /** Score iframe/embed URL */
  diamond_score_one: string | null;
  /** Live TV stream URL */
  diamond_tv_one: string | null;
}

export type GetScoreTvResponse = ExchangeSimpleResponse<ExchangeScoreTvData>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/results (cached 1H)
// ── File: GetResult.json
// ─────────────────────────────────────────────────────────────────

export interface ExchangeMarketResult {
  _id: string;
  /** Market name key */
  mname: string;
  /** Game/match ID */
  gmid: number;
  /** Human-readable market name */
  marketName: string;
  /** Game type (uppercase: "MATCH", "FANCY", "FANCY1", "MATCH1") */
  gtype: string;
  /** Sport ID */
  sportsid: number;
  /** Settlement status ("SETTLE", "PENDING", "VOID") */
  status: string;
  /** Competition name */
  cname: string;
  /** Event name */
  ename: string;
  /** Winner name */
  winnerName: string | null;
  /** Winner ID (for numeric/run-based markets) */
  winnerId: number | null;
  /** Previous winner name */
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
  /** Remark */
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

export type GetMarketResultsResponse = ExchangePaginatedResponse<ExchangeMarketResult[]>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/sidebar (Every 1 day)
// ── File: getSideBarTree1Day.json
// ─────────────────────────────────────────────────────────────────

/** A match leaf node in the sidebar tree */
export interface ExchangeTreeMatch {
  gmid: string;
  name: string;
  etid: number;
  iscc: number;
}

/** A competition node in the sidebar tree */
export interface ExchangeTreeCompetition {
  cid: string;
  name: string;
  children: ExchangeTreeMatch[];
}

/** A sport node in the sidebar tree */
export interface ExchangeTreeSport {
  etid: number;
  name: string;
  oid: number;
  children: ExchangeTreeCompetition[] | null;
}

export interface ExchangeTreeData {
  t1: ExchangeTreeSport[];
}

export type GetSidebarTreeResponse = ExchangeBaseResponse<ExchangeTreeData>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/top-events (Every 1 hour)
// ── File: getTopEvents1H.json
// ─────────────────────────────────────────────────────────────────

export interface ExchangeTopEvent {
  name: string;
  sportId: number;
  id: string;
  /** Composite lookup ID: "{gmid}_{sportId}" */
  lid: string;
}

export type GetTopEventsResponse = ExchangeBaseResponse<ExchangeTopEvent[]>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/banner (Every 1 hour)
// ── File: getWelcomeBanner1H.json
// ─────────────────────────────────────────────────────────────────

export interface ExchangeBannerData {
  desktopbanner: string;
  mobilebanner: string;
}

export type GetWelcomeBannerResponse = ExchangeSimpleResponse<ExchangeBannerData>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/market (POST)
// ── File: PriorityMarketPost.json
// ─────────────────────────────────────────────────────────────────

export interface ExchangePostMarketPayload {
  sportsid: number;
  gmid: string;
  marketName: string;
  mname: string;
  gtype: string;
}

export type PostMarketResponse = ExchangeBaseResponse<ExchangeTopEvent[]>;

// ─────────────────────────────────────────────────────────────────
// ── Endpoint: /diamond-proxy/virtual/tv (User call → cached 1×)
// ── File: virtualCricketStreamUserCall.json
// ─────────────────────────────────────────────────────────────────

export interface ExchangeVirtualTvData {
  tv_url: string;
}

export type GetVirtualTvResponse = ExchangeSimpleResponse<ExchangeVirtualTvData>;
