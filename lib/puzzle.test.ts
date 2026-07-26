import { describe, it, expect } from "vitest";
import {
  isoDate,
  daysSince,
  getDailyPuzzle,
  puzzleNumber,
  addDaysISO,
  pastPuzzleDates,
  dateFromISO,
} from "./puzzle";

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

describe("archive date helpers", () => {
  it("addDaysISO adds days, crossing month boundaries", () => {
    expect(addDaysISO("2026-07-24", 5)).toBe("2026-07-29");
    expect(addDaysISO("2026-07-30", 3)).toBe("2026-08-02");
    expect(addDaysISO("2026-07-24", 0)).toBe("2026-07-24");
  });

  it("pastPuzzleDates lists prior days, newest first, excluding today", () => {
    // 5 days after the rotation start (2026-07-24).
    const dates = pastPuzzleDates(dateFromISO("2026-07-29"));
    expect(dates).toEqual([
      "2026-07-28",
      "2026-07-27",
      "2026-07-26",
      "2026-07-25",
      "2026-07-24",
    ]);
  });

  it("has no archive on the rotation start date", () => {
    expect(pastPuzzleDates(dateFromISO("2026-07-24"))).toEqual([]);
  });

  it("archived dates resolve to their own country", () => {
    // 2026-07-25 is day 1 -> index 1 -> US.
    expect(getDailyPuzzle(dateFromISO("2026-07-25"))?.price.countryCode).toBe("US");
  });
});
