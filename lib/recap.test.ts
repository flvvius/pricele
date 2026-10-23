import { describe, expect, it } from "vitest";
import {
  highlights,
  isPublishedRecapWeek,
  publishedRecapWeeks,
  recapFor,
  weekDays,
  weekEnd,
  weekStart,
} from "./recap";

describe("weekStart", () => {
  it("snaps any day to its Monday", () => {
    expect(weekStart("2026-10-19")).toBe("2026-10-19");
    expect(weekStart("2026-10-22")).toBe("2026-10-19");
    expect(weekStart("2026-10-25")).toBe("2026-10-19");
    expect(weekStart("2026-10-26")).toBe("2026-10-26");
  });

  it("ends the week on Sunday", () => {
    expect(weekEnd("2026-10-19")).toBe("2026-10-25");
  });
});

describe("weekDays", () => {
  it("drops days before the games launched", () => {
    expect(weekDays("2026-10-19")).toEqual(["2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25"]);
    expect(weekDays("2026-10-26")).toHaveLength(7);
  });
});

describe("publishedRecapWeeks", () => {
  it("waits until the whole week clears the answer holdback", () => {
    expect(publishedRecapWeeks("2026-10-26")).toEqual([]);
    expect(publishedRecapWeeks("2026-10-27")).toEqual(["2026-10-19"]);
    expect(publishedRecapWeeks("2026-11-03")).toEqual(["2026-10-26", "2026-10-19"]);
  });

  it("matches isPublishedRecapWeek", () => {
    expect(isPublishedRecapWeek("2026-10-19", "2026-10-27")).toBe(true);
    expect(isPublishedRecapWeek("2026-10-26", "2026-10-27")).toBe(false);
    expect(isPublishedRecapWeek("2026-10-20", "2026-11-03")).toBe(false);
    expect(isPublishedRecapWeek("nope", "2026-11-03")).toBe(false);
  });
});

describe("recapFor", () => {
  const recap = recapFor("2026-10-26");

  it("has one entry per day with every hub game answered", () => {
    expect(recap.days.map((d) => d.date)).toEqual(weekDays("2026-10-26"));
    for (const d of recap.days) expect(d.answers).toHaveLength(8);
  });

  it("writes a highlight for each game family", () => {
    expect(recap.highlights).toHaveLength(6);
    for (const h of recap.highlights) expect(h).toMatch(/\.\)?$/);
  });
});

describe("highlights", () => {
  it("names one country when the week is a single day", () => {
    expect(highlights(["2026-10-22"]).join(" ")).toMatch(/name one country:/);
  });
});
