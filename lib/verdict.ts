// The reveal's editorial voice: a persona read off the shape of the round, a
// roast pitched to how far off the closest guess landed, and a line naming the
// country the player's guess would have been right about.
//
// A price on its own is dry, and it is the same price for everyone who plays
// that day, so it says nothing about the person holding the phone. The pattern
// of their five guesses does. That is the part worth screenshotting, and it is
// the reason this file exists.
//
// THE RULE FOR EVERY STRING HERE. The joke is the guess or the price, never the
// player. "You just paid Hong Kong prices for Iranian petrol" is a line about
// two economies. Anything that reads as a line about the person typing does not
// belong on a site half of whose readers are using it in a classroom.
//
// Everything is pure and deterministic. The receipt quotes the verdict, so the
// same round has to produce the same words on every render and every device,
// which rules out Math.random() where there is a choice of line.

import type { GuessRecord } from "./storage";
import type { PriceEntry } from "./puzzle";
import { PRICES } from "./puzzle";
import { getItem } from "@/data/items";
import { pctOff } from "./format";

export interface Persona {
  /** The verdict itself, e.g. "The Tourist". Goes on the receipt. */
  title: string;
  /** One line underneath it, on the reveal only. The receipt stays one line. */
  gloss: string;
}

const ORDINAL = ["1st", "2nd", "3rd", "4th", "5th"];

/** How many times the guesses crossed from above the price to below, or back. */
function crossings(guesses: GuessRecord[]): number {
  const sides = guesses
    .map((g) => g.direction)
    .filter((d) => d !== "exact") as ("too_high" | "too_low")[];
  let n = 0;
  for (let i = 1; i < sides.length; i++) {
    if (sides[i] !== sides[i - 1]) n++;
  }
  return n;
}

/** True when every guess landed closer than the one before it. */
function narrowing(guesses: GuessRecord[], actual: number): boolean {
  if (guesses.length < 3) return false;
  for (let i = 1; i < guesses.length; i++) {
    if (pctOff(guesses[i].value, actual) >= pctOff(guesses[i - 1].value, actual)) {
      return false;
    }
  }
  return true;
}

/**
 * The verdict for a finished round.
 *
 * Checks run most specific first and the first match wins. The last two always
 * match, so this never returns null.
 */
export function personaFor(
  guesses: GuessRecord[],
  actual: number,
  won: boolean
): Persona {
  const n = guesses.length;
  if (n === 0) {
    return { title: "Window Shopper", gloss: "Nothing bid on this one." };
  }

  // Distances are measured in log space, not in percent, and getting this wrong
  // silently killed a whole verdict. Percent error is asymmetric: bidding double
  // is "100% off" but bidding half is only "50% off", and bidding a tenth is
  // still only 90%. So a threshold like "best >= 100%" can only ever be met by
  // overbidding, which meant The Backpacker sat below two rules that catch every
  // overbidder first and could never fire at all. A log ratio is symmetric: half
  // and double are the same distance, which is what these rules mean by "out by
  // a factor of two".
  const logOff = (v: number) => Math.abs(Math.log(v / actual));
  const firstLog = logOff(guesses[0].value);
  const bestLog = Math.min(...guesses.map((g) => logOff(g.value)));

  /** Out by a factor of two, either way. */
  const FACTOR_2 = Math.log(2);
  /** Within a tenth, either way. */
  const WITHIN_10 = Math.log(1.1);

  const first = pctOff(guesses[0].value, actual);
  const values = guesses.map((g) => g.value);
  const spread = Math.max(...values) / Math.min(...values);
  const highs = guesses.filter((g) => g.direction === "too_high").length;
  const lows = guesses.filter((g) => g.direction === "too_low").length;

  if (won && n === 1) {
    return {
      title: "The Local",
      gloss: "First bid, straight in. You have clearly been there.",
    };
  }

  // Guessing three times the real price is not being generous, it is pricing a
  // different economy. Checked before the plain Tourist so the worst offenders
  // get the better title.
  if (n >= 2 && highs === n && first >= 150) {
    return {
      title: "The Oligarch",
      gloss: "You priced this in a country with a considerably better exchange rate.",
    };
  }

  // Crossing repeatedly is only chaos if it never converges. A bid that goes
  // high, then low, then lands is a clean bisection and the correct way to play.
  if (
    n >= 3 &&
    crossings(guesses) >= 2 &&
    spread >= 3 &&
    !narrowing(guesses, actual)
  ) {
    return {
      title: "The Auctioneer",
      gloss: "You did not narrow it down so much as bid against yourself.",
    };
  }

  if (n >= 2 && firstLog >= FACTOR_2 && bestLog <= WITHIN_10) {
    return {
      title: "The Recovering Tourist",
      gloss: "Opened at holiday prices and talked yourself down. That is growth.",
    };
  }

  if (n >= 2 && highs === n) {
    return {
      title: "The Tourist",
      gloss: "Every bid came in over. You would be a popular customer.",
    };
  }

  if (n >= 2 && lows === n) {
    return {
      title: "The Haggler",
      gloss: "Every bid came in under. Nobody is selling at your price.",
    };
  }

  if (won && narrowing(guesses, actual)) {
    return {
      title: "The Buyer",
      gloss: "Closer every time. That is how you work a market stall.",
    };
  }

  if (!won && bestLog <= WITHIN_10) {
    return {
      title: "The Near Miss",
      gloss: "Close enough to sting. The win band is only 5% wide.",
    };
  }

  if (!won && bestLog >= FACTOR_2) {
    return {
      title: "The Backpacker",
      gloss: "Confident, well travelled, and nowhere near this one.",
    };
  }

  return won
    ? { title: "The Regular", gloss: "Worked it out and closed it out." }
    : {
        title: "The Browser",
        gloss: "Out of bids with the price still on the shelf.",
      };
}

