import { describe, expect, it } from "vitest";
import { puzzleFor as openRangePuzzle } from "./openrange";
import {
  MAX_SCORE,
  ROUNDS,
  bandEmoji,
  baseScore,
  priceToSlider,
  puzzleFor,
  result,
  roundPrice,
  shareText,
  sliderToPrice,
  totalScore,
} from "./pricele1000";

function days(n: number): string[] {
  return Array.from({ length: n }, (_, i) =>
    new Date(Date.UTC(2026, 9, 22 + i)).toISOString().slice(0, 10)
  );
}

describe("pricele 1000 puzzle", () => {
  it("deals five weighted rounds with the answer inside the slider, none shared with Open Range", () => {
    expect(MAX_SCORE).toBe(1000);
    for (const d of days(365)) {
      const p = puzzleFor(d);
      expect(p.rounds).toHaveLength(ROUNDS);
      expect(new Set(p.rounds.map((r) => r.price.itemId)).size).toBe(ROUNDS);
      const range = new Set(
        openRangePuzzle(d).questions.map((q) => `${q.price.itemId}:${q.price.countryCode}`)
      );
      for (const r of p.rounds) {
        expect(range.has(`${r.price.itemId}:${r.price.countryCode}`)).toBe(false);
        expect(r.price.priceUSD).toBeGreaterThan(r.min);
        expect(r.price.priceUSD).toBeLessThan(r.max);
        expect(r.median).toBeGreaterThan(r.min);
        expect(r.median).toBeLessThan(r.max);
      }
    }
  });
});

describe("pricele 1000 scoring", () => {
  it("scores closeness on a ratio scale", () => {
    expect(baseScore(5, 5)).toBe(100);
    expect(baseScore(5.5, 5)).toBe(83);
    expect(baseScore(1.75 * 5, 5)).toBe(0);
    expect(baseScore(5 / 1.75, 5)).toBe(0);
    expect(baseScore(0, 5)).toBe(0);
  });

  it("weights later rounds and totals to 1000 for perfect play", () => {
    const p = puzzleFor("2026-10-22");
    const perfect = p.rounds.map((r) => r.price.priceUSD);
    expect(totalScore(p, perfect)).toBe(1000);
    expect(result(p, { date: p.date, guesses: perfect })).toBe("1000/1000");
  });

  it("bands guesses for the share grid without leaking prices", () => {
    expect(bandEmoji(1.05, 1)).toBe("🟩");
    expect(bandEmoji(1.2, 1)).toBe("🟨");
    expect(bandEmoji(0.6, 1)).toBe("🟧");
    expect(bandEmoji(3, 1)).toBe("⬛");
    const p = puzzleFor("2026-10-22");
    const text = shareText(
      p,
      { date: p.date, guesses: p.rounds.map((r) => r.price.priceUSD) },
      "u"
    );
    expect(text).toBe(`Pricele 1000 #1 1000/1000\n🟩🟩🟩🟩🟩\nu`);
  });

  it("maps the slider on a log scale both ways", () => {
    expect(sliderToPrice(0, 1, 100)).toBeCloseTo(1);
    expect(sliderToPrice(0.5, 1, 100)).toBeCloseTo(10);
    expect(priceToSlider(10, 1, 100)).toBeCloseTo(0.5);
    expect(roundPrice(1.234)).toBe(1.23);
    expect(roundPrice(12.34)).toBe(12.3);
    expect(roundPrice(123.4)).toBe(123);
  });
});
