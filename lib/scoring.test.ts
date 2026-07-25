import { describe, it, expect } from "vitest";
import { evaluate, warmthTier, tierFromCloseness } from "./scoring";

describe("evaluate: worked examples (actual = $0.50)", () => {
  const actual = 0.5;

  it("$0.52 → green (win, within 5%)", () => {
    const r = evaluate(0.52, actual);
    expect(r.band).toBe("green");
    expect(r.win).toBe(true);
    expect(r.direction).toBe("too_high");
  });

  it("$0.55 (10% over) → yellow, just outside the 5% win", () => {
    const r = evaluate(0.55, actual);
    expect(r.band).toBe("yellow");
    expect(r.win).toBe(false);
    expect(r.direction).toBe("too_high");
  });

  it("$0.65 → yellow", () => {
    const r = evaluate(0.65, actual);
    expect(r.band).toBe("yellow");
    expect(r.win).toBe(false);
    expect(r.direction).toBe("too_high");
  });

  it("$1.00 (2x over) → black", () => {
    const r = evaluate(1.0, actual);
    expect(r.band).toBe("black");
    expect(r.direction).toBe("too_high");
  });

  it("$0.25 (2x under) → black, symmetric with the 2x-over case", () => {
    const r = evaluate(0.25, actual);
    expect(r.band).toBe("black");
    expect(r.direction).toBe("too_low");
  });
});

describe("evaluate: log-error symmetry", () => {
  it("guessing 2x and guessing half give the same band", () => {
    const actual = 3.0;
    expect(evaluate(6.0, actual).band).toBe(evaluate(1.5, actual).band);
  });

  it("thresholds are consistent across price magnitudes", () => {
    // +4% is always green regardless of the underlying price (within 5%)
    expect(evaluate(0.312, 0.3).band).toBe("green");
    expect(evaluate(3.12, 3.0).band).toBe("green");
    expect(evaluate(3120, 3000).band).toBe("green");
  });

  it("an exact guess is green with direction 'exact'", () => {
    const r = evaluate(2.0, 2.0);
    expect(r.band).toBe("green");
    expect(r.win).toBe(true);
    expect(r.direction).toBe("exact");
  });
});

describe("evaluate: closeness (warmth)", () => {
  it("is 1 for an exact guess and decreases as the guess drifts", () => {
    expect(evaluate(0.5, 0.5).closeness).toBeCloseTo(1);
    const near = evaluate(0.55, 0.5).closeness;
    const far = evaluate(1.0, 0.5).closeness;
    expect(near).toBeGreaterThan(far);
  });

  it("floors at 0 for guesses 5x off or worse", () => {
    expect(evaluate(2.5, 0.5).closeness).toBeCloseTo(0);
    expect(evaluate(10, 0.5).closeness).toBe(0);
  });
});

describe("warmth tiers", () => {
  const actual = 1.0;

  it("buckets by how many times off the guess is", () => {
    expect(warmthTier(1.1, actual).label).toBe("Scorching");
    expect(warmthTier(1.3, actual).label).toBe("Hot");
    expect(warmthTier(1.8, actual).label).toBe("Warm");
    expect(warmthTier(3.0, actual).label).toBe("Cold");
    expect(warmthTier(10, actual).label).toBe("Freezing");
  });

  it("is symmetric for over- and under-guesses", () => {
    expect(warmthTier(2, actual).label).toBe(warmthTier(0.5, actual).label);
    expect(warmthTier(3, actual).label).toBe(warmthTier(1 / 3, actual).label);
  });

  it("levels increase with warmth", () => {
    expect(warmthTier(1.1, actual).level).toBeGreaterThan(
      warmthTier(1.8, actual).level
    );
    expect(warmthTier(10, actual).level).toBe(0);
  });

  it("tierFromCloseness matches warmthTier for the same pair", () => {
    for (const guess of [1.02, 1.2, 1.5, 2.5, 4, 12]) {
      const c = evaluate(guess, actual).closeness;
      expect(tierFromCloseness(c).label).toBe(warmthTier(guess, actual).label);
    }
  });

  it("hides the exact distance: a whole range of guesses shares one tier", () => {
    // If the tier leaked the price, these would differ.
    const labels = [1.45, 1.6, 1.75, 1.95].map((g) => warmthTier(g, actual).label);
    expect(new Set(labels).size).toBe(1);
  });
});

describe("evaluate: guard rails", () => {
  it("rejects non-positive input", () => {
    expect(() => evaluate(0, 1)).toThrow();
    expect(() => evaluate(1, 0)).toThrow();
    expect(() => evaluate(-1, 1)).toThrow();
  });
});
