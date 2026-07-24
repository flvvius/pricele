import { describe, it, expect } from "vitest";
import { evaluate } from "./scoring";

describe("evaluate — spec §3 worked examples (actual = $0.50)", () => {
  const actual = 0.5;

  it("$0.55 → green (win)", () => {
    const r = evaluate(0.55, actual);
    expect(r.band).toBe("green");
    expect(r.win).toBe(true);
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

describe("evaluate — log-error symmetry", () => {
  it("guessing 2x and guessing half give the same band", () => {
    const actual = 3.0;
    expect(evaluate(6.0, actual).band).toBe(evaluate(1.5, actual).band);
  });

  it("thresholds are consistent across price magnitudes", () => {
    // +10% is always green regardless of the underlying price
    expect(evaluate(0.33, 0.3).band).toBe("green");
    expect(evaluate(3.3, 3.0).band).toBe("green");
    expect(evaluate(3300, 3000).band).toBe("green");
  });

  it("an exact guess is green with direction 'exact'", () => {
    const r = evaluate(2.0, 2.0);
    expect(r.band).toBe("green");
    expect(r.win).toBe(true);
    expect(r.direction).toBe("exact");
  });
});

describe("evaluate — guard rails", () => {
  it("rejects non-positive input", () => {
    expect(() => evaluate(0, 1)).toThrow();
    expect(() => evaluate(1, 0)).toThrow();
    expect(() => evaluate(-1, 1)).toThrow();
  });
});
