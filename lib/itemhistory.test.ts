import { describe, expect, it } from "vitest";
import { HISTORY_ITEMS } from "@/data/price-history";
import { HISTORY_TITLES, extremes, historyFor, historyItem, segments } from "./itemhistory";

describe("item history", () => {
  it("has a title for every item", () => {
    for (const i of HISTORY_ITEMS) expect(HISTORY_TITLES[i.id]).toBeTruthy();
  });

  it("computes the change on the year and minutes of work", () => {
    const eggs = historyFor(historyItem("eggs")!);
    expect(eggs[0].year).toBe(1980);
    expect(eggs[0].change).toBeNull();
    const y2015 = eggs.find((p) => p.year === 2015)!;
    expect(y2015.change).toBeCloseTo(2.47 / 2.02 - 1);
    expect(y2015.minutes).toBeGreaterThan(5);
  });

  it("leaves hidden years out of the extremes and breaks the line around them", () => {
    const item = historyItem("eggs")!;
    const points = historyFor(item, new Set(["eggs:2025"]));
    const e = extremes(points);
    expect(e.last.year).toBe(2024);
    expect(e.priciest.year).not.toBe(2025);
    const runs = segments(historyFor(item, new Set(["eggs:2000"])));
    expect(runs).toHaveLength(2);
    expect(runs[0].at(-1)!.year).toBe(1999);
    expect(runs[1][0].year).toBe(2001);
  });

  it("breaks the line where BLS skipped a year", () => {
    const coffee = historyFor(historyItem("coffee")!);
    const years = coffee.map((p) => p.year);
    const gaps = years.filter((y, i) => i > 0 && y !== years[i - 1] + 1).length;
    expect(segments(coffee)).toHaveLength(gaps + 1);
  });
});
