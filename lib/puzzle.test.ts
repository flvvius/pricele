import { describe, it, expect } from "vitest";
import { isoDate, daysSince, getDailyPuzzle, puzzleNumber } from "./puzzle";

describe("date logic (local time)", () => {
  it("isoDate formats a local date as YYYY-MM-DD", () => {
    expect(isoDate(new Date(2026, 6, 5))).toBe("2026-07-05");
    expect(isoDate(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("daysSince counts whole calendar days from the start date", () => {
    expect(daysSince("2026-07-01", new Date(2026, 6, 1))).toBe(0);
    expect(daysSince("2026-07-01", new Date(2026, 6, 11))).toBe(10);
    // Spans a DST boundary in many timezones; still an exact day count.
    expect(daysSince("2026-03-01", new Date(2026, 2, 31))).toBe(30);
  });
});

describe("daily puzzle rotation", () => {
  it("is deterministic and cycles through the rotation", () => {
    const day0 = getDailyPuzzle(new Date(2026, 6, 1));
    const day10 = getDailyPuzzle(new Date(2026, 6, 11));
    expect(day0?.price.countryCode).toBe("US");
    expect(day0?.puzzleNumber).toBe(1);
    expect(day10?.price.countryCode).toBe("GB");
    expect(day10?.puzzleNumber).toBe(11);
  });

  it("wraps around after the last country", () => {
    const first = getDailyPuzzle(new Date(2026, 6, 1))?.price.countryCode;
    const wrapped = getDailyPuzzle(new Date(2026, 7, 3))?.price.countryCode; // 33 days later
    expect(wrapped).toBe(first);
  });

  it("puzzleNumber increments by one each day", () => {
    expect(puzzleNumber(new Date(2026, 6, 1))).toBe(1);
    expect(puzzleNumber(new Date(2026, 6, 2))).toBe(2);
  });
});
