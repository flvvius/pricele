import { describe, it, expect } from "vitest";
import {
  priceRankLine,
  anchorPriceUSD,
  formatArchiveDate,
  headlineSize,
} from "./format";
import { PRICES, type PriceEntry } from "./puzzle";
import { ITEMS } from "@/data/items";
import {
  COUNTRY_META,
  COUNTRY_NOTES,
  COUNTRY_TAX,
} from "@/data/countries";

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
      // A ceiling to catch an order-of-magnitude typo, not a real bound. The
      // dearest row in the game is a 750ml bottle of spirits in New Zealand.
      expect(p.priceUSD, `${p.itemId}/${p.countryCode}`).toBeLessThan(100);
      // Optional: a source that publishes dollars and nothing else leaves it
      // out rather than having the row invent one. When it is there it is a
      // real figure, so it still has to be positive.
      if (p.priceLocal !== undefined) {
        expect(p.priceLocal, `${p.itemId}/${p.countryCode}`).toBeGreaterThan(0);
      }
      expect(p.avgHourlyWageUSD).toBeGreaterThan(0);
      expect(p.source.length).toBeGreaterThan(3);
      // "2026-08" for a monthly edition, "2024" for an annual survey round.
      expect(p.sourceDate, `${p.itemId}/${p.countryCode}`).toMatch(
        /^\d{4}(-\d{2})?$/
      );
      expect(p.localCurrency).toMatch(/^[A-Z]{3}$/);
    }
  });

  it("keeps a local-currency figure for every row whose source publishes one", () => {
    // Only Cable.co.uk's mobile data survey is dollars-only. If a second item
    // ever loses its local figures wholesale, that is a parsing bug upstream in
    // refresh-open-prices, not a fact about the world.
    const dollarsOnly = new Set(
      rows.filter((p) => p.priceLocal === undefined).map((p) => p.itemId)
    );
    expect([...dollarsOnly]).toEqual(["mobile-data-1gb"]);
  });

  it("describes every country exactly as the roster does", () => {
    // data/prices.json repeats the country facts on every row because that file
    // is what the client reads. COUNTRY_META is where they are edited. If the
    // two drift, a country is renamed on some pages and not others.
    for (const p of rows) {
      const meta = COUNTRY_META[p.countryCode];
      expect(meta, `${p.countryCode} is not in COUNTRY_META`).toBeDefined();
      expect(p.countryName, p.countryCode).toBe(meta.name);
      expect(p.flag, p.countryCode).toBe(meta.flag);
      expect(p.localCurrency, p.countryCode).toBe(meta.localCurrency);
      expect(p.avgHourlyWageUSD, p.countryCode).toBe(meta.avgHourlyWageUSD);
    }
  });

  it("gives every country in the roster a note and a tax entry", () => {
    // Both are optional at the type level so a page still renders without them,
    // but a country page with neither is 80% boilerplate, which is what got two
    // of them left out of Google's index. See the header of data/countries.ts.
    for (const code of Object.keys(COUNTRY_META)) {
      expect(COUNTRY_NOTES[code], `${code} has no editorial note`).toBeTruthy();
      expect(COUNTRY_TAX[code], `${code} has no tax entry`).toBeTruthy();
    }
  });

  it("has price rows for every country in the roster, and no others", () => {
    const priced = new Set(rows.map((p) => p.countryCode));
    expect([...priced].sort()).toEqual(Object.keys(COUNTRY_META).sort());
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

describe("headlineSize", () => {
  // Rough advance width of the display serif, as a multiple of the font size.
  // Measured off the rendered headline rather than guessed: a mixed-case
  // string in this face averages a little over half its em. Deliberately
  // pessimistic, so a headline the model says fits really does.
  const EM_PER_CHAR = 0.56;

  // The tightest column the band ever has: a 320px viewport, less the page's
  // px-4 gutters, the 44px thumbnail and the 14px gap beside it.
  const COLUMN_PX = 320 - 32 - 44 - 14;

  /** The px size the smallest step of a returned class pair resolves to. */
  function smallestRem(classes: string): number {
    const sizes = [...classes.matchAll(/text-\[([\d.]+)rem\]/g)].map((m) =>
      Number(m[1])
    );
    return Math.min(...sizes) * 16;
  }

  function linesNeeded(headline: string): number {
    const px = smallestRem(headlineSize(headline));
    // The flag rides along on the end of the country, so it is part of what
    // has to fit; it sets at 0.75em and is about two characters wide.
    const width = (headline.length + 1.5) * px * EM_PER_CHAR;
    return Math.ceil(width / COLUMN_PX);
  }

  it("leaves a short headline at the size the band has always used", () => {
    // The phone step is the assertion; the `lg:` step appended after it only
    // applies once the game is no longer height-locked, and `smallestRem` above
    // is what the rest of this suite reads.
    expect(headlineSize("Milk (1 litre) in Peru")).not.toMatch(/^text-\[1\.5rem\]/);
    expect(headlineSize("Bread in Peru")).toMatch(/^text-\[1\.5rem\]/);
  });

  it("steps down monotonically as the headline grows", () => {
    let previous = Infinity;
    for (let n = 1; n <= 60; n++) {
      const px = smallestRem(headlineSize("x".repeat(n)));
      expect(px).toBeLessThanOrEqual(previous);
      previous = px;
    }
  });

  it("keeps every headline the game can actually deal to two lines", () => {
    // The regression this exists for: "Coca-Cola (330ml can) in United Arab
    // Emirates" used to be cut to "...in United Ara...", losing the country.
    // Every item can be dealt against every country, so the guard is the full
    // cross product rather than the pairs that happen to be scheduled.
    const countries = [...new Set(PRICES.map((p) => p.countryName))];
    const worst: string[] = [];
    for (const item of ITEMS) {
      for (const country of countries) {
        const headline = `${item.name} in ${country}`;
        if (linesNeeded(headline) > 2) worst.push(headline);
      }
    }
    expect(worst).toEqual([]);
  });

  it("survives the empty headline of the pre-hydration state", () => {
    expect(headlineSize("")).toMatch(/^text-\[1\.5rem\]/);
  });
});
