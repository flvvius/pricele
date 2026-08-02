import { describe, it, expect } from "vitest";
import { priceRankLine, anchorPriceUSD, formatArchiveDate } from "./format";
import { PRICES, type PriceEntry } from "./puzzle";
import { ITEMS } from "@/data/items";

const rowsFor = (itemId: string) => PRICES.filter((p) => p.itemId === itemId);

describe("priceRankLine", () => {
  const item = "big-mac";
  const all = rowsFor(item);
  const byCode = (code: string) => all.find((p) => p.countryCode === code)!;
  const sorted = [...all].sort((a, b) => b.priceUSD - a.priceUSD);

  it("calls an expensive country expensive, not cheap", () => {
    // Switzerland has the dearest Big Mac in the Economist's index.
    const line = priceRankLine(byCode("CH"));
    expect(line).toMatch(/most expensive|priciest/);
    expect(line).not.toContain("Cheaper than");
  });

  it("calls a cheap country cheap", () => {
    // India sits at the bottom of the Big Mac table.
    const line = priceRankLine(byCode("IN"));
    expect(line).toMatch(/Cheaper than|cheapest/);
    expect(line).not.toContain("More expensive than");
  });

  it("names the extremes outright", () => {
    expect(priceRankLine(sorted[0])).toContain("most expensive");
    expect(priceRankLine(sorted[sorted.length - 1])).toContain("cheapest");
  });

  it("names the item, not a hardcoded product", () => {
    const milk = rowsFor("milk-1l");
    const dearest = [...milk].sort((a, b) => b.priceUSD - a.priceUSD)[0];
    expect(priceRankLine(dearest)).toContain("milk");
  });

  it("never claims a country is both cheaper and pricier, for every item", () => {
    for (const item of ITEMS) {
      const rows = rowsFor(item.id);
      for (const p of rows) {
        const line = priceRankLine(p);
        const cheaper = rows.filter((o) => o.priceUSD < p.priceUSD).length;
        const pricier = rows.filter((o) => o.priceUSD > p.priceUSD).length;
        if (cheaper > pricier) {
          expect(
            /More expensive than|priciest|most expensive/.test(line),
            `${item.id}/${p.countryCode} ($${p.priceUSD}) should read as expensive: "${line}"`
          ).toBe(true);
        } else if (pricier > cheaper) {
          expect(
            /Cheaper than|cheapest/.test(line),
            `${item.id}/${p.countryCode} ($${p.priceUSD}) should read as cheap: "${line}"`
          ).toBe(true);
        }
      }
    }
  });

  it("only ever compares an item against its own kind", () => {
    // A Big Mac is dearer than every litre of milk in the table. If the ranking
    // leaked across items, the cheapest Big Mac would be called expensive.
    const cheapestBigMac = [...rowsFor("big-mac")].sort(
      (a, b) => a.priceUSD - b.priceUSD
    )[0];
    expect(priceRankLine(cheapestBigMac)).toContain("cheapest");
  });
});

describe("anchorPriceUSD", () => {
  it("is the median of that item's prices", () => {
    for (const item of ITEMS) {
      const values = rowsFor(item.id)
        .map((p) => p.priceUSD)
        .sort((a, b) => a - b);
      const mid = Math.floor(values.length / 2);
      const expected =
        values.length % 2 === 0
          ? (values[mid - 1] + values[mid]) / 2
          : values[mid];
      expect(anchorPriceUSD(item.id), item.id).toBeCloseTo(expected);
    }
  });

  it("sits inside each item's real price range", () => {
    for (const item of ITEMS) {
      const values = rowsFor(item.id).map((p) => p.priceUSD);
      expect(anchorPriceUSD(item.id)).toBeGreaterThan(Math.min(...values));
      expect(anchorPriceUSD(item.id)).toBeLessThan(Math.max(...values));
    }
  });

  it("differs between items", () => {
    // A single shared anchor across all items would make the hint useless.
    expect(anchorPriceUSD("big-mac")).not.toBeCloseTo(anchorPriceUSD("milk-1l"));
  });
});

describe("formatArchiveDate", () => {
  it("spells the date out without relying on the host locale", () => {
    expect(formatArchiveDate("2026-07-24")).toBe("24 July 2026");
    expect(formatArchiveDate("2026-01-01")).toBe("1 January 2026");
    expect(formatArchiveDate("2026-12-31")).toBe("31 December 2026");
  });
});

describe("price data integrity", () => {
  const rows = PRICES as PriceEntry[];

  it("has no duplicate item/country pairs", () => {
    const seen = new Set<string>();
    for (const p of rows) {
      const key = `${p.itemId}:${p.countryCode}`;
      expect(seen.has(key), `duplicate row for ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it("only references items that exist in the catalog", () => {
    const ids = new Set(ITEMS.map((i) => i.id));
    for (const p of rows) {
      expect(ids.has(p.itemId), `unknown itemId ${p.itemId}`).toBe(true);
    }
  });

  it("has positive, plausible prices and a source on every row", () => {
    for (const p of rows) {
      expect(p.priceUSD, `${p.itemId}/${p.countryCode}`).toBeGreaterThan(0);
      expect(p.priceUSD, `${p.itemId}/${p.countryCode}`).toBeLessThan(50);
      expect(p.priceLocal).toBeGreaterThan(0);
      expect(p.avgHourlyWageUSD).toBeGreaterThan(0);
      expect(p.source.length).toBeGreaterThan(3);
      expect(p.sourceDate).toMatch(/^\d{4}-\d{2}$/);
      expect(p.localCurrency).toMatch(/^[A-Z]{3}$/);
    }
  });

  it("describes each country consistently across every item", () => {
    const byCode = new Map<string, PriceEntry>();
    for (const p of rows) {
      const prev = byCode.get(p.countryCode);
      if (prev) {
        expect(p.countryName).toBe(prev.countryName);
        expect(p.localCurrency).toBe(prev.localCurrency);
        expect(p.flag).toBe(prev.flag);
      } else {
        byCode.set(p.countryCode, p);
      }
    }
  });
});
