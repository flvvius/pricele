import { describe, expect, it } from "vitest";
import { BASKET, basketSeries, itemWorkChanges, lowest } from "./worktime";

describe("work-time index", () => {
  it("uses only items priced every year, gas included", () => {
    expect(BASKET.length).toBeGreaterThanOrEqual(10);
    expect(BASKET.some((i) => i.id === "gasoline")).toBe(true);
  });

  it("has one point a year from 1980 with a falling long-run trend", () => {
    const s = basketSeries();
    expect(s[0].year).toBe(1980);
    s.forEach((p, i) => i > 0 && expect(p.year).toBe(s[i - 1].year + 1));
    expect(s[s.length - 1].price).toBeLessThan(s[0].price);
    expect(lowest(s).price).toBeLessThanOrEqual(s[s.length - 1].price);
  });

  it("sorts items from the biggest work-time rise down", () => {
    const c = itemWorkChanges(2025);
    for (let i = 1; i < c.length; i++) expect(c[i - 1].change).toBeGreaterThanOrEqual(c[i].change);
    expect(c.find((x) => x.item.id === "ground-beef")!.fromYear).toBe(1984);
  });
});
