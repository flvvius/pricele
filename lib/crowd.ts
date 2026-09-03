// The client half of the crowd stats: what the browser sends, and the sentences
// it turns the numbers back into.
//
// The sentences are the point. "first_log_sum / plays = 0.31" is not a stat
// anyone reads; "players overestimate a cappuccino in Japan by 36%" is a
// headline that writes itself every day and costs nothing to produce.
// Everything below the fetch helpers is pure, so those sentences are unit tested
// and the wording cannot drift from the arithmetic.
//
// Every one of them returns null rather than a hedge when there is not enough
// data. A percentage computed from four players is worse than no percentage, and
// on a site whose whole argument is that its numbers are traceable, printing a
// shaky one to fill the space is the exact failure to avoid.

import type { CrowdRow, CrowdStats } from "./db";

/** Below this many players, no percentage or average is published. */
export const MIN_CROWD = 25;

/** The bar for a country-specific line, which naturally draws a smaller pool. */
export const MIN_LOCALS = 10;

const PLAYER_ID_KEY = "pricele:pid";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/**
 * A random id for this browser, minted on first use.
 *
 * It identifies a browser to the deduplication table and to its own room entry,
 * and nothing else. It is not derived from anything about the device, it is
 * never joined to a bid in the aggregate tables, and clearing site data gets a
 * new one, which costs the player nothing beyond the ability to double-count
 * themselves for one day.
 */
export function playerId(): string {
  if (!hasStorage()) return "";
  try {
    const existing = window.localStorage.getItem(PLAYER_ID_KEY);
    if (existing && /^[a-z0-9]{8,64}$/.test(existing)) return existing;
    const minted =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : Math.random().toString(36).slice(2).padEnd(16, "0").slice(0, 16);
    window.localStorage.setItem(PLAYER_ID_KEY, minted);
    return minted;
  } catch {
    return "";
  }
}

export interface CrowdResponse {
  enabled: boolean;
  counted?: boolean;
  stats?: CrowdStats | null;
}

export interface SubmitInput {
  date: string;
  itemId: string;
  country: string;
  playerCountry: string;
  won: boolean;
  firstGuessUSD: number;
  bestPctOff: number;
  /** Room details, when the player is in a classroom. */
  roomCode?: string;
  roomName?: string;
  numGuesses?: number;
  score?: number;
}

/**
 * Send a finished round and get the day's aggregates back.
 *
 * Never throws and never rejects. The caller renders whatever comes back and
 * shows nothing at all when that is null, which is what happens on a preview
 * deployment with no database, on a flaky connection, and in a browser that
 * blocked the request.
 */
export async function submitRound(
  input: SubmitInput
): Promise<CrowdStats | null> {
  const pid = playerId();
  if (!pid) return null;
  try {
    const res = await fetch("/api/crowd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, playerId: pid }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as CrowdResponse;
    return data.stats ?? null;
  } catch {
    return null;
  }
}

/** Read the aggregates without contributing, for a round already submitted. */
export async function fetchCrowd(
  date: string,
  itemId: string,
  country: string,
  bestPctOff: number
): Promise<CrowdStats | null> {
  try {
    const url = `/api/crowd?date=${date}&item=${itemId}&country=${country}&bestOff=${bestPctOff}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as CrowdResponse;
    return data.stats ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// The sentences.
// ---------------------------------------------------------------------------

/**
 * The geometric mean of the crowd's opening bids, as a ratio to the real price.
 *
 * Geometric because the sums are kept in log space, and log space because prices
 * here span four orders of magnitude. An arithmetic mean of dollar guesses on a
 * $0.30 item is decided entirely by whoever typed 500.
 */
function meanRatio(row: CrowdRow): number {
  return Math.exp(row.first_log_sum / row.plays);
}

/**
 * The Ego Gap: how far the average opening bid sits from the real price.
 *
 * Bid one is made knowing only the item and the country, so the average of a few
 * thousand of them is a clean measurement of what people assume a place costs
 * before checking. That is a genuinely publishable number and it accumulates
 * whether or not anyone ever looks at it.
 */
export function egoGapLine(
  all: CrowdRow | null,
  itemName: string,
  countryName: string
): string | null {
  if (!all || all.plays < MIN_CROWD) return null;
  const ratio = meanRatio(all);
  const pct = Math.round(Math.abs(ratio - 1) * 100);
  const noun = itemName.toLowerCase();
  if (pct < 5) {
    return `Opening bids today average almost exactly the real price of a ${noun} in ${countryName}.`;
  }
  return ratio > 1
    ? `Players overestimate a ${noun} in ${countryName} by ${pct}% on their opening bid.`
    : `Players underestimate a ${noun} in ${countryName} by ${pct}% on their opening bid.`;
}

/**
 * What share of players opened above the real price.
 *
 * Turns a solo result into a side to be on. Being in the 27% who lowballed Japan
 * is a thing to say about yourself; being 36% off is not.
 */
export function overshootLine(
  all: CrowdRow | null,
  countryName: string
): string | null {
  if (!all || all.plays < MIN_CROWD) return null;
  const pct = Math.round((all.first_over / all.plays) * 100);
  if (pct >= 50) {
    return `${pct}% of players opened above the real price in ${countryName}.`;
  }
  return `${100 - pct}% of players opened below the real price in ${countryName}.`;
}

/**
 * Home-country bias, shown only to a player whose declared country is the one on
 * the board.
 *
 * This is the line that gets screenshotted into a national subreddit, which is
 * why it is the one that most needs a real sample behind it and the server-side
 * answer check behind that.
 */
export function homeBiasLine(
  locals: CrowdRow | null,
  itemName: string,
  countryName: string
): string | null {
  if (!locals || locals.plays < MIN_LOCALS) return null;
  const ratio = meanRatio(locals);
  const pct = Math.round(Math.abs(ratio - 1) * 100);
  const noun = itemName.toLowerCase();
  if (pct < 5) {
    return `Players in ${countryName} call their own ${noun} almost exactly right.`;
  }
  return ratio > 1
    ? `Players in ${countryName} overestimate their own ${noun} by ${pct}%.`
    : `Players in ${countryName} underestimate their own ${noun} by ${pct}%.`;
}

/**
 * Where the reader's closest bid sits against everyone else's.
 *
 * Deliberately phrased as an achievement even on a loss. A player who missed the
 * 5% band by a hair still beat most of the field, and telling them so is the
 * difference between a loss that ends the session and a loss they come back from.
 */
export function percentileLine(stats: CrowdStats | null): string | null {
  if (!stats?.all || stats.worseThanReader === null) return null;
  if (stats.all.plays < MIN_CROWD) return null;
  const pct = Math.round((stats.worseThanReader / stats.all.plays) * 100);
  if (pct < 10) return null;
  return `Closer than ${pct}% of everyone who has played today.`;
}

/** "1,204 played today · 63% solved it", the plain scoreboard under the rest. */
export function turnoutLine(all: CrowdRow | null): string | null {
  if (!all || all.plays < MIN_CROWD) return null;
  const pct = Math.round((all.wins / all.plays) * 100);
  return `${all.plays.toLocaleString("en-US")} played today · ${pct}% solved it`;
}
