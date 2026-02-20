/**
 * Diamond Provider — Response Mapper
 *
 * Maps Diamond's raw API responses to the application's canonical
 * ProviderMatchData and ProviderMarketData types.
 *
 * This is a critical boundary — all Diamond-specific field names,
 * quirks, and data formats are contained here. The rest of the
 * application never sees Diamond's raw shapes.
 */
import type { SportType } from "@shared/constants";
import type {
  ProviderMatchData,
  ProviderMarketData,
} from "@application/ports/data-provider";
import type {
  DiamondMatchListItem,
  DiamondMarketDetail,
  DiamondOddsEntry,
  DiamondMatchDetail,
} from "./types";
import { DIAMOND_SPORT_ID } from "./types";

// ─────────────────────────────────────────────────────────────────
// ── Sport ID Resolution ──
// ─────────────────────────────────────────────────────────────────

const SPORT_ID_TO_TYPE: Record<number, SportType> = {
  [DIAMOND_SPORT_ID.CRICKET]: "cricket",
  [DIAMOND_SPORT_ID.FOOTBALL]: "soccer",
  [DIAMOND_SPORT_ID.TENNIS]: "tennis",
};

const SPORT_TYPE_TO_ID: Record<string, number> = {
  cricket: DIAMOND_SPORT_ID.CRICKET,
  soccer: DIAMOND_SPORT_ID.FOOTBALL,
  tennis: DIAMOND_SPORT_ID.TENNIS,
};

export function sportIdToType(id: number): SportType | undefined {
  return SPORT_ID_TO_TYPE[id];
}

export function sportTypeToId(sport: SportType): number | undefined {
  return SPORT_TYPE_TO_ID[sport];
}

// ─────────────────────────────────────────────────────────────────
// ── Match Status Mapping ──
// ─────────────────────────────────────────────────────────────────

function resolveDiamondStatus(
  iplay: boolean,
  status: string,
): string {
  if (iplay) return "LIVE";
  const s = status.toUpperCase();
  if (s === "OPEN") return "SCHEDULED";
  if (s === "CLOSED") return "COMPLETED";
  if (s === "SUSPENDED") return "SUSPENDED";
  return s;
}

// ─────────────────────────────────────────────────────────────────
// ── Diamond Date Parsing ──
// ─────────────────────────────────────────────────────────────────

/**
 * Diamond uses "M/D/YYYY H:mm:ss AM/PM" format.
 * Convert to ISO 8601 string.
 */
function parseDiamondDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// ─────────────────────────────────────────────────────────────────
// ── Team Name Extraction ──
// ─────────────────────────────────────────────────────────────────

/**
 * Extract home/away team names from Diamond's match name.
 * Diamond uses "Team A v Team B" format.
 */
function extractTeamNames(ename: string): {
  home: string;
  away: string;
} {
  const separators = [" v ", " vs ", " VS ", " V "];
  for (const sep of separators) {
    const idx = ename.indexOf(sep);
    if (idx !== -1) {
      return {
        home: ename.substring(0, idx).trim(),
        away: ename.substring(idx + sep.length).trim(),
      };
    }
  }
  // Fallback: if no separator found
  return { home: ename.trim(), away: "Unknown" };
}

// ─────────────────────────────────────────────────────────────────
// ── Odds Extraction ──
// ─────────────────────────────────────────────────────────────────

/**
 * Extract back/lay odds from a Diamond section.
 * Picks the best back (back1) and best lay (lay1).
 */
function extractBestOdds(
  odds: DiamondOddsEntry[],
): { back: number; lay: number } {
  let back = 0;
  let lay = 0;

  for (const o of odds) {
    const name = o.oname.toLowerCase();
    if (name === "back1" && o.odds > 0) back = o.odds;
    if (name === "lay1" && o.odds > 0) lay = o.odds;
  }

  return { back, lay };
}

// ─────────────────────────────────────────────────────────────────
// ── Virtual/Custom Match Filtering ──
// ─────────────────────────────────────────────────────────────────

const VIRTUAL_PATTERN = /virtual|xi\b|t5\b|t10\b|t20\b xi/i;

