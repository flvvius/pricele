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
