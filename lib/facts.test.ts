import { describe, it, expect } from "vitest";
import { FACTS, factFor } from "@/data/facts";
import { findPrice, PRICES } from "./puzzle";
import { getItem, itemCategory, CATEGORIES, CATEGORY_LABEL } from "@/data/items";
import { hintFor, HINT_AFTER_GUESSES } from "./hints";
import { botGuessUSD, beatTheBot } from "./bot";
import { inYourMoneyLine, workTime, minutesOfWorkLine } from "./home";

describe("the facts bank", () => {
  it("every entry names a source and says something", () => {
    for (const f of FACTS) {
      expect(f.source.length).toBeGreaterThan(8);
      expect(f.text.length).toBeGreaterThan(30);
    }
  });

  it("every itemId names a real item", () => {
    for (const f of FACTS) {
      if (f.itemId) expect(getItem(f.itemId)).toBeTruthy();
    }
  });

  // THE SPOILER RULE, enforced rather than trusted.
  //
  // A fact is permanent and every (item, country) pair comes round again, so a
  // fact quoting a figure for a pair the table carries hands over a future
  // answer. This caught three real ones on the first pass: Israeli mobile data,
  // Swiss Big Macs and American eggs were all quoted at figures sitting in
  // prices.json. It has to be mechanical, because the table grows and a fact
  // that is safe today becomes a spoiler the day somebody adds the country.
  it("never quotes a figure for a pair the table carries", () => {
    for (const f of FACTS) {
      if (!f.itemId || !f.quotes) continue;
      for (const code of f.quotes) {
        expect(
          findPrice(f.itemId, code),
          `"${f.text.slice(0, 50)}..." quotes ${code} for ${f.itemId}, which is a live pair`
        ).toBeUndefined();
      }
    }
  });

  it("prefers a fact written about the day's item", () => {
    const fact = factFor(1, "big-mac");
    expect(fact.itemId).toBe("big-mac");
  });

  it("falls back rather than failing on an item with no fact of its own", () => {
    expect(factFor(3, "eliquid-1ml")).toBeTruthy();
  });

  it("is deterministic for a given day", () => {
    expect(factFor(7, "beer-330ml")).toEqual(factFor(7, "beer-330ml"));
  });
});

describe("item categories", () => {
  it("covers every item in the catalogue", () => {
    const ids = new Set(PRICES.map((p) => p.itemId));
    for (const id of ids) {
      expect(CATEGORIES).toContain(itemCategory(id));
    }
  });

  it("labels every category", () => {
    for (const c of CATEGORIES) {
      expect(CATEGORY_LABEL[c].length).toBeGreaterThan(3);
    }
  });
});

