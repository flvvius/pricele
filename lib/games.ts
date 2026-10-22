// The daily-game registry. Every daily game is one entry in GAMES, and the
// /today hub, the nav link, the "next game" links and the combined share line
// all read from this list, so a new game plugs in here once.
//
// Each entry reads the game's OWN existing localStorage key(s) and never writes
// them. The only key this file writes is HUB_KEY, a separate log of dates on
// which at least one game was finished, so the hub streak survives the
// single-day keys of the newer games being overwritten tomorrow. Losing the hub
// log can never touch a game's own stats or streak.

import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import { isoDate, dateFromISO, puzzleNumber } from "./puzzle";
import { MAX_GUESSES } from "./share";
import { judge, puzzleFor as thenNowPuzzle, MAX_GUESSES as TN_MAX } from "./thenandnow";
import { ROUNDS as RR_ROUNDS, score as rrScore, puzzleFor as rentPuzzle } from "./rentratio";
import { RENT_AREAS } from "@/data/rent-ratio";
import {
  KEY as LADDER_KEY,
  isOver as ladderOver,
  puzzleFor as ladderPuzzle,
  result as ladderResult,
} from "./inflationladder";
import {
  KEY as ATLAS_KEY,
  isOver as atlasOver,
  puzzleFor as atlasPuzzle,
  result as atlasResult,
} from "./priceatlas";
import {
  KEY as CHAIN_KEY,
  isOver as chainOver,
  puzzleFor as chainPuzzle,
  result as chainResult,
} from "./pricechain";

export type Phase = "not_started" | "in_progress" | "done";

export interface GameStatus {
  phase: Phase;
  /** Short spoiler-free result once done, e.g. "3/6" or "4/5". */
  result?: string;
}

/** Minimal storage surface, so status readers are testable without a browser. */
export interface KV {
  getItem(key: string): string | null;
}

export interface DailyGame {
  slug: string;
  name: string;
  href: string;
  blurb: string;
  source: string;
  minutes: number;
  status(date: string, kv: KV): GameStatus;
  /** Dates (other than today) this game's storage proves were finished. */
  pastDoneDates?(kv: KV): string[];
}

const NOT_STARTED: GameStatus = { phase: "not_started" };

