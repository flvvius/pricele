import { describe, expect, it } from "vitest";
import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import { puzzleFor as thenNowPuzzle } from "./thenandnow";
import {
  FIRST_YEAR,
  LATEST_YEAR,
  YEARS,
  basketMinutes,
  biggestRise,
  bornCardText,
  isYear,
  liveThenNowPairs,
  mostTimeSaved,
  visibleRows,
  yearSummary,
} from "./yearprices";

describe("prices by year", () => {
  it("covers every year from 1980 to the latest", () => {
    expect(FIRST_YEAR).toBe(1980);
    expect(LATEST_YEAR).toBeGreaterThanOrEqual(2025);
    expect(YEARS).toHaveLength(LATEST_YEAR - FIRST_YEAR + 1);
    expect(isYear("1985")).toBe(true);
    expect(isYear("1979")).toBe(false);
    expect(isYear("19855")).toBe(false);
    expect(isYear("abcd")).toBe(false);
  });

  it("has rows, a wage and a basket for every year", () => {
    for (const y of YEARS) {
      const s = yearSummary(y);
      expect(s.rows.length).toBeGreaterThanOrEqual(12);
      expect(s.wageThen).toBeGreaterThan(0);
      const b = basketMinutes(s.rows);
      expect(b.then).toBeGreaterThan(0);
      expect(b.now).toBeGreaterThan(0);
      expect(biggestRise(s)).toBeDefined();
      expect(mostTimeSaved(s)).toBeDefined();
    }
  });

  it("works out minutes of work from price and wage", () => {
    const eggs = yearSummary(2019).rows.find((r) => r.item.id === "eggs")!;
    expect(eggs.minutesThen).toBeGreaterThan(3);
    expect(eggs.minutesThen).toBeLessThan(4.5);
  });

  it("hides the live Then & Now answers for yesterday, today and tomorrow", () => {
    const now = new Date(Date.UTC(2026, 10, 3, 12));
    const hidden = liveThenNowPairs(now);
    const today = thenNowPuzzle("2026-11-03", THEN_NOW_ITEMS);
    expect(hidden.has(`${today.item.id}:${today.year}`)).toBe(true);
    const s = yearSummary(today.year, hidden);
    const row = s.rows.find((r) => r.item.id === today.item.id)!;
    expect(row.hidden).toBe(true);
    expect(visibleRows(s).some((r) => r.item.id === today.item.id)).toBe(false);
    expect(bornCardText(s, "https://x.test")).not.toContain(`$${row.then.toFixed(2)} then`);
  });

  it("writes a share card with the year and the link", () => {
    const text = bornCardText(yearSummary(1990), "https://x.test/years/1990");
    expect(text).toContain("Born in 1990?");
    expect(text).toContain("minutes of work");
    expect(text.endsWith("https://x.test/years/1990")).toBe(true);
  });
});
