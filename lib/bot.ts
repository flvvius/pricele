// The baseline model the player is scored against, and the only opponent in the
// game.
//
// A streak says how often you show up. A win rate says how often you land inside
// 5%. Neither tells a good player whether they are actually good, because there
// is nothing to be good *relative to*. So the reveal shows what a two-line
// statistical model would have guessed, and whether the player beat it.
//
// The model is deliberately simple and deliberately explained on the page. It
// multiplies two things the site already publishes: what this item costs in a
// typical country, and how expensive this country is in general. Nearly all of
// the variance in the table is those two effects, which is exactly why beating
// it is a real achievement rather than a formality: to win you have to know
// something the model does not, like that fuel is subsidised here or that this
// country grows its own apples.
//
// It never sees the answer. The country's price level is computed with the
// target item excluded, so the prediction is genuinely out of sample. Without
// that, a country with only two or three rows would have its own answer folded
// into the level used to predict it, and the bot would look far cleverer than it
// is.

import { PRICES, type PriceEntry } from "./puzzle";

/** The geometric median-ish centre of an item's prices: the median of its logs. */
function medianLog(values: number[]): number {
  if (values.length === 0) return 0;
  const logs = values.filter((v) => v > 0).map(Math.log).sort((a, b) => a - b);
  if (logs.length === 0) return 0;
  const mid = Math.floor(logs.length / 2);
  return logs.length % 2 === 0 ? (logs[mid - 1] + logs[mid]) / 2 : logs[mid];
}

/** The typical price of an item across every country that has it, in logs. */
function itemLevel(itemId: string, exclude?: string): number {
  return medianLog(
    PRICES.filter((p) => p.itemId === itemId && p.countryCode !== exclude).map(
      (p) => p.priceUSD
    )
  );
}

/**
 * How expensive a country is in general: the mean, across its rows, of how far
 * each price sits from that item's typical price.
 *
 * `excludeItem` is the item being predicted. Leaving it in would let the answer
 * inform the prediction of itself.
 */
function countryLevel(countryCode: string, excludeItem: string): number | null {
  const rows = PRICES.filter(
    (p) => p.countryCode === countryCode && p.itemId !== excludeItem
  );
  if (rows.length === 0) return null;

  let sum = 0;
  let n = 0;
  for (const row of rows) {
    if (!(row.priceUSD > 0)) continue;
    const typical = itemLevel(row.itemId, countryCode);
    if (typical === 0) continue;
    sum += Math.log(row.priceUSD) - typical;
    n += 1;
  }
  return n === 0 ? null : sum / n;
}

/**
 * What the baseline would have guessed for a pair, in USD, or null when the
 * country has too little else in the table to place it.
 */
export function botGuessUSD(price: PriceEntry): number | null {
  const level = countryLevel(price.countryCode, price.itemId);
  if (level === null) return null;
  const typical = itemLevel(price.itemId, price.countryCode);
  if (typical === 0) return null;
  const predicted = Math.exp(typical + level);
  return Number.isFinite(predicted) && predicted > 0 ? predicted : null;
}

export interface BotResult {
  guessUSD: number;
  /** How far the bot landed, as a percentage of the real price. */
  pctOff: number;
  /** True when the player's closest bid beat it. */
  playerWon: boolean;
  /** True when both landed the same distance out, to the rounded percent. */
  drawn: boolean;
}

/**
 * Score the player's best bid against the baseline.
 *
 * Compared on the log ratio rather than the rounded percentage the reveal
 * prints, because two guesses can round to the same percent and still be
 * genuinely different, and the player should not be told they drew with the
 * model when they beat it by a hair.
 */
export function beatTheBot(
  bestGuessUSD: number,
  price: PriceEntry
): BotResult | null {
  const guessUSD = botGuessUSD(price);
  if (guessUSD === null || !(bestGuessUSD > 0)) return null;

  const botLog = Math.abs(Math.log(guessUSD / price.priceUSD));
  const playerLog = Math.abs(Math.log(bestGuessUSD / price.priceUSD));

  return {
    guessUSD,
    pctOff: Math.round(Math.abs(guessUSD / price.priceUSD - 1) * 100),
    playerWon: playerLog < botLog,
    drawn: Math.abs(playerLog - botLog) < 1e-9,
  };
}
