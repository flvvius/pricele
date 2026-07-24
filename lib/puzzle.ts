// All "today" logic runs in the player's LOCAL time, so the puzzle rolls over at
// their own midnight (00:00) wherever they are. This is computed on the client after
// mount, so it always reflects the visitor's timezone.

import pricesData from "@/data/prices.json";
import { ROTATION } from "@/data/rotation";
import { ACTIVE_ITEM } from "@/data/item";

export interface PriceEntry {
  itemId: string;
  countryCode: string;
  countryName: string;
  flag: string;
  priceUSD: number;
  priceLocal: number;
  localCurrency: string;
  avgHourlyWageUSD: number;
  source: string;
  sourceDate: string;
}

const PRICES = pricesData as PriceEntry[];

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
  item: typeof ACTIVE_ITEM;
  price: PriceEntry;
}

/**
 * Resolve the puzzle for a given day: which country is up, and its price row.
 * Returns null only if the rotation is empty or the country has no price row
 * (a data error we surface rather than crash on).
 */
export function getDailyPuzzle(today: Date = new Date()): DailyPuzzle | null {
  const { countryOrder, startDate } = ROTATION;
  if (countryOrder.length === 0) return null;

  const idx =
    ((daysSince(startDate, today) % countryOrder.length) +
      countryOrder.length) %
    countryOrder.length;
  const countryCode = countryOrder[idx];

  const price = PRICES.find(
    (p) => p.itemId === ACTIVE_ITEM.id && p.countryCode === countryCode
  );
  if (!price) return null;

  return { puzzleNumber: puzzleNumber(today), item: ACTIVE_ITEM, price };
}
