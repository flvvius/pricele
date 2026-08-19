// All "today" logic runs in the player's LOCAL time, so the puzzle rolls over at
// their own midnight (00:00) wherever they are. This is computed on the client after
// mount, so it always reflects the visitor's timezone.

import pricesData from "@/data/prices.json";
import { ROTATION } from "@/data/rotation";
import { getItem, type Item } from "@/data/items";

export interface PriceEntry {
  itemId: string;
  countryCode: string;
  countryName: string;
  flag: string;
  priceUSD: number;
  /**
   * The published price in the country's own currency. Absent when the source
   * only publishes a dollar figure (Cable.co.uk's mobile data survey is the
   * one such source today). Never back-converted from `priceUSD`: a local
   * price nobody published would look exactly as authoritative as one that
   * was, so the UI omits the line instead.
   */
  priceLocal?: number;
  localCurrency: string;
  avgHourlyWageUSD: number;
  source: string;
  sourceDate: string;
}

export const PRICES = pricesData as PriceEntry[];

/** Fast lookup for a single (item, country) pair. */
const PRICE_INDEX = new Map(
  PRICES.map((p) => [`${p.itemId}:${p.countryCode}`, p])
);

export function findPrice(
  itemId: string,
  countryCode: string
): PriceEntry | undefined {
  return PRICE_INDEX.get(`${itemId}:${countryCode}`);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** ISO "YYYY-MM-DD" for a date, in local time. Used as the localStorage day key. */
export function isoDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Whole calendar days from `from` (an ISO "YYYY-MM-DD" string) to `to` (a Date),
 * both read as local calendar dates. Comparing UTC-anchored midnights of the local
 * Y/M/D keeps the difference an exact multiple of a day even across DST changes.
 */
export function daysSince(from: string, to: Date): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((toMs - fromMs) / MS_PER_DAY);
}

/** 1-based puzzle number for the given day. */
export function puzzleNumber(today: Date = new Date()): number {
  return daysSince(ROTATION.epoch, today) + 1;
}

/** A local Date at midnight for an ISO "YYYY-MM-DD" string. */
export function dateFromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Past puzzle dates (ISO), newest first, from the rotation start up to yesterday.
 * Capped to the most recent `limit`. Never includes today or the future, so the
 * archive can't be used to look up the current answer.
 */
export function pastPuzzleDates(today: Date = new Date(), limit = 60): string[] {
  const todayIdx = daysSince(ROTATION.startDate, today);
  const dates: string[] = [];
  const start = Math.max(0, todayIdx - limit);
  for (let i = todayIdx - 1; i >= start; i--) {
    dates.push(addDaysISO(ROTATION.startDate, i));
  }
  return dates;
}

/** ISO date `days` after an ISO date, in local calendar terms. */
export function addDaysISO(iso: string, days: number): string {
  const base = dateFromISO(iso);
  return isoDate(new Date(base.getFullYear(), base.getMonth(), base.getDate() + days));
}

export interface DailyPuzzle {
  puzzleNumber: number;
  item: Item;
  price: PriceEntry;
}

/** Positive modulo, so dates before startDate still land in range. */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * The item ids to try for a day, best candidate first.
 *
 * The catalogue grew from 7 items to 17, which changes `dayIndex % length` for
 * every day at once and would have silently rewritten which item every past
 * puzzle used. So days before `itemOrderFrom` keep the seven-item schedule they
 * were played with, and the full list takes over from that day on. See the
 * stability note in data/rotation.ts.
 *
 * The list is rotated rather than sliced, so a caller can walk the whole
 * catalogue from the scheduled item onwards when a country lacks it.
 */
export function itemOrderForDay(dayIndex: number): string[] {
  const { itemOrder, legacyItemOrder, itemOrderFrom } = ROTATION;
  const legacy = dayIndex < itemOrderFrom;
  const list = legacy ? legacyItemOrder : itemOrder;
  if (list.length === 0) return [];
  const start = legacy
    ? mod(dayIndex, list.length)
    : mod(dayIndex - itemOrderFrom, list.length);
  return list.map((_, i) => list[(start + i) % list.length]);
}

/**
 * Resolve the puzzle for a given day: which country and item are up, and the
 * matching price row.
 *
 * The country and item advance on independent cycles (see data/rotation.ts).
 * Not every country has every item, since the price table is deliberately sparse
 * rather than padded with invented numbers, so when the scheduled pair has no
 * row we walk forward through itemOrder to the next item that country does
 * have. That substitution is a pure function of the day index, so a given date
 * always resolves to the same puzzle on every device and every rebuild.
 *
 * Returns null only if the rotation is empty or the country has no rows at all.
 */
export function getDailyPuzzle(today: Date = new Date()): DailyPuzzle | null {
  const { countryOrder, itemOrder, startDate } = ROTATION;
  if (countryOrder.length === 0 || itemOrder.length === 0) return null;

  const dayIndex = daysSince(startDate, today);
  const countryCode = countryOrder[mod(dayIndex, countryOrder.length)];

  for (const itemId of itemOrderForDay(dayIndex)) {
    const price = findPrice(itemId, countryCode);
    const item = getItem(itemId);
    if (price && item) {
      return { puzzleNumber: puzzleNumber(today), item, price };
    }
  }
  return null;
}

/** The puzzle for an ISO date string. Convenience for the static archive pages. */
export function getPuzzleForISO(iso: string): DailyPuzzle | null {
  return getDailyPuzzle(dateFromISO(iso));
}
