import { describe, expect, it } from "vitest";
import { pairForDate } from "./catalog";
import { dateFromISO } from "./puzzle";
import {
  MAX_WIDTH,
  MIN_SCORE,
  QUESTIONS,
  averageWidth,
  isValidRange,
  missedBy,
  puzzleFor,
  questionScore,
  result,
  shareText,
} from "./openrange";

function days(n: number): string[] {
  return Array.from({ length: n }, (_, i) =>
    new Date(Date.UTC(2026, 9, 22 + i)).toISOString().slice(0, 10)
  );
}

describe("open range puzzle", () => {
  it("is deterministic per date and numbered from the epoch", () => {
    const a = puzzleFor("2026-10-22");
    expect(a.number).toBe(1);
    expect(a.questions.map((q) => q.price.countryCode)).toEqual(
      puzzleFor("2026-10-22").questions.map((q) => q.price.countryCode)
    );
  });

  it("deals five distinct items in five distinct countries, never today's Pricele answer", () => {
    for (const d of days(365)) {
      const p = puzzleFor(d);
      expect(p.questions).toHaveLength(QUESTIONS);
      expect(new Set(p.questions.map((q) => q.price.itemId)).size).toBe(QUESTIONS);
      expect(new Set(p.questions.map((q) => q.price.countryCode)).size).toBe(QUESTIONS);
      const live = pairForDate(dateFromISO(d));
      for (const q of p.questions) {
        expect(q.price.priceUSD).toBeGreaterThan(0);
        expect(q.median).toBeGreaterThan(0);
        expect(q.price.source).not.toMatch(/seed estimate/i);
        if (live)
          expect(`${q.price.itemId}:${q.price.countryCode}`).not.toBe(
            `${live.itemId}:${live.countryCode}`
          );
      }
    }
  });
});

describe("open range scoring", () => {
  it("rewards narrow hits and scores misses at zero", () => {
    expect(questionScore({ low: 2, high: 4 }, 3)).toBe(67);
    expect(questionScore({ low: 2, high: 2.5 }, 2.2)).toBe(89);
    expect(questionScore({ low: 1, high: 10 }, 3)).toBe(MIN_SCORE);
    expect(questionScore({ low: 2, high: 4 }, 4.01)).toBe(0);
    expect(questionScore({ low: 3, high: 3 }, 3)).toBe(100);
  });

  it("rejects empty, inverted and over-wide ranges", () => {
    expect(isValidRange({ low: 0, high: 5 })).toBe(false);
    expect(isValidRange({ low: 5, high: 4 })).toBe(false);
    expect(isValidRange({ low: 1, high: MAX_WIDTH + 0.01 })).toBe(false);
    expect(isValidRange({ low: 1, high: MAX_WIDTH })).toBe(true);
  });

  it("says how far a miss was", () => {
    expect(missedBy({ low: 2, high: 4 }, 5)).toBeCloseTo(0.25);
    expect(missedBy({ low: 2, high: 4 }, 1)).toBeCloseTo(1);
    expect(missedBy({ low: 2, high: 4 }, 3)).toBe(0);
  });

  it("shares hits and width without leaking prices", () => {
    const p = puzzleFor("2026-10-22");
    const ranges = p.questions.map((q, i) =>
      i < 3
        ? { low: q.price.priceUSD / 1.5, high: q.price.priceUSD * 1.5 }
        : { low: 1000, high: 2000 }
    );
    const state = { date: p.date, ranges };
    expect(result(p, state)).toBe(`${3 * 61}/500`);
    const text = shareText(p, state, "https://x.test/g");
    expect(text).toContain("Open Range #1 183/500");
    expect(text).toContain("🎯🎯🎯❌❌");
    expect(averageWidth(ranges)).toBeCloseTo(Math.exp((3 * Math.log(2.25) + 2 * Math.log(2)) / 5));
  });
});