function json<T>(kv: KV, key: string): T | null {
  try {
    const raw = kv.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const GAMES: DailyGame[] = [
  {
    slug: "pricele",
    name: "Pricele",
    href: "/",
    blurb: "Guess the price of one item in one country.",
    source: "Sourced prices, 49 countries",
    minutes: 2,
    status(date, kv) {
      const s = json<{ date: string; guesses: unknown[]; done: boolean; won: boolean }>(
        kv,
        `pricele:day:${date}`
      );
      if (!s || s.date !== date || !Array.isArray(s.guesses)) return NOT_STARTED;
      if (s.done) {
        return { phase: "done", result: `${s.won ? s.guesses.length : "X"}/${MAX_GUESSES}` };
      }
      return s.guesses.length > 0 ? { phase: "in_progress" } : NOT_STARTED;
    },
    pastDoneDates(kv) {
      const h = json<{ date: string }[]>(kv, "pricele:history");
      return Array.isArray(h) ? h.map((r) => r.date).filter((d) => typeof d === "string") : [];
    },
  },
  {
    slug: "price-atlas",
    name: "Price Atlas",
    href: "/games/price-atlas",
    blurb: "Name the country from a basket of its prices.",
    source: "Sourced prices, 49 countries",
    minutes: 2,
    status(date, kv) {
      const s = json<{ date: string; guesses: string[] }>(kv, ATLAS_KEY);
      if (!s || s.date !== date || !Array.isArray(s.guesses) || s.guesses.length === 0) {
        return NOT_STARTED;
      }
      const p = atlasPuzzle(date);
      if (atlasOver(p, s)) return { phase: "done", result: atlasResult(p, s) };
      return { phase: "in_progress" };
    },
  },
  {
    slug: "higher-or-lower",
    name: "Higher or Lower Daily",
    href: "/games/higher-or-lower",
    blurb: "Ten prices in a chain. Call each one higher or lower.",
    source: "Sourced prices, 49 countries",
    minutes: 1,
    status(date, kv) {
      const s = json<{ date: string; calls: ("higher" | "lower")[] }>(kv, CHAIN_KEY);
      if (!s || s.date !== date || !Array.isArray(s.calls) || s.calls.length === 0) {
        return NOT_STARTED;
      }
      if (chainOver(s)) return { phase: "done", result: chainResult(chainPuzzle(date), s) };
      return { phase: "in_progress" };
    },
  },
  {
    slug: "then-and-now",
    name: "Then & Now",
    href: "/games/then-and-now",
    blurb: "Guess what an everyday item cost decades ago.",
    source: "BLS average prices",
    minutes: 1,
    status(date, kv) {
      const s = json<{ date: string; guesses: number[] }>(kv, "pricele:then-and-now");
      if (!s || s.date !== date || !Array.isArray(s.guesses) || s.guesses.length === 0) {
        return NOT_STARTED;
      }
      const { answer } = thenNowPuzzle(date, THEN_NOW_ITEMS);
      const won = s.guesses.some((g) => judge(g, answer) === "win");
      if (won || s.guesses.length >= TN_MAX) {
        return { phase: "done", result: `${won ? s.guesses.length : "X"}/${TN_MAX}` };
      }
      return { phase: "in_progress" };
    },
  },
  {
    slug: "rent-ratio",
    name: "Rent Ratio",
    href: "/games/rent-ratio",
    blurb: "Pick the U.S. metro with the higher rent, five times.",
    source: "HUD fair market rents",
    minutes: 1,
    status(date, kv) {
      const s = json<{ date: string; picks: ("a" | "b")[] }>(kv, "pricele:rent-ratio");
      if (!s || s.date !== date || !Array.isArray(s.picks) || s.picks.length === 0) {
        return NOT_STARTED;
      }
      if (s.picks.length >= RR_ROUNDS) {
        const n = rrScore(rentPuzzle(date, RENT_AREAS), s.picks);
        return { phase: "done", result: `${n}/${RR_ROUNDS}` };
      }
      return { phase: "in_progress" };
    },
  },
  {
    slug: "inflation-ladder",
    name: "Inflation Ladder",
    href: "/games/inflation-ladder",
    blurb: "Rank four groceries by how much their price rose.",
    source: "BLS average prices",
    minutes: 1,
    status(date, kv) {
      const s = json<{ date: string; tries: string[][] }>(kv, LADDER_KEY);
      if (!s || s.date !== date || !Array.isArray(s.tries) || s.tries.length === 0) {
        return NOT_STARTED;
      }
      const { answer } = ladderPuzzle(date, THEN_NOW_ITEMS);
      if (ladderOver(s, answer)) return { phase: "done", result: ladderResult(s, answer) };
      return { phase: "in_progress" };
    },
  },
];

export const HUB_KEY = "pricele:hub:days";
export const RESULTS_KEY = "pricele:hub:results";
const RESULTS_DAYS = 60;

export type ResultLog = Record<string, Record<string, string>>;

export function mergeResults(
  log: ResultLog | null,
  today: string,
  st: Record<string, GameStatus>
): ResultLog {
  const base: ResultLog = log && typeof log === "object" ? { ...log } : {};
  const done = Object.fromEntries(
    Object.entries(st)
      .filter(([, v]) => v.phase === "done")
      .map(([k, v]) => [k, v.result ?? "✓"])
  );
  if (Object.keys(done).length > 0) base[today] = { ...(base[today] ?? {}), ...done };
  const keep = Object.keys(base).sort().slice(-RESULTS_DAYS);
  return Object.fromEntries(keep.map((d) => [d, base[d]]));
}

export function lastDays(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => daysBefore(today, n - 1 - i));
}
const HUB_MAX = 430;

export function gameBySlug(slug: string): DailyGame | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export function statuses(date: string, kv: KV): Record<string, GameStatus> {
  const out: Record<string, GameStatus> = {};
  for (const g of GAMES) {
    try {
      out[g.slug] = g.status(date, kv);
    } catch {
      out[g.slug] = NOT_STARTED;
    }
  }
  return out;
}

/** The first unfinished game after `slug` (wrapping), or null if all are done. */
export function nextGame(slug: string, st: Record<string, GameStatus>): DailyGame | null {
  const i = GAMES.findIndex((g) => g.slug === slug);
  for (let k = 1; k < GAMES.length; k++) {
    const g = GAMES[(i + k) % GAMES.length];
    if (st[g.slug]?.phase !== "done") return g;
  }
  return null;
}

function daysBefore(iso: string, n: number): string {
  const d = dateFromISO(iso);
  return isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - n));
}

