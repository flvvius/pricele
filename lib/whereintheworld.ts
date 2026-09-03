// Where in the World: the inverse mode. Here is the item and here is the price,
// name the country.
//
// This is the mode that decides what kind of game Pricele is. Guessing a number
// is a shopping game; being shown $1.40 for a litre of petrol and having to work
// out where you could be is a geography game, and geography is the genre that
// travels. It is the same table read backwards, so it costs no new data at all.
//
// Worldle's structure is the one that works: you guess, you are told how close
// you were, and the next guess is better informed. There is no distance here to
// report, so the ladder is made of facts about the country instead, unlocked one
// per miss. Each rung narrows the field without naming the answer, which is the
// same contract the daily's hints are under.

import { PRICES, type PriceEntry } from "./puzzle";
import { getItem } from "@/data/items";

export const MAX_ATTEMPTS = 5;

export interface Round {
  itemId: string;
  itemName: string;
  /** What the price buys, e.g. "one litre". */
  unit: string;
  priceUSD: number;
  answer: string;
  answerName: string;
  answerFlag: string;
  /** Every country in play for this round, as the picker's options. */
  options: { code: string; name: string; flag: string }[];
}

/**
 * Build a round from a price row.
 *
 * The options are only the countries that actually have a price for this item,
 * because offering all 49 when 20 of them have no row would mean a fifth of the
 * picker was never the answer, and a player who noticed would have a free hint.
 */
export function roundFor(price: PriceEntry): Round | null {
  const item = getItem(price.itemId);
  if (!item) return null;

  const options = PRICES.filter((p) => p.itemId === price.itemId)
    .map((p) => ({ code: p.countryCode, name: p.countryName, flag: p.flag }))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (options.length < 4) return null;

  return {
    itemId: price.itemId,
    itemName: item.name,
    unit: item.unit,
    priceUSD: price.priceUSD,
    answer: price.countryCode,
    answerName: price.countryName,
    answerFlag: price.flag,
    options,
  };
}

/**
 * The clue for a given number of misses, or null before the first one.
 *
 * The ladder runs from broad to narrow: the region, then how the country sits in
 * the wider price table, then the first letter. None of them names the country,
 * and the last is deliberately the weakest kind of hint rather than the
 * strongest, because a mode you cannot fail is not a mode.
 */
export function clueFor(round: Round, misses: number): string | null {
  if (misses < 1) return null;

  const row = PRICES.find(
    (p) => p.itemId === round.itemId && p.countryCode === round.answer
  );
  if (!row) return null;

  const clues: string[] = [];

  clues.push(`The wage there averages about $${Math.round(row.avgHourlyWageUSD)} an hour.`);

  // Counted from the table rather than written down: the catalogue has already
  // grown from 7 items to 17 once, and a literal here would have started lying
  // on the day it did.
  const totalItems = new Set(PRICES.map((p) => p.itemId)).size;
  const peers = new Set(
    PRICES.filter((p) => p.countryCode === round.answer).map((p) => p.itemId)
  ).size;
  clues.push(
    `This country has ${peers} of the ${totalItems} items in the game priced.`
  );

  clues.push(`Its name begins with "${round.answerName[0]}".`);

  return clues[Math.min(misses - 1, clues.length - 1)] ?? null;
}

export interface WhereStats {
  played: number;
  solved: number;
  current: number;
  best: number;
}

const KEY = "pricele:where";

export const EMPTY_WHERE: WhereStats = {
  played: 0,
  solved: 0,
  current: 0,
  best: 0,
};

export function loadWhere(): WhereStats {
  if (typeof window === "undefined" || !window.localStorage) return EMPTY_WHERE;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<WhereStats>) : null;
    return parsed ? { ...EMPTY_WHERE, ...parsed } : EMPTY_WHERE;
  } catch {
    return EMPTY_WHERE;
  }
}

export function saveWhere(stats: WhereStats): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    /* private mode: the run just won't survive a reload */
  }
}

/** Fold a finished round into the run. Pure, so the rules are testable. */
export function applyRound(stats: WhereStats, solved: boolean): WhereStats {
  const current = solved ? stats.current + 1 : 0;
  return {
    played: stats.played + 1,
    solved: stats.solved + (solved ? 1 : 0),
    current,
    best: Math.max(stats.best, current),
  };
}
