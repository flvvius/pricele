// Log-scale (multiplicative) scoring. Treats "2x too high" and "half the actual"
// as equally wrong, so thresholds stay consistent whether the item costs $0.30 or $3.00.

export type Band = "green" | "yellow" | "black";
export type Direction = "too_high" | "too_low" | "exact";

export const WIN_THRESHOLD = Math.log(1.1); // ≈ 0.0953 → within 10%
export const YELLOW_THRESHOLD = Math.log(1.3); // ≈ 0.2624 → within 30%

export interface GuessResult {
  band: Band;
  direction: Direction;
  win: boolean;
}

/**
 * Evaluate a numeric guess against the actual price.
 * Both values must be positive (a price and a guessed price).
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

  return { band, direction, win: band === "green" };
}

export const BAND_EMOJI: Record<Band, string> = {
  green: "🟩",
  yellow: "🟨",
  black: "⬛",
};