function isVirtualOrCustom(item: DiamondMatchListItem): boolean {
  // iscc > 0 means custom created (T5 XI, T10 XI, Virtual Cricket)
  if (item.iscc > 0) return true;
  if (VIRTUAL_PATTERN.test(item.cname || "")) return true;
  if (item.cname === "0" || item.cname === "") return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────
// ── Match List Item → ProviderMatchData ──
// ─────────────────────────────────────────────────────────────────

export function mapMatchListItem(
  item: DiamondMatchListItem,
): ProviderMatchData | null {
  const sport = sportIdToType(item.etid);
  if (!sport) return null;

  // Filter out virtual/custom matches
  if (isVirtualOrCustom(item)) return null;

  const { home, away } = extractTeamNames(item.ename);

  // Build odds from sections
  const odds: Record<string, { back: number; lay: number }> = {};
  for (const section of item.section) {
    if (section.nat && section.odds.length > 0) {
      odds[section.nat] = extractBestOdds(section.odds);
    }
  }

  return {
    externalId: String(item.gmid),
    sport,
    competition: item.cname,
    homeTeam: home,
    awayTeam: away,
    startTime: parseDiamondDate(item.stime),
    status: resolveDiamondStatus(item.iplay, item.status),
    odds: Object.keys(odds).length > 0 ? odds : undefined,
    metadata: {
      provider: "diamond",
      diamondGmid: item.gmid,
      diamondMid: item.mid,
      competitionId: item.cid,
      hasBookmaker: item.bm,
      hasFancy: item.f,
      hasFancy1: item.f1,
      hasTv: item.tv,
      iscc: item.iscc,
      gtype: item.gtype,
      mname: item.mname,
      gscode: item.gscode,
    },
  };
}

/**
 * Map a full match listing response to ProviderMatchData[].
 * Handles both t1 (Betfair-sourced) and t2 (custom) tiers.
 * Filters out virtual/custom matches by default.
 */
export function mapMatchListResponse(
  data: { t1?: DiamondMatchListItem[]; t2?: DiamondMatchListItem[] },
  includeCustom = false,
): ProviderMatchData[] {
  const results: ProviderMatchData[] = [];

  // Process t1 (main matches)
  const t1 = Array.isArray(data.t1) ? data.t1 : [];
  for (const item of t1) {
    const mapped = mapMatchListItem(item);
    if (mapped) results.push(mapped);
  }

  // Process t2 (custom matches) only if requested
  if (includeCustom && data.t2) {
    const t2 = Array.isArray(data.t2) ? data.t2 : [];
    for (const item of t2) {
      const mapped = mapMatchListItem(item);
      if (mapped) results.push(mapped);
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────
// ── Market Detail → ProviderMarketData ──
// ─────────────────────────────────────────────────────────────────

/**
 * Map a Diamond market detail to our canonical ProviderMarketData.
 */
export function mapMarketDetail(
  market: DiamondMarketDetail,
): ProviderMarketData {
  const selections = market.section.map((section) => {
    const { back, lay } = extractBestOdds(section.odds);
    return {
      id: String(section.sid),
      name: section.nat.replace(/\.$/, "").trim(), // Remove trailing dots
      back,
      lay,
      isActive:
        section.gstatus === "ACTIVE" || section.gstatus === "",
    };
  });

  const isActive =
    market.status === "OPEN" ||
    (market.status === "SUSPENDED" && market.iplay);

  return {
    externalId: String(market.mid),
    name: market.mname,
    type: normalizeMarketType(market.gtype),
    selections,
    isActive,
    metadata: {
      provider: "diamond",
      diamondGmid: market.gmid,
      diamondMid: market.mid,
      gtype: market.gtype,
      sno: market.sno,
      dtype: market.dtype,
      maxBet: market.max,
      minBet: market.min,
      remark: market.rem || undefined,
      betInPlay: market.biplay,
    },
  };
}

/**
 * Normalize Diamond's gtype to a clean market type string.
 */
function normalizeMarketType(gtype: string): string {
  const map: Record<string, string> = {
    match: "MATCH_ODDS",
    match1: "BOOKMAKER",
    fancy: "FANCY",
    fancy1: "FANCY_YES_NO",
    fancy2: "LINE_MARKET",
  };
  return map[gtype.toLowerCase()] ?? gtype.toUpperCase();
}

// ─────────────────────────────────────────────────────────────────
// ── Match Detail → ProviderMatchData ──
// ─────────────────────────────────────────────────────────────────

/**
 * Map Diamond match detail (from getDetailsData) to ProviderMatchData.
 */
export function mapMatchDetail(
  detail: DiamondMatchDetail,
): ProviderMatchData | null {
  const sport = sportIdToType(detail.etid);
  if (!sport) return null;

  const { home, away } = extractTeamNames(detail.ename);

  return {
    externalId: String(detail.gmid),
    sport,
    competition: detail.cname,
    homeTeam: home,
    awayTeam: away,
    startTime: parseDiamondDate(detail.stime),
    status: resolveDiamondStatus(detail.iplay, "OPEN"),
    metadata: {
      provider: "diamond",
      diamondGmid: detail.gmid,
      competitionId: detail.cid,
      hasBookmaker: detail.bm,
      hasFancy: detail.f,
      hasFancy1: detail.f1,
      hasTv: detail.tv,
      hasScorecard: detail.scard === 1,
      iscc: detail.iscc,
      oldgmid: detail.oldgmid,
    },
  };
}
