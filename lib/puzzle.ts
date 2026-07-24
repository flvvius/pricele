// All "today" logic is UTC (§7, §10) — matches how Wordle-likes handle daily rollover
// and avoids per-timezone bugs. Everything here is pure and deterministic from a Date.

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

/** UTC midnight timestamp for a given date. */
function utcMidnight(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** ISO "YYYY-MM-DD" for a date, in UTC. Used as the localStorage day key. */
export function isoDateUTC(d: Date): string {
  return new Date(utcMidnight(d)).toISOString().slice(0, 10);
}

/** Whole UTC days from `from` (an ISO date string) to `to` (a Date). */
export function daysSinceUTC(from: string, to: Date): number {
  const fromMs = Date.parse(from + "T00:00:00Z");
  return Math.floor((utcMidnight(to) - fromMs) / MS_PER_DAY);
}

/** 1-based puzzle number for the given day. */
export function puzzleNumber(today: Date = new Date()): number {
  return daysSinceUTC(ROTATION.epoch, today) + 1;
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
    ((daysSinceUTC(startDate, today) % countryOrder.length) +
      countryOrder.length) %
    countryOrder.length;
  const countryCode = countryOrder[idx];

  const price = PRICES.find(
    (p) => p.itemId === ACTIVE_ITEM.id && p.countryCode === countryCode
  );
  if (!price) return null;

  return { puzzleNumber: puzzleNumber(today), item: ACTIVE_ITEM, price };
}
