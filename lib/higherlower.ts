// Higher or Lower: the side mode, and the pair-picking rules that make it a game
// rather than a coin toss.
//
// This exists because of what Josh Wardle said about capping Wordle at one
// puzzle a day, that the limit was the defining reason it spread, and because
// his own unlimited 2013 prototype bored people inside twenty minutes. So the
// daily stays at one, and everything that wants to keep playing gets sent here.
// A player who leaves after five rounds of this leaves satisfied; a player who
// leaves straight after losing the daily leaves annoyed.
//
// Unlike the sister game, a ratio gate is the right gate here: prices in this
// table span four orders of magnitude, so "1.4 times more expensive" means the
// same thing on a litre of milk and a bottle of spirits, and an absolute gap
// would not. Seekdle's 1.05x to 3x window transfers directly.
//
// The pairs cross items as well as countries, which is the whole trick. "Is a
// Big Mac in Norway pricier than a cappuccino in Japan?" is a question the
// stereotype cannot answer, because both halves are expensive countries and the
// answer turns on the items.

import type { PriceEntry } from "./puzzle";

/** Below this, nobody could know, and an unknowable question feels arbitrary. */
export const MIN_RATIO = 1.05;

/** Above this, the stereotype answers it and there is no round to play. */
export const MAX_RATIO = 3;

export interface Card {
  itemId: string;
  itemName: string;
  countryName: string;
  flag: string;
  priceUSD: number;
}

export interface Pair {
  left: Card;
  right: Card;
}

export function toCard(price: PriceEntry, itemName: string): Card {
  return {
    itemId: price.itemId,
    itemName,
    countryName: price.countryName,
    flag: price.flag,
    priceUSD: price.priceUSD,
  };
}

/**
 * Every pair inside the ratio window.
 *
 * The table is 641 rows, so the full cross product is over 200,000 pairs and
 * building it eagerly on every render would be the slowest thing on the site.
 * Callers pass a pre-filtered deck, and `samplePairs` below never materialises
 * the whole set.
 */
export function ratioOf(a: Card, b: Card): number {
  const hi = Math.max(a.priceUSD, b.priceUSD);
  const lo = Math.min(a.priceUSD, b.priceUSD);
  return lo > 0 ? hi / lo : Infinity;
}

export function isPlayablePair(a: Card, b: Card): boolean {
  if (a.itemId === b.itemId && a.countryName === b.countryName) return false;
  const r = ratioOf(a, b);
  return r >= MIN_RATIO && r <= MAX_RATIO;
}

/**
 * Draw a playable pair by rejection sampling rather than by enumerating.
 *
 * A bounded number of attempts, then null. The alternative, building every legal
 * pair up front, is 200,000 objects to answer one question, and the alternative
 * to the bound is a loop that spins forever on a deck where no pair is legal.
 *
 * `random` is injected so the tests can pin it.
 */
export function drawPair(
  deck: Card[],
  avoid: Set<string> = new Set(),
  random: () => number = Math.random,
  attempts = 400
): Pair | null {
  if (deck.length < 2) return null;

  const key = (c: Card) => `${c.itemId}:${c.countryName}`;
  let fallback: Pair | null = null;

  for (let i = 0; i < attempts; i++) {
    const a = deck[Math.floor(random() * deck.length)];
    const b = deck[Math.floor(random() * deck.length)];
    if (!a || !b || a === b) continue;
    if (!isPlayablePair(a, b)) continue;

    const pair = random() < 0.5 ? { left: a, right: b } : { left: b, right: a };
    // Repeating a card the player has just been shown gives away half the next
    // question, since they were told its price a moment ago.
    if (avoid.has(key(a)) || avoid.has(key(b))) {
      fallback ??= pair;
      continue;
    }
    return pair;
  }
  // A legal pair that reuses a card beats no pair at all.
  return fallback;
}

/** True when picking `side` was correct for this pair. */
export function isCorrect(pair: Pair, side: "left" | "right"): boolean {
  const picked = side === "left" ? pair.left : pair.right;
  const other = side === "left" ? pair.right : pair.left;
  return picked.priceUSD > other.priceUSD;
}

export interface HigherLowerStats {
  current: number;
  best: number;
  played: number;
}

const KEY = "pricele:higher-lower";

export const EMPTY_HL: HigherLowerStats = { current: 0, best: 0, played: 0 };

/**
 * Kept under its own key, deliberately.
 *
 * A side mode must never be able to write to the daily streak, directly or by
 * sharing a record with it. The daily is the appointment; this is the thing you
 * do after it, and if a bad run here could dent the number the player actually
 * cares about, the mode would be a liability rather than a bonus.
 */
export function loadHL(): HigherLowerStats {
  if (typeof window === "undefined" || !window.localStorage) return EMPTY_HL;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<HigherLowerStats>) : null;
    return parsed ? { ...EMPTY_HL, ...parsed } : EMPTY_HL;
  } catch {
    return EMPTY_HL;
  }
}

export function saveHL(stats: HigherLowerStats): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    /* private mode: the run just won't survive a reload */
  }
}

/** Fold one answer into the run. Pure, so the streak rules are testable. */
export function applyAnswer(
  stats: HigherLowerStats,
  correct: boolean
): HigherLowerStats {
  const current = correct ? stats.current + 1 : 0;
  return {
    current,
    best: Math.max(stats.best, current),
    played: stats.played + 1,
  };
}
