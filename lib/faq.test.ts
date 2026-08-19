import { describe, it, expect } from "vitest";
import {
  countryPriceFaq,
  itemPriceFaq,
  itemWithUnit,
  newestSourceDate,
} from "./faq";
import { COUNTRIES, pricesForCountry, pricesForItem } from "./catalog";
import { ITEMS } from "@/data/items";
import { formatUSD } from "./format";

const norway = COUNTRIES.find((c) => c.code === "NO") ?? COUNTRIES[0];
const bigMac = ITEMS.find((i) => i.id === "big-mac") ?? ITEMS[0];

describe("newestSourceDate", () => {
  const rows = (...dates: string[]) =>
    dates.map((sourceDate) => ({ sourceDate })) as Parameters<
      typeof newestSourceDate
    >[0];

  it("takes the newest date among the rows", () => {
    expect(newestSourceDate(rows("2025-01", "2026-07", "2024-06"))).toBe(
      "2026-07-01",
    );
  });

  it("sorts mixed precisions chronologically", () => {
    // String comparison has to agree with chronology here, since the data
    // stores "2025" alongside "2025-12".
    expect(newestSourceDate(rows("2025", "2025-12", "2024-06"))).toBe(
      "2025-12-01",
    );
    expect(newestSourceDate(rows("2025-12", "2026"))).toBe("2026-01-01");
  });

  it("widens a partial date to a full one, understating rather than inventing", () => {
    // Schema wants a complete date and the sources publish months and years.
    // Widening to the first day of the period can only make the data look
    // older than it is, which is the safe direction to be wrong in.
    expect(newestSourceDate(rows("2026-08"))).toBe("2026-08-01");
    expect(newestSourceDate(rows("2026"))).toBe("2026-01-01");
  });

  it("emits a date schema will accept, never a bare year or month", () => {
    for (const d of ["2023", "2025-12", "2026-08"]) {
      expect(newestSourceDate(rows(d))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("returns undefined rather than a guess when nothing carries a date", () => {
    // The caller spreads this into JSON-LD conditionally, so undefined means
    // the page asserts no freshness at all — which is the honest answer.
    expect(newestSourceDate([])).toBeUndefined();
  });
});

describe("countryPriceFaq", () => {
  it("asks the question in the words it gets asked in", () => {
    const questions = countryPriceFaq(
      norway,
      pricesForCountry(norway.code),
    ).map((f) => f.question);
    expect(questions).toContain(
      `How much do everyday things cost in ${norway.name}?`,
    );
    expect(questions).toContain(`What currency is used in ${norway.name}?`);
  });

  it("answers self-contained, since an extracted answer arrives with no page", () => {
    const [first] = countryPriceFaq(norway, pricesForCountry(norway.code));
    expect(first.answer).toContain(norway.name);
    expect(first.answer).toMatch(/\$\d/);
  });

  it("uses real item names rather than slug-shaped ids", () => {
    const text = countryPriceFaq(norway, pricesForCountry(norway.code))
      .map((f) => f.answer)
      .join(" ");
    expect(text).not.toMatch(/\bbig mac\b/);
    expect(text).not.toMatch(/\bnatural-gas\b/);
  });

  it("produces nothing at all for a country with no priced rows", () => {
    expect(countryPriceFaq(norway, [])).toEqual([]);
  });

  // The one that matters. Pairs in play are withheld so browsing the reference
  // tables cannot spoil the day's puzzle, and these answers render twice — as
  // visible copy and as FAQPage JSON-LD. The pages pass only their `visible`
  // rows, so a suppressed price can never reach here; this asserts the builder
  // quotes nothing but the rows it was handed.
  it("quotes only prices from the rows it is given", () => {
    const all = pricesForCountry(norway.code);
    if (all.length < 2) return;
    const [withheld, ...visible] = all;
    const text = countryPriceFaq(norway, visible)
      .map((f) => f.answer)
      .join(" ");
    const others = new Set(visible.map((p) => formatUSD(p.priceUSD)));
    const secret = formatUSD(withheld.priceUSD);
    if (!others.has(secret)) expect(text).not.toContain(secret);
  });
});

describe("itemPriceFaq", () => {
  it("asks the question this page exists to answer", () => {
    const questions = itemPriceFaq(bigMac, pricesForItem(bigMac.id)).map(
      (f) => f.question,
    );
    expect(questions[0]).toBe(
      `Which country has the cheapest ${bigMac.name.toLowerCase()}?`,
    );
  });

  it("names both ends of the range and the spread between them", () => {
    const rows = pricesForItem(bigMac.id);
    const [first] = itemPriceFaq(bigMac, rows);
    const sorted = [...rows].sort((a, b) => a.priceUSD - b.priceUSD);
    expect(first.answer).toContain(sorted[0].countryName);
    expect(first.answer).toContain(sorted[sorted.length - 1].countryName);
    expect(first.answer).toMatch(/\d+\.\d×/);
  });

  it("quotes only prices from the rows it is given", () => {
    const all = pricesForItem(bigMac.id);
    if (all.length < 3) return;
    const visible = all.slice(1, -1); // drop the true cheapest and dearest
    const text = itemPriceFaq(bigMac, visible)
      .map((f) => f.answer)
      .join(" ");
    const shown = new Set(visible.map((p) => formatUSD(p.priceUSD)));
    for (const hidden of [all[0], all[all.length - 1]]) {
      const secret = formatUSD(hidden.priceUSD);
      if (!shown.has(secret)) expect(text).not.toContain(secret);
    }
  });

  it("produces nothing at all for an item with no priced rows", () => {
    expect(itemPriceFaq(bigMac, [])).toEqual([]);
  });
});

describe("itemWithUnit", () => {
  it("does not restate a quantity the name already carries", () => {
    // "Gasoline (1 litre)", not "Gasoline (1 litre) (one litre)".
    const parenthesised = ITEMS.filter((i) => /\)\s*$/.test(i.name));
    expect(parenthesised.length).toBeGreaterThan(0);
    for (const item of parenthesised) {
      expect(itemWithUnit(item)).toBe(item.name);
    }
  });

  it("spells the unit out when the name leaves it implicit", () => {
    const bare = ITEMS.filter((i) => !/\)\s*$/.test(i.name));
    expect(bare.length).toBeGreaterThan(0);
    for (const item of bare) {
      expect(itemWithUnit(item)).toBe(`${item.name} (${item.unit})`);
    }
  });

  it("never doubles a parenthetical for any item in the catalogue", () => {
    for (const item of ITEMS) {
      expect(itemWithUnit(item)).not.toMatch(/\)\s*\([^)]*\)\s*$/);
    }
  });
});
