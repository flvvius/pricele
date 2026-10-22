import { describe, expect, it } from "vitest";
import { answersFor, isPublishedAnswerDate, publishedAnswerDates } from "./answers";

describe("publishedAnswerDates", () => {
  it("holds back the last two days", () => {
    expect(publishedAnswerDates("2026-10-23")).toEqual([]);
    expect(publishedAnswerDates("2026-10-24")).toEqual(["2026-10-22"]);
    expect(publishedAnswerDates("2026-10-26")).toEqual(["2026-10-24", "2026-10-23", "2026-10-22"]);
  });

  it("matches isPublishedAnswerDate", () => {
    expect(isPublishedAnswerDate("2026-10-22", "2026-10-24")).toBe(true);
    expect(isPublishedAnswerDate("2026-10-23", "2026-10-24")).toBe(false);
    expect(isPublishedAnswerDate("2026-10-21", "2026-10-24")).toBe(false);
    expect(isPublishedAnswerDate("not-a-date", "2026-10-24")).toBe(false);
  });
});

describe("answersFor", () => {
  const all = answersFor("2026-10-22");

  it("covers all eight hub games with lines", () => {
    expect(all.map((a) => a.slug)).toEqual([
      "price-atlas",
      "higher-or-lower",
      "price-year",
      "then-and-now",
      "open-range",
      "rent-ratio",
      "inflation-ladder",
      "pricele-1000",
    ]);
    for (const a of all) {
      expect(a.number).toBe(1);
      expect(a.lines.length).toBeGreaterThan(0);
      expect(a.lines.join(" ")).not.toMatch(/undefined|NaN/);
      expect(a.summary).not.toMatch(/undefined|NaN/);
    }
  });

  it("lists ladder rungs from biggest rise down", () => {
    const ladder = all.find((a) => a.slug === "inflation-ladder")!;
    const rises = ladder.lines.map((l) => Number(l.match(/([+-]\d+)%$/)![1]));
    expect([...rises].sort((a, b) => b - a)).toEqual(rises);
  });
});
