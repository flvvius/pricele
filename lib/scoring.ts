// Log-scale (multiplicative) scoring. Treats "2x too high" and "half the actual"
// as equally wrong, so thresholds stay consistent whether the item costs $0.30 or $3.00.

export type Band = "green" | "yellow" | "black";
export type Direction = "too_high" | "too_low" | "exact";

export const WIN_THRESHOLD = Math.log(1.05); // within 5%
export const YELLOW_THRESHOLD = Math.log(1.3); // within 30%
export const MAX_LOG_DIFF = Math.log(5); // 5x off (or worse) counts as 0% close

export interface GuessResult {
  band: Band;
  direction: Direction;
  win: boolean;
  /** 0..1 warmth, for the proximity meter. 1 is exact, 0 is 5x off or worse. */
  closeness: number;
}

/**
 * Evaluate a numeric guess against the actual price.
 * Both values must be positive.
 */
export function evaluate(guess: number, actual: number): GuessResult {
  if (!(guess > 0) || !(actual > 0)) {
    throw new Error("evaluate() requires positive guess and actual");
  }

  const absLogDiff = Math.abs(Math.log(guess / actual));

  let direction: Direction;
  if (guess > actual) direction = "too_high";
  else if (guess < actual) direction = "too_low";
  else direction = "exact";

  let band: Band;
  if (absLogDiff <= WIN_THRESHOLD) band = "green";
  else if (absLogDiff <= YELLOW_THRESHOLD) band = "yellow";
  else band = "black";

  const closeness = Math.max(0, 1 - absLogDiff / MAX_LOG_DIFF);

  return { band, direction, win: band === "green", closeness };
}

export const BAND_EMOJI: Record<Band, string> = {
  green: "🟩",
  yellow: "🟨",
  black: "⬛",
};

// Warmth is shown as one of a few coarse tiers, never as an exact percentage.
// An exact closeness figure plus the higher/lower hint is enough to invert the
// log formula and recover the price from a single guess, which made the game
// solvable in two. Wide tiers keep the hotter/colder feel without leaking the
// answer, so players still have to narrow it down.
export interface WarmthTier {
  /** 0 (coldest) to 4 (hottest). */
  level: number;
  label: string;
}

const TIERS: { maxRatio: number; tier: WarmthTier }[] = [
  { maxRatio: 1.15, tier: { level: 4, label: "Scorching" } },
  { maxRatio: 1.4, tier: { level: 3, label: "Hot" } },
  { maxRatio: 2, tier: { level: 2, label: "Warm" } },
  { maxRatio: 3.5, tier: { level: 1, label: "Cold" } },
];
const COLDEST: WarmthTier = { level: 0, label: "Freezing" };

/** Warmth tier for a guess/actual pair, bucketed by how many times off it is. */
export function warmthTier(guess: number, actual: number): WarmthTier {
  const ratio = Math.exp(Math.abs(Math.log(guess / actual)));
  return TIERS.find((t) => ratio <= t.maxRatio)?.tier ?? COLDEST;
}

/**
 * Same tiers, derived from a stored closeness value, so games saved before
 * tiers existed still render. closeness = 1 - absLogDiff / MAX_LOG_DIFF.
 */
export function tierFromCloseness(closeness: number): WarmthTier {
  const ratio = Math.exp((1 - closeness) * MAX_LOG_DIFF);
  return TIERS.find((t) => ratio <= t.maxRatio)?.tier ?? COLDEST;
}

export const WARMTH_LEVELS = 5;

// ---------------------------------------------------------------------------
// Points
// ---------------------------------------------------------------------------

/** A perfect round. Round numbers because this is a score, not a measurement. */
export const MAX_POINTS = 1000;

/**
 * How fast points fall away. At k = 0.18 a guess 5% out still scores about 760,
 * 20% out scores 330, and 50% out scores 63.
 *
 * The shape matters more than the constant. GeoGuessr scores distance as
 * 5000·e^(−d/k) precisely so that the curve is steep where players are good and
 * flat where they are guessing: closing from 40% to 30% is worth almost nothing,
 * closing from 10% to 5% is worth a lot. That is what stops a leaderboard being
 * decided by who had the least absurd wild stab, and it is why a pass/fail at 5%
 * cannot rank the regulars against each other at all.
 */
const DECAY = 0.18;

/**
 * Points for one guess, from how many times off it was.
 *
 * Scored on the log ratio for the same reason the bands are: being out by a
 * factor of two has to mean the same thing on a $0.30 litre of petrol and an
 * $8 Big Mac. Feeding a raw percentage in would make every cheap item
 * effectively unscoreable.
 */
export function pointsFor(guess: number, actual: number): number {
  if (!(guess > 0) || !(actual > 0)) return 0;
  const absLogDiff = Math.abs(Math.log(guess / actual));
  return Math.round(MAX_POINTS * Math.exp(-absLogDiff / DECAY));
}

/**
 * The score for a finished round: the player's best guess, less a fixed toll for
 * every guess after the first.
 *
 * The toll is what makes solving in two worth more than solving in five, which
 * the raw curve does not capture: without it a player who brute-forces their way
 * in on the last guess scores the same as one who called it immediately. It is
 * subtracted rather than scaled so it cannot push a good round below a bad one.
 */
export const GUESS_TOLL = 40;

export function roundScore(
  guesses: { value: number }[],
  actual: number
): number {
  if (guesses.length === 0) return 0;
  const best = Math.max(...guesses.map((g) => pointsFor(g.value, actual)));
  return Math.max(0, best - GUESS_TOLL * (guesses.length - 1));
}
