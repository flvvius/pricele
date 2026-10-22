import { describe, expect, it } from "vitest";
import { HISTORY_ITEMS, HOURLY_WAGE } from "@/data/price-history";
import {
  ROUNDS,
  basketMinutes,
  buckets,
  fullCoverage,
  isOver,
  missEmoji,
  puzzleFor,
  result,
  roundScore,
  separation,
  shareText,
  totalScore,
} from "./priceyear";

function days(n: number): string[] {
  return Array.from({ length: n }, (_, i) =>
    new Date(Date.UTC(2026, 9, 22 + i)).toISOString().slice(0, 10)
  );
}

describe("price year puzzle", () => {
  it("is deterministic per date and numbered from the epoch", () => {
    const a = puzzleFor("2026-10-22", HISTORY_ITEMS);
    const b = puzzleFor("2026-10-22", HISTORY_ITEMS);
    expect(a.number).toBe(1);
    expect(a.receipts.map((r) => r.year)).toEqual(b.receipts.map((r) => r.year));
  });

  it("covers 1980 to the latest year with items that have every year", () => {
    const pool = fullCoverage(HISTORY_ITEMS);
    expect(pool.length).toBeGreaterThanOrEqual(10);
    const p = puzzleFor("2026-10-22", HISTORY_ITEMS);
    expect(p.firstYear).toBe(1980);
    expect(p.latestYear).toBeGreaterThanOrEqual(2025);
  });

  it("deals one year per era and three distinct, separable items for a year of days", () => {
    for (const d of days(365)) {
      const p = puzzleFor(d, HISTORY_ITEMS);
      expect(p.receipts).toHaveLength(ROUNDS);
      const eras = buckets(p.firstYear, p.latestYear);
      const sorted = p.receipts.map((r) => r.year).sort((a, b) => a - b);
      sorted.forEach((y, i) => {
        expect(y).toBeGreaterThanOrEqual(eras[i][0]);
        expect(y).toBeLessThanOrEqual(eras[i][1]);
      });
      for (const r of p.receipts) {
        expect(new Set(r.items.map((i) => i.id)).size).toBe(3);
        expect(separation(r.items, r.year, p.firstYear, p.latestYear)).toBeGreaterThan(0.08);
      }
    }
  });

  it("varies from day to day", () => {
    const sets = new Set(
      days(30).map((d) =>
        puzzleFor(d, HISTORY_ITEMS)
          .receipts.map((r) => r.year)
          .join()
      )
    );
    expect(sets.size).toBe(30);
  });
});

describe("price year scoring", () => {
  it("scores 200 for exact, 175 one off, 0 from eight off", () => {
    expect(roundScore(1999, 1999)).toBe(200);
    expect(roundScore(2000, 1999)).toBe(175);
    expect(roundScore(1995, 1999)).toBe(100);
    expect(roundScore(1991, 1999)).toBe(0);
    expect(roundScore(1980, 2025)).toBe(0);
  });

  it("bands misses into share squares", () => {
    expect([0, 1, 2, 3, 4, 7, 8].map(missEmoji).join("")).toBe("🟩🟩🟨🟨🟧🟧⬛");
  });

  it("totals out of 1000 and shares without leaking years", () => {
    const p = puzzleFor("2026-10-22", HISTORY_ITEMS);
    const perfect = { date: p.date, guesses: p.receipts.map((r) => r.year) };
    expect(isOver(perfect)).toBe(true);
    expect(totalScore(p, perfect.guesses)).toBe(1000);
    expect(result(p, perfect)).toBe("1000/1000");
    const text = shareText(p, perfect, "https://x.test/g");
    expect(text).toContain("Price Year #1 1000/1000");
    expect(text).toContain("🟩🟩🟩🟩🟩");
    for (const r of p.receipts) expect(text).not.toContain(String(r.year));
  });

  it("works out minutes of work from the wage series", () => {
    const eggs = HISTORY_ITEMS.find((i) => i.id === "eggs")!;
    const m = basketMinutes([eggs], 2019, HOURLY_WAGE)!;
    expect(m).toBeGreaterThan(3);
    expect(m).toBeLessThan(4.5);
    expect(basketMinutes([eggs], 1970, HOURLY_WAGE)).toBeNull();
  });
});
