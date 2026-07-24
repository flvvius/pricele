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
  it("starts on India on the rotation start date (2026-07-24)", () => {
    const day0 = getDailyPuzzle(new Date(2026, 6, 24));
    expect(day0?.price.countryCode).toBe("IN");
    expect(day0?.puzzleNumber).toBe(24); // epoch is 2026-07-01
  });

  it("advances one country per day", () => {
    expect(getDailyPuzzle(new Date(2026, 6, 25))?.price.countryCode).toBe("US");
    expect(getDailyPuzzle(new Date(2026, 6, 26))?.price.countryCode).toBe("TH");
  });

  it("wraps back to India after a full cycle", () => {
    // 33 days after the start date.
    const wrapped = getDailyPuzzle(new Date(2026, 6, 24 + 33));
    expect(wrapped?.price.countryCode).toBe("IN");
  });

  it("puzzleNumber increments by one each day", () => {
    expect(puzzleNumber(new Date(2026, 6, 24))).toBe(24);
    expect(puzzleNumber(new Date(2026, 6, 25))).toBe(25);
  });
});
