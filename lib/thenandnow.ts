// Then & Now: a daily game on U.S. price history. Each day shows one grocery
// or fuel item, what it averaged in the latest full year, and asks what it
// averaged in an earlier year. Numbers come only from the BLS Average Price
// Data series in data/then-and-now.ts; nothing here is estimated.

export interface ThenNowItem {
  id: string;
  name: string;
  unit: string;
  /** The item name exactly as BLS publishes it. */
  blsItem: string;
  /** BLS series id, for the citation link. */
  series: string;
  /** Calendar year -> annual mean price in USD. */
  prices: Record<number, number>;
}

export interface ThenNowPuzzle {
  number: number;
  date: string;
  item: ThenNowItem;
  year: number;
  answer: number;
  anchorYear: number;
  anchor: number;
}

export const MAX_GUESSES = 5;
/** A guess within this fraction of the answer wins. */
export const WIN_TOLERANCE = 0.1;
/** Puzzle #1. */
export const EPOCH = "2026-10-22";
/** Only ask about years at least this far before the anchor, so it's a real jump. */
const MIN_GAP = 5;

const DAY_MS = 86_400_000;

export function dayIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [ey, em, ed] = EPOCH.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / DAY_MS);
}

/** Small deterministic integer hash (mulberry32 step), so days don't look sequential. */
function hash(n: number): number {
  let t = (n + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (t ^ (t >>> 14)) >>> 0;
}

export function years(item: ThenNowItem): number[] {
  return Object.keys(item.prices).map(Number).sort((a, b) => a - b);
}

export function puzzleFor(date: string, items: ThenNowItem[]): ThenNowPuzzle {
  const idx = dayIndex(date);
  // Cycle through every item before repeating one; hash picks the year.
  const item = items[((idx % items.length) + items.length) % items.length];
  const ys = years(item);
  const anchorYear = ys[ys.length - 1];
  const pool = ys.filter((y) => y <= anchorYear - MIN_GAP);
  const year = pool[hash(idx) % pool.length];
  return {
    number: idx + 1,
    date,
    item,
    year,
    answer: item.prices[year],
    anchorYear,
    anchor: item.prices[anchorYear],
  };
}

export type Verdict = "win" | "higher" | "lower";

export function judge(guess: number, answer: number): Verdict {
  if (Math.abs(guess - answer) <= answer * WIN_TOLERANCE) return "win";
  return guess < answer ? "higher" : "lower";
}

export interface ThenNowState {
  date: string;
  guesses: number[];
}

export function isOver(state: ThenNowState, answer: number): boolean {
  return (
    state.guesses.some((g) => judge(g, answer) === "win") ||
    state.guesses.length >= MAX_GUESSES
  );
}

const ARROW: Record<Verdict, string> = { win: "🟩", higher: "⬆️", lower: "⬇️" };

export function shareText(p: ThenNowPuzzle, guesses: number[], url: string): string {
  const won = guesses.some((g) => judge(g, p.answer) === "win");
  const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const row = guesses.map((g) => ARROW[judge(g, p.answer)]).join("");
  return `Then & Now #${p.number} ${score}\n${p.item.name}, ${p.year}\n${row}\n${url}`;
}

export const KEY = "pricele:then-and-now";

export function loadState(date: string, key: string = KEY): ThenNowState {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const s = JSON.parse(raw) as ThenNowState;
      if (s.date === date && Array.isArray(s.guesses)) return s;
    }
  } catch {
    /* storage blocked or corrupt: start fresh */
  }
  return { date, guesses: [] };
}

export function saveState(state: ThenNowState, key: string = KEY): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
