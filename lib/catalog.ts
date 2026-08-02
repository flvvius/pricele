// Read-only views over data/prices.json, shared by every statically rendered
// reference page (/prices, /items, /archive). Kept separate from lib/puzzle.ts
// so the content pages don't drag the daily-rotation logic in with them.

import {
  PRICES,
  findPrice,
  daysSince,
  addDaysISO,
  dateFromISO,
  type PriceEntry,
} from "@/lib/puzzle";
import { ITEMS, getItem, type Item } from "@/data/items";
import { ROTATION } from "@/data/rotation";

export interface Country {
  code: string;
  name: string;
  flag: string;
  slug: string;
  localCurrency: string;
  avgHourlyWageUSD: number;
}

/** URL-safe slug for a country, e.g. "United States" -> "united-states". */
export function countrySlug(countryName: string): string {
  return countryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Every country in the price table, alphabetical. Derived, never hand-listed. */
export const COUNTRIES: Country[] = (() => {
  const seen = new Map<string, Country>();
  for (const p of PRICES) {
    if (seen.has(p.countryCode)) continue;
    seen.set(p.countryCode, {
      code: p.countryCode,
      name: p.countryName,
      flag: p.flag,
      slug: countrySlug(p.countryName),
      localCurrency: p.localCurrency,
      avgHourlyWageUSD: p.avgHourlyWageUSD,
    });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
})();

const COUNTRY_BY_SLUG = new Map(COUNTRIES.map((c) => [c.slug, c]));
const COUNTRY_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function getCountryBySlug(slug: string): Country | undefined {
  return COUNTRY_BY_SLUG.get(slug);
}

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRY_BY_CODE.get(code);
}

/** Every priced item for one country, in catalog order. */
export function pricesForCountry(code: string): PriceEntry[] {
  return ITEMS.map((i) => findPrice(i.id, code)).filter(
    (p): p is PriceEntry => p !== undefined
  );
}

/** Every country that has a price for one item, cheapest first. */
export function pricesForItem(itemId: string): PriceEntry[] {
  return PRICES.filter((p) => p.itemId === itemId).sort(
    (a, b) => a.priceUSD - b.priceUSD
  );
}

/** 1-based rank of a country for an item, 1 = most expensive. */
export function rankForItem(itemId: string, code: string): number | null {
  const desc = [...pricesForItem(itemId)].sort((a, b) => b.priceUSD - a.priceUSD);
  const idx = desc.findIndex((p) => p.countryCode === code);
  return idx < 0 ? null : idx + 1;
}

/** Median USD price of an item across every country that has it. */
export function medianPriceUSD(itemId: string): number {
  const v = pricesForItem(itemId).map((p) => p.priceUSD);
  if (v.length === 0) return 0;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 === 0 ? (v[mid - 1] + v[mid]) / 2 : v[mid];
}

/**
 * How many minutes of the average local wage buy one unit. The wage figures are
 * rough estimates (see /methodology), so this is rounded hard and always framed
 * as "about".
 */
export function wageMinutes(price: PriceEntry): number {
  return (price.priceUSD / price.avgHourlyWageUSD) * 60;
}

// ---------------------------------------------------------------------------
// Answer suppression
// ---------------------------------------------------------------------------

/**
 * The (item, country) pairs that must not show a price on a public reference
 * page, because they are — or are about to be, or have just been — the live
 * puzzle.
 *
 * The game rolls over at each player's LOCAL midnight, but these pages are
 * statically rendered and cached, so the server has no idea which calendar day
 * any given visitor is on. Suppressing a three-day window in UTC (yesterday,
 * today, tomorrow) covers every timezone from UTC-12 to UTC+14 with room to
 * spare, and costs almost nothing: consecutive days are always different
 * countries, so each country page hides at most one of its items.
 */
export function suppressedPairs(now: Date = new Date()): Set<string> {
  const todayIdx = daysSince(ROTATION.startDate, now);
  const out = new Set<string>();
  for (const offset of [-1, 0, 1]) {
    const iso = addDaysISO(ROTATION.startDate, todayIdx + offset);
    const pair = pairForDate(dateFromISO(iso));
    if (pair) out.add(`${pair.itemId}:${pair.countryCode}`);
  }
  return out;
}

/**
 * Which (item, country) a date resolves to, without building a full puzzle.
 * Mirrors getDailyPuzzle's substitution rule for sparse pairs.
 */
export function pairForDate(
  date: Date
): { itemId: string; countryCode: string } | null {
  const { countryOrder, itemOrder, startDate } = ROTATION;
  if (countryOrder.length === 0 || itemOrder.length === 0) return null;
  const dayIndex = daysSince(startDate, date);
  const m = (n: number, k: number) => ((n % k) + k) % k;
  const countryCode = countryOrder[m(dayIndex, countryOrder.length)];
  const itemIndex = m(dayIndex, itemOrder.length);
  for (let offset = 0; offset < itemOrder.length; offset++) {
    const itemId = itemOrder[(itemIndex + offset) % itemOrder.length];
    if (findPrice(itemId, countryCode) && getItem(itemId)) {
      return { itemId, countryCode };
    }
  }
  return null;
}

export function isSuppressed(
  itemId: string,
  countryCode: string,
  suppressed: Set<string>
): boolean {
  return suppressed.has(`${itemId}:${countryCode}`);
}

/**
 * Dates that are safe to publish a full answer for, newest first.
 *
 * The in-game archive (a client component) can show everything up to yesterday,
 * because it knows the player's real local date. These static pages don't, so
 * they stop two days back — the same reasoning as suppressedPairs: a server
 * rendering "yesterday" in UTC may be describing a date that is still today for
 * a player in Honolulu or Auckland.
 */
export function publishedArchiveDates(
  now: Date = new Date(),
  limit = 400
): string[] {
  const todayIdx = daysSince(ROTATION.startDate, now);
  const newest = todayIdx - 2;
  const oldest = Math.max(0, newest - limit + 1);
  const out: string[] = [];
  for (let i = newest; i >= oldest; i--) {
    out.push(addDaysISO(ROTATION.startDate, i));
  }
  return out;
}

/** Whether a date is old enough to publish its answer publicly. */
export function isPublishedArchiveDate(iso: string, now: Date = new Date()): boolean {
  const idx = daysSince(ROTATION.startDate, dateFromISO(iso));
  return idx >= 0 && idx <= daysSince(ROTATION.startDate, now) - 2;
}

export { ITEMS, getItem, type Item, type PriceEntry };