describe("the clue before the last bid", () => {
  const price = PRICES.find((p) => p.itemId === "big-mac")!;

  it("stays locked until the player has used enough bids", () => {
    expect(hintFor(price, 0, 1)).toBeNull();
    expect(hintFor(price, HINT_AFTER_GUESSES - 1, 1)).toBeNull();
    expect(hintFor(price, HINT_AFTER_GUESSES, 1)).not.toBeNull();
  });

  // Checked by pulling the numbers out of the sentence rather than by searching
  // it for the price as a substring. A clue reading "48 of the countries" trips
  // a substring test against a price of $8 while giving nothing away.
  it("never quotes a number anywhere near the price it is a clue about", () => {
    for (const row of PRICES) {
      for (const n of [0, 1, 2]) {
        const hint = hintFor(row, HINT_AFTER_GUESSES, n);
        if (!hint) continue;
        // Dates first, or "collected in 2026-01" parses as the numbers 2026
        // and 1, and a $1 item then trips a check about prices on a month.
        const prose = hint.replace(/\d{4}-\d{2}/g, "");
        const numbers = (prose.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
        for (const found of numbers) {
          const ratio = found / row.priceUSD;
          expect(
            ratio > 0.75 && ratio < 1.33,
            `hint "${hint}" contains ${found}, within a third of the ${row.itemId} price in ${row.countryCode}`
          ).toBe(false);
        }
      }
    }
  });

  it("is the same clue every time for a given puzzle", () => {
    expect(hintFor(price, 4, 12)).toBe(hintFor(price, 4, 12));
  });

  it("offers something for every row in the live table", () => {
    for (const row of PRICES) {
      expect(hintFor(row, HINT_AFTER_GUESSES, 1)).toBeTruthy();
    }
  });
});

describe("the baseline model", () => {
  it("produces a prediction for nearly every row in the table", () => {
    const predicted = PRICES.filter((p) => botGuessUSD(p) !== null);
    expect(predicted.length / PRICES.length).toBeGreaterThan(0.95);
  });

  it("is in the right ballpark rather than merely finite", () => {
    // A model built from item level times country level should land inside a
    // factor of five on the large majority of rows. If this ever fails, the
    // model has stopped being worth showing next to a player's guess.
    const within = PRICES.filter((p) => {
      const g = botGuessUSD(p);
      return g !== null && Math.abs(Math.log(g / p.priceUSD)) < Math.log(5);
    });
    expect(within.length / PRICES.length).toBeGreaterThan(0.85);
  });

  it("scores the player against it on the ratio, not the rounded percent", () => {
    const price = PRICES.find((p) => botGuessUSD(p) !== null)!;
    const perfect = beatTheBot(price.priceUSD, price);
    expect(perfect?.playerWon).toBe(true);
    const hopeless = beatTheBot(price.priceUSD * 500, price);
    expect(hopeless?.playerWon).toBe(false);
  });

  it("declines rather than guessing when it has nothing to go on", () => {
    expect(beatTheBot(0, PRICES[0])).toBeNull();
  });
});

describe("working time", () => {
  it("scales the unit to the size of the number", () => {
    expect(workTime(0.5)).toBe("under a minute");
    expect(workTime(19)).toBe("19 minutes");
    expect(workTime(264)).toBe("4.4 hours");
    expect(workTime(60 * 40)).toContain("working days");
  });

  it("adds the reader's own wage when they have said where they live", () => {
    const price = PRICES.find((p) => p.itemId === "big-mac" && p.countryCode === "JP");
    if (!price) return;
    const alone = minutesOfWorkLine(price, "");
    const compared = minutesOfWorkLine(price, "PK");
    expect(compared.length).toBeGreaterThan(alone.length);
    expect(compared).toContain("On your wage");
  });

  it("says nothing extra when the reader lives in the country on the board", () => {
    const price = PRICES.find((p) => p.itemId === "big-mac")!;
    expect(minutesOfWorkLine(price, price.countryCode)).toBe(
      minutesOfWorkLine(price, "")
    );
  });
});

describe("the in-your-money line", () => {
  const price = PRICES.find((p) => p.itemId === "big-mac" && p.countryCode === "JP");

  it("says nothing without a home country", () => {
    if (!price) return;
    expect(inYourMoneyLine(price, "", new Set())).toBeNull();
    expect(inYourMoneyLine(price, "XX", new Set())).toBeNull();
  });

  it("says nothing when the reader is already in that country", () => {
    if (!price) return;
    expect(inYourMoneyLine(price, price.countryCode, new Set())).toBeNull();
  });

  // The suppression rule again: a comparison against the reader's own country
  // would let them solve for that country's withheld figure.
  it("withholds itself when the reader's own row is suppressed", () => {
    if (!price) return;
    const home = PRICES.find(
      (p) => p.itemId === "big-mac" && p.countryCode !== "JP"
    )!;
    const hidden = new Set([`${home.itemId}:${home.countryCode}`]);
    expect(inYourMoneyLine(price, home.countryCode, hidden)).toBeNull();
    // And produces a line when nothing is hidden, so the test above is not
    // passing for the wrong reason.
    expect(inYourMoneyLine(price, home.countryCode, new Set())).toBeTruthy();
  });
});