/**
 * Consecutive local days ending today (or yesterday, if today has nothing
 * finished yet, so the streak is not shown as lost before the day is over)
 * on which at least one game was finished.
 */
export function hubStreak(doneDates: Iterable<string>, today: string): number {
  const set = new Set(doneDates);
  let day = set.has(today) ? today : daysBefore(today, 1);
  let n = 0;
  while (set.has(day)) {
    n++;
    day = daysBefore(day, 1);
  }
  return n;
}

export function bestStreak(doneDates: Iterable<string>): number {
  const sorted = [...new Set(doneDates)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev !== null && daysBefore(d, 1) === prev ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function minutesLeft(st: Record<string, GameStatus>): number {
  return GAMES.filter((g) => st[g.slug]?.phase !== "done").reduce((n, g) => n + g.minutes, 0);
}

/** Every date we know at least one game was finished, from all sources. */
export function knownDoneDates(today: string, kv: KV): Set<string> {
  const out = new Set<string>();
  const log = json<string[]>(kv, HUB_KEY);
  if (Array.isArray(log)) for (const d of log) if (typeof d === "string") out.add(d);
  for (const g of GAMES) {
    try {
      g.pastDoneDates?.(kv).forEach((d) => out.add(d));
    } catch {
      /* ignore a malformed key */
    }
  }
  const st = statuses(today, kv);
  if (Object.values(st).some((s) => s.phase === "done")) out.add(today);
  return out;
}

/** Combined, spoiler-free share text for today's set. */
export function dailySetShare(
  st: Record<string, GameStatus>,
  streak: number,
  url: string,
  now: Date = new Date()
): string {
  const boxes = GAMES.map((g) => (st[g.slug]?.phase === "done" ? "✅" : "⬜")).join("");
  const lines = GAMES.map((g) => {
    const s = st[g.slug];
    return `${s?.phase === "done" ? "✅" : "⬜"} ${g.name}${s?.result ? ` ${s.result}` : ""}`;
  });
  const head = `Pricele daily set #${puzzleNumber(now)} ${boxes}`;
  const streakLine = streak > 0 ? [`🔥 ${streak}-day streak`] : [];
  return [head, ...lines, ...streakLine, url].join("\n");
}

// ---- browser helpers ------------------------------------------------------

function browserKV(): KV | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

/**
 * Record today in the hub log if any game is finished, and return the streak.
 * Safe to call from any game's finished state or from /today.
 */
export function syncHub(today: string = isoDate()): number {
  return syncHubStreaks(today).current;
}

export function syncHubStreaks(today: string = isoDate()): { current: number; best: number } {
  const kv = browserKV();
  if (!kv) return { current: 0, best: 0 };
  const dates = knownDoneDates(today, kv);
  if (dates.has(today)) {
    try {
      const log = json<string[]>(kv, HUB_KEY);
      const list = Array.isArray(log) ? log.filter((d) => typeof d === "string") : [];
      if (!list.includes(today)) {
        const next = [...list, today].sort().slice(-HUB_MAX);
        window.localStorage.setItem(HUB_KEY, JSON.stringify(next));
      }
    } catch {
      /* quota or privacy mode */
    }
  }
  try {
    const st = statuses(today, kv);
    const merged = mergeResults(json<ResultLog>(kv, RESULTS_KEY), today, st);
    window.localStorage.setItem(RESULTS_KEY, JSON.stringify(merged));
  } catch {
    /* quota or privacy mode */
  }
  return { current: hubStreak(dates, today), best: bestStreak(dates) };
}

export function readResults(): ResultLog {
  const kv = browserKV();
  return (kv && json<ResultLog>(kv, RESULTS_KEY)) || {};
}

export function readStatuses(today: string = isoDate()): Record<string, GameStatus> {
  const kv = browserKV();
  return kv ? statuses(today, kv) : {};
}
