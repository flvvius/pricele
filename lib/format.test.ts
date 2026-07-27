import { describe, it, expect } from "vitest";
import { priceRankLine, anchorPriceUSD } from "./format";
import pricesData from "@/data/prices.json";
import { ACTIVE_ITEM } from "@/data/item";
import type { PriceEntry } from "./puzzle";

const all = (pricesData as PriceEntry[]).filter(
  (p) => p.itemId === ACTIVE_ITEM.id
);
const byCode = (code: string) => all.find((p) => p.countryCode === code)!;
const sorted = [...all].sort((a, b) => b.priceUSD - a.priceUSD);

describe("priceRankLine", () => {
  it("calls an expensive country expensive, not cheap", () => {
    // The US is the 5th priciest of 33, so 88% of countries are cheaper. The
    // line must not claim it is "cheaper than 88%".
    const line = priceRankLine(byCode("US"));
    expect(line).toContain("More expensive than");
    expect(line).not.toContain("Cheaper than");
  });

  it("calls a cheap country cheap", () => {
    // Vietnam sits near the bottom of the table.
    const line = priceRankLine(byCode("VN"));
    expect(line).toContain("Cheaper than");
    expect(line).not.toContain("More expensive than");
  });

  it("names the extremes outright", () => {
    expect(priceRankLine(sorted[0])).toContain("most expensive");
    expect(priceRankLine(sorted[sorted.length - 1])).toContain("cheapest");
  });

  it("never claims a country is both cheaper and pricier than the same share", () => {
    for (const p of all) {
      const line = priceRankLine(p);
      const cheaper = all.filter((o) => o.priceUSD < p.priceUSD).length;
      const pricier = all.filter((o) => o.priceUSD > p.priceUSD).length;
      if (cheaper > pricier) {
        // More countries are below it, so it is on the expensive side.
        expect(
          /More expensive than|priciest|most expensive/.test(line),
          `${p.countryCode} ($${p.priceUSD}) should read as expensive: "${line}"`
        ).toBe(true);
      } else if (pricier > cheaper) {
        expect(
          /Cheaper than|cheapest/.test(line),
          `${p.countryCode} ($${p.priceUSD}) should read as cheap: "${line}"`
        ).toBe(true);
      }
    }
  });
});

describe("anchorPriceUSD", () => {
  it("is the median of the active item's prices", () => {
    const values = all.map((p) => p.priceUSD).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    const expected =
      values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
    expect(anchorPriceUSD()).toBeCloseTo(expected);
  });

  it("sits inside the real price range", () => {
    const values = all.map((p) => p.priceUSD);
    expect(anchorPriceUSD()).toBeGreaterThan(Math.min(...values));
    expect(anchorPriceUSD()).toBeLessThan(Math.max(...values));
  });
});
