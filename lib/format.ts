// Shared, framework-free formatting helpers used by both the interactive game
// (Reveal) and the statically rendered SEO reference pages, so the numbers and
// copy stay identical everywhere.
//
// Everything that compares prices is scoped to a single item id. There is no
// longer one "active item", since each day has its own, so a helper that ranked or
// averaged across the whole table would silently mix Big Macs in with litres of
// milk.

import type { PriceEntry } from "@/lib/puzzle";
import { PRICES } from "@/lib/puzzle";
import { getItem } from "@/data/items";
import { fromUSD, type Currency } from "@/lib/currency";

/**
 * "140 JPY", "45,000 LBP": the price in its local currency, or null when the
 * source published a dollar figure and nothing else. Callers render the line
 * only when there is one, rather than converting: see PriceEntry.priceLocal.
 */
export function formatLocal(price: PriceEntry): string | null {
  if (price.priceLocal == null) return null;
  const n = price.priceLocal.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  return `${n} ${price.localCurrency}`;
}

/** "$1.55": the price in USD. */
export function formatUSD(priceUSD: number): string {
  return `$${priceUSD.toFixed(2)}`;
}

/**
 * Locale-aware currency formatting for the interactive client. It uses the
 * visitor's browser locale for separators and symbol placement. Use this in
 * client components only; the SEO reference pages use the en-US helpers above so
 * their HTML stays byte-for-byte deterministic across builds.
 */
/**
 * A canonical USD figure, converted and formatted for whichever currency the
 * player is reading in. The one helper the game screen should use for prices,
 * it keeps the conversion and the formatting from drifting apart.
 */
export function formatPrice(priceUSD: number, currency: Currency): string {
  return formatMoney(fromUSD(priceUSD, currency), currency);
}

export function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
  }
}

/** How much local working time the item costs, as a human sentence. */
export function affordanceLine(price: PriceEntry): string {
  const minutes = (price.priceUSD / price.avgHourlyWageUSD) * 60;
  if (minutes < 1) {
    return "Under a minute of the average local wage buys one.";
  }
  if (minutes < 90) {
    return `About ${Math.round(minutes)} minutes of the average local wage buys one.`;
  }
  const hours = minutes / 60;
  return `About ${hours.toFixed(1)} hours of the average local wage buys one.`;
}

/**
 * How far a guess is from the real price, as a rounded percentage of the real
 * price. Symmetric enough for a headline number: $0.90 vs $1.00 -> 10.
 * Always >= 0. Used for "within X%" / "X% off" copy and the share hook.
 */
export function pctOff(guess: number, actual: number): number {
  if (!(actual > 0)) return 0;
  return Math.round(Math.abs(guess / actual - 1) * 100);
}

/** The smallest pctOff across a set of guesses (the player's best shot). */
export function bestPctOff(
  guesses: { value: number }[],
  actual: number
): number {
  if (guesses.length === 0) return 0;
  return Math.min(...guesses.map((g) => pctOff(g.value, actual)));
}

/**
 * A short, punchy line about how close the player landed, the "mini WordleBot"
 * accuracy read. Different framing for a win (celebrate) vs. a loss (near-miss
 * sting that pulls them back tomorrow).
 */
