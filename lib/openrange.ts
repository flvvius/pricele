import { getItem, itemPhrase, sentenceCase } from "@/data/items";
import { gameRows, medianPriceUSD, pairForDate, type PriceEntry } from "./catalog";
import { dateFromISO } from "./puzzle";

export interface RangeQuestion {
  price: PriceEntry;
  label: string;
  median: number;
}

export interface RangePuzzle {
  number: number;
  date: string;
  questions: RangeQuestion[];
}

export interface Range {
  low: number;
  high: number;
}

export const QUESTIONS = 5;
export const QUESTION_MAX = 100;
export const FULL_WIDTH = 8;
export const MAX_WIDTH = 12;
export const MIN_SCORE = 10;
export const EPOCH = "2026-10-22";
const DAY_MS = 86_400_000;
const UNSOURCED = /seed estimate|web check/i;

export function dayIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [ey, em, ed] = EPOCH.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / DAY_MS);
}

function rng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hiddenPairs(date: string): Set<string> {
  const out = new Set<string>();
  const base = dateFromISO(date);
  for (const offset of [-1, 0, 1]) {
    const pair = pairForDate(
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset)
    );
    if (pair) out.add(`${pair.itemId}:${pair.countryCode}`);
  }
  return out;
}

export function dealQuestions(
  date: string,
  count: number,
  seed: number,
  exclude: Set<string> = new Set()
): RangeQuestion[] {
  const rand = rng(dayIndex(date) * 2654435761 + seed);
  const hidden = hiddenPairs(date);
  const pool = gameRows(date).filter(
    (p) =>
      p.priceUSD > 0 &&
      !UNSOURCED.test(p.source) &&
      !hidden.has(`${p.itemId}:${p.countryCode}`) &&
      !exclude.has(`${p.itemId}:${p.countryCode}`) &&
      getItem(p.itemId)
  );
  const itemIds = [...new Set(pool.map((p) => p.itemId))];

  const questions: RangeQuestion[] = [];
  const usedItems = new Set<string>();
  const usedCountries = new Set<string>();
  for (let attempt = 0; attempt < 2000 && questions.length < count; attempt++) {
    const itemId = itemIds[Math.floor(rand() * itemIds.length)];
    if (usedItems.has(itemId)) continue;
    const options = pool.filter((p) => p.itemId === itemId && !usedCountries.has(p.countryCode));
    if (options.length === 0) continue;
    const price = options[Math.floor(rand() * options.length)];
    usedItems.add(itemId);
    usedCountries.add(price.countryCode);
    questions.push({
      price,
      label: sentenceCase(itemPhrase(getItem(itemId)!)),
      median: medianPriceUSD(itemId, date),
    });
  }
  return questions;
}

export function puzzleFor(date: string): RangePuzzle {
  return { number: dayIndex(date) + 1, date, questions: dealQuestions(date, QUESTIONS, 500) };
}

export function width(r: Range): number {
  return r.high / r.low;
}

export function isValidRange(r: Range): boolean {
  return r.low > 0 && r.high > r.low && width(r) <= MAX_WIDTH;
}

export function isHit(r: Range, answer: number): boolean {
  return answer >= r.low && answer <= r.high;
}

export function questionScore(r: Range, answer: number): number {
  if (!isHit(r, answer)) return 0;
  return Math.max(
    MIN_SCORE,
    Math.round(QUESTION_MAX * (1 - Math.log(width(r)) / Math.log(FULL_WIDTH)))
  );
}

export function missDirection(r: Range, answer: number): "above" | "below" | null {
  if (answer > r.high) return "above";
  if (answer < r.low) return "below";
  return null;
}

export function missedBy(r: Range, answer: number): number {
  if (answer < r.low) return (r.low - answer) / answer;
  if (answer > r.high) return (answer - r.high) / r.high;
  return 0;
}

export function totalScore(p: RangePuzzle, ranges: Range[]): number {
  return ranges.reduce(
    (s, r, i) => s + (i < QUESTIONS ? questionScore(r, p.questions[i].price.priceUSD) : 0),
    0
  );
}

export interface RangeState {
  date: string;
  ranges: Range[];
}

export function isOver(state: RangeState): boolean {
  return state.ranges.length >= QUESTIONS;
}

export function result(p: RangePuzzle, state: RangeState): string {
  return `${totalScore(p, state.ranges)}/${QUESTIONS * QUESTION_MAX}`;
}

export function averageWidth(ranges: Range[]): number {
  if (ranges.length === 0) return 1;
  return Math.exp(ranges.reduce((s, r) => s + Math.log(width(r)), 0) / ranges.length);
}

export function shareText(p: RangePuzzle, state: RangeState, url: string): string {
  const row = state.ranges
    .map((r, i) => (isHit(r, p.questions[i].price.priceUSD) ? "🎯" : "❌"))
    .join("");
  return [
    `Open Range #${p.number} ${result(p, state)}`,
    row,
    `Avg width ${averageWidth(state.ranges).toFixed(1)}x`,
    url,
  ].join("\n");
}

export const KEY = "pricele:open-range";

export function loadState(date: string, key: string = KEY): RangeState {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const s = JSON.parse(raw) as RangeState;
      if (s.date === date && Array.isArray(s.ranges)) return s;
    }
  } catch {
    return { date, ranges: [] };
  }
  return { date, ranges: [] };
}

export function saveState(state: RangeState, key: string = KEY): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    return;
  }
}