// ---------------------------------------------------------------------------
// Roasts
// ---------------------------------------------------------------------------

/**
 * Roast tiers, keyed to percent off, closest band first.
 *
 * The escalation is the joke: the top band is a compliment and the bottom band
 * is absurd. Anything in between that reads as merely factual is doing the
 * accuracy line's job rather than this one's.
 */
const ROASTS: { maxPct: number; lines: string[] }[] = [
  {
    maxPct: 5,
    lines: [
      "Priced to the cent. The till agrees with you.",
      "That is the price. Not near the price, the price.",
      "Rung up without a second look.",
    ],
  },
  {
    maxPct: 15,
    lines: [
      "Close enough that you would not check the receipt.",
      "Within the margin a menu reprint would cover.",
      "Off by roughly a tip.",
    ],
  },
  {
    maxPct: 40,
    lines: [
      "Right shop, wrong shelf.",
      "That is the price in the next country over.",
      "You were in the market. You were not at the stall.",
    ],
  },
  {
    maxPct: 100,
    lines: [
      "Out by a factor that would start an argument at the counter.",
      "That is a different continent's price.",
      "You have described somewhere else entirely.",
    ],
  },
  {
    maxPct: 300,
    lines: [
      "Off by several times over. No shop anywhere charges that.",
      "That is airport pricing applied to a corner shop.",
      "You have left the price table.",
    ],
  },
];

const COLDEST = [
  "That is not a price, that is a ransom.",
  "No country in the game is within a factor of four of that.",
  "You have invented an economy.",
];

/**
 * The roast for a finished round, chosen from the *closest* guess.
 *
 * Keyed to the best guess rather than the last, because the last guess on a loss
 * is often a desperate stab, and mocking the stab punishes a player for still
 * trying on bid five.
 */
export function roastFor(bestPct: number, puzzleNumber: number): string {
  const band = ROASTS.find((r) => bestPct <= r.maxPct);
  const lines = band?.lines ?? COLDEST;
  const i = ((puzzleNumber % lines.length) + lines.length) % lines.length;
  return lines[i];
}

/**
 * The line that names a country the opening guess would have been right about.
 *
 * This is the "you just paid Hong Kong prices for Iranian petrol" joke, and it
 * is generated rather than written, which is why it works for all seventeen
 * items instead of the two or three anyone would get round to writing copy for.
 * It is also true, which a hand-written version would stop being the moment the
 * table was refreshed.
 *
 * `suppressed` is the live suppression set. A country whose price for this item
 * is currently withheld must never be named here: the sentence would hand over a
 * figure the rest of the site is deliberately holding back.
 */
export function lookalikeLine(
  guessUSD: number,
  price: PriceEntry,
  suppressed: Set<string>
): string | null {
  const item = getItem(price.itemId);
  if (!item || !(guessUSD > 0)) return null;

  const candidates = PRICES.filter(
    (p) =>
      p.itemId === price.itemId &&
      p.countryCode !== price.countryCode &&
      p.priceUSD > 0 &&
      !suppressed.has(`${p.itemId}:${p.countryCode}`)
  );
  if (candidates.length === 0) return null;

  let nearest = candidates[0];
  let nearestGap = Math.abs(Math.log(guessUSD / nearest.priceUSD));
  for (const c of candidates) {
    const gap = Math.abs(Math.log(guessUSD / c.priceUSD));
    if (gap < nearestGap) {
      nearest = c;
      nearestGap = gap;
    }
  }

  // Beyond about 15% the nearest country is not a lookalike, it is just the
  // least distant row in the table, and naming it would be a worse sentence than
  // saying nothing.
  if (Math.exp(nearestGap) > 1.15) return null;

  const noun = item.shortName.toLowerCase();
  if (nearest.countryCode === price.countryCode) return null;
  return `Your opening bid is about what a ${noun} costs in ${nearest.countryName} ${nearest.flag}.`;
}

export interface Highlight {
  /** "Your 2nd bid was 4% off." */
  line: string;
  /** 1-based index of the guess that line is about. */
  guessNumber: number;
}

/**
 * The best thing that happened in the round, phrased to lead the reveal.
 *
 * Chess.com found four fifths of post-game reviews happened after wins, and
 * moving the good moves above the blunders lifted engagement by a quarter. A
 * player who lost still put one bid close, and naming it is a better opening
 * sentence than "out of guesses".
 *
 * Null on a win, where the win is already the good news.
 */
export function highlightFor(
  guesses: GuessRecord[],
  actual: number,
  won: boolean
): Highlight | null {
  if (won || guesses.length === 0) return null;

  let bestIndex = 0;
  let bestOff = pctOff(guesses[0].value, actual);
  for (let i = 1; i < guesses.length; i++) {
    const off = pctOff(guesses[i].value, actual);
    if (off < bestOff) {
      bestOff = off;
      bestIndex = i;
    }
  }

  const ordinal = ORDINAL[bestIndex] ?? `${bestIndex + 1}th`;
  return {
    line: `Your ${ordinal} bid was ${bestOff}% off.`,
    guessNumber: bestIndex + 1,
  };
}