export function accuracyLine(bestOff: number, won: boolean): string {
  if (won) {
    if (bestOff === 0) return "Spot on. You nailed the exact price.";
    return `Within ${bestOff}% of the real price.`;
  }
  if (bestOff <= 15) return `So close. Your closest was just ${bestOff}% off.`;
  if (bestOff <= 40) return `Your closest guess was ${bestOff}% off. Tomorrow's yours.`;
  return `Your closest guess was ${bestOff}% off. Try again tomorrow.`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * "24 July 2026" from an ISO date. Built by hand rather than with toLocaleString
 * so the statically rendered archive pages produce identical HTML on every
 * machine, regardless of the build server's locale.
 */
export function formatArchiveDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Every price row for one item. */
function rowsFor(itemId: string): PriceEntry[] {
  return PRICES.filter((p) => p.itemId === itemId);
}

/**
 * A scale anchor for the very first guess: the median price of the day's item
 * across every country in the game. Without it a new player has no idea whether
 * the answer lives near $0.20 or $20, which makes the opening guess a pure stab.
 * The median deliberately says nothing about today's country specifically.
 */
export function anchorPriceUSD(itemId: string): number {
  const all = rowsFor(itemId)
    .map((p) => p.priceUSD)
    .sort((a, b) => a - b);
  if (all.length === 0) return 0;
  const mid = Math.floor(all.length / 2);
  return all.length % 2 === 0 ? (all[mid - 1] + all[mid]) / 2 : all[mid];
}

/**
 * Where the day's price sits among all countries for the same item, as a
 * "did you know" reveal stat. Ranks by USD price; 1 = most expensive.
 */
export function priceRankLine(price: PriceEntry): string {
  const all = rowsFor(price.itemId);
  const total = all.length;
  if (total < 2) return "";

  // Counted rather than read off a sorted position, because ties are common
  // once a table gets wide: several countries share a diesel price to the cent,
  // and a row's index in a sorted array puts an arbitrary one of them first.
  // Ranking by position then told a country in the cheaper half that it was
  // more expensive than half the game.
  const dearer = all.filter((p) => p.priceUSD > price.priceUSD).length;
  const cheaper = all.filter((p) => p.priceUSD < price.priceUSD).length;
  if (dearer + cheaper === 0) return "";

  const noun = (getItem(price.itemId)?.shortName ?? "item").toLowerCase();
  if (dearer === 0) {
    return `That makes it the most expensive ${noun} of all ${total} countries in the game.`;
  }
  if (cheaper === 0) {
    return `That makes it the cheapest ${noun} of all ${total} countries in the game.`;
  }
  if (dearer < 3 && cheaper > dearer) {
    return `That's the #${dearer + 1} priciest of the ${total} countries in the game.`;
  }
  // Whichever side is bigger picks the framing, so the sentence can never
  // contradict the numbers behind it.
  return cheaper >= dearer
    ? `More expensive than ${Math.round((cheaper / (total - 1)) * 100)}% of the ${total} countries in the game.`
    : `Cheaper than ${Math.round((dearer / (total - 1)) * 100)}% of the ${total} countries in the game.`;
}

/**
 * The type size for the "today's lot" headline, chosen from how long the
 * headline actually is.
 *
 * The band under the masthead is the only place that states what is being
 * priced, and it used to be a single truncated line. That worked until the
 * table gained countries with long names: "Coca-Cola (330ml can) in United
 * Arab Emirates" clipped to "…in United Ara…", cutting the half of the
 * sentence a player most needs, since the country is the puzzle.
 *
 * So the headline wraps to a second line instead, and steps down a size when
 * it is long enough to need one — which is what a subeditor does with a
 * headline that will not fit the column, rather than cutting the last word off
 * the story. Short headlines are untouched: below the first threshold this
 * returns exactly the size the band has always used.
 *
 * The thresholds are counted in characters, which is a rough proxy for width
 * in a proportional face, but a safe one here: it errs towards stepping down a
 * name set in wide capitals (UNITED ARAB EMIRATES) slightly earlier than one
 * of the same length in lowercase, and a headline one step smaller than it
 * strictly had to be still reads.
 */
export function headlineSize(headline: string): string {
  const n = headline.trim().length;
  if (n >= 40) return "text-[1.0625rem] xs:text-[1.125rem] lg:text-[1.5rem]";
  if (n >= 30) return "text-[1.1875rem] xs:text-[1.3125rem] lg:text-[1.625rem]";
  if (n >= 22) return "text-[1.3125rem] xs:text-[1.4375rem] lg:text-[1.75rem]";
  return "text-[1.5rem] lg:text-[2.125rem]";
}
