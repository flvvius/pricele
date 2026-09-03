// The clue offered before the last bid.
//
// Heardle unlocked another second of audio on every miss, and the reason that
// worked is that the extra second was never enough to give the song away, only
// enough to move the player from "no idea" to "it is on the tip of my tongue".
// A hint that solves the puzzle removes the puzzle; a hint that changes nothing
// is a taunt. The band in between is narrow and every line here has to sit in it.
//
// So none of these give a figure. They give the *reason* a figure might be
// unusual: whether the country taxes this heavily, subsidises it, imports it, or
// makes it locally. That is exactly the explanation a teacher wants on the
// screen anyway, which is the second job this file does.

import type { PriceEntry } from "./puzzle";
import { PRICES } from "./puzzle";
import { getItem, itemCategory } from "@/data/items";

/** Hints unlock before the final bid, and not a moment earlier. */
export const HINT_AFTER_GUESSES = 3;

/**
 * Which way this country sits against the item's typical price, as a coarse
 * band. Three buckets, deliberately: "well above" over a spread that runs
 * hundredfold still leaves a great deal of room to be wrong in.
 */
function standing(price: PriceEntry): "high" | "typical" | "low" | null {
  const peers = PRICES.filter(
    (p) => p.itemId === price.itemId && p.priceUSD > 0
  );
  if (peers.length < 4) return null;
  const logs = peers.map((p) => Math.log(p.priceUSD)).sort((a, b) => a - b);
  const q1 = logs[Math.floor(logs.length * 0.25)];
  const q3 = logs[Math.floor(logs.length * 0.75)];
  const here = Math.log(price.priceUSD);
  if (here >= q3) return "high";
  if (here <= q1) return "low";
  return "typical";
}

/** The economic reason a price of this kind moves, phrased per category. */
const WHY: Record<string, { high: string; low: string }> = {
  energy: {
    high: "This is one of the more heavily taxed places in the table for fuel and power.",
    low: "This is one of the places in the table where energy is subsidised rather than taxed.",
  },
  vice: {
    high: "This country uses excise duty on this deliberately, as policy rather than as revenue.",
    low: "Duty on this is light here compared with most of the table.",
  },
  food: {
    high: "This is a country that imports most of what is on this shelf.",
    low: "This is a country that produces this itself, close to where it is sold.",
  },
  connectivity: {
    high: "Networks here are expensive to run and there is not much competition on price.",
    low: "This market has several operators competing hard on price.",
  },
};

/**
 * A clue for today's pair, or null when there is nothing safe to offer.
 *
 * Deterministic for a given puzzle: reloading must not deal a second hint, which
 * would turn the mechanic into a slot machine the player pulls until it says
 * something useful.
 */
export function hintFor(
  price: PriceEntry,
  guessesUsed: number,
  puzzleNumber: number
): string | null {
  if (guessesUsed < HINT_AFTER_GUESSES) return null;

  const item = getItem(price.itemId);
  if (!item) return null;

  const available: string[] = [];

  const where = standing(price);
  const why = WHY[itemCategory(price.itemId)];
  if (where && why && where !== "typical") {
    available.push(why[where]);
  } else if (where === "typical") {
    available.push(
      "This one sits in the middle of the table. No policy, no subsidy, nothing unusual."
    );
  }

  // How widely the table covers this item. A thin item is one where the data is
  // sparse, which is itself worth knowing before a last bid.
  //
  // Given as a proportion rather than a count, and that is not a style choice.
  // The count is an integer in the tens, and so are several prices: electricity
  // at 100 kWh runs to about $48 in Switzerland, and a clue reading "48 of the
  // countries" sat next to that answer looked exactly like the answer. No number
  // in a hint may be confusable with the figure the hint is about.
  const covered = new Set(
    PRICES.filter((p) => p.itemId === price.itemId).map((p) => p.countryCode)
  ).size;
  const total = new Set(PRICES.map((p) => p.countryCode)).size;
  const share = total > 0 ? covered / total : 0;
  const coverage =
    share >= 0.9
      ? "nearly every country in the game"
      : share >= 0.6
        ? "most of the countries in the game"
        : share >= 0.35
          ? "about half the countries in the game"
          : "only a handful of the countries in the game";
  available.push(`This item is priced in ${coverage}.`);

  // When the figure was collected. Prices move, and mobile data in particular is
  // quoted from the oldest survey in the game.
  if (price.sourceDate) {
    available.push(`This figure was collected in ${price.sourceDate}.`);
  }

  if (available.length === 0) return null;
  const i =
    ((puzzleNumber % available.length) + available.length) % available.length;
  return available[i];
}
