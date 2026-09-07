import { describe, it, expect } from "vitest";
import {
  ITEMS,
  itemLabel,
  itemPhrase,
  itemNoun,
  dropArticle,
  sentenceCase,
  lowerName,
  getItem,
} from "./items";

describe("item labels", () => {
  it("carries the quantity for the items whose name alone says nothing", () => {
    // A price for "electricity" is meaningless without the amount beside it,
    // and the same figure is per-kWh somewhere else on the web.
    expect(itemLabel(getItem("electricity-100kwh")!)).toBe(
      "Electricity (100 kWh)"
    );
    expect(itemLabel(getItem("natural-gas-100kwh")!)).toBe(
      "Natural gas (100 kWh)"
    );
  });

  it("leaves an item whose unit is obvious alone", () => {
    expect(itemLabel(getItem("big-mac")!)).toBe("Big Mac");
    expect(itemLabel(getItem("milk-1l")!)).toBe("Milk");
  });

  it("gives every measured item a name that already states its quantity", () => {
    // `name` is the game header and the page title; `measure` is what the short
    // name needs bolted on. The two must not disagree.
    for (const item of ITEMS) {
      if (!item.measure) continue;
      expect(item.name, item.id).toContain(item.measure);
    }
  });

  it("lowercases a name for prose without mangling the unit in brackets", () => {
    expect(lowerName("Electricity (100 kWh)")).toBe("electricity (100 kWh)");
    expect(lowerName("Natural gas (100 kWh)")).toBe("natural gas (100 kWh)");
    expect(lowerName("Big Mac")).toBe("big mac");
    expect(lowerName("Gasoline (1 litre)")).toBe("gasoline (1 litre)");
  });

  it("names the quantity in prose, with the article the noun takes", () => {
    // The bug this fixes: the reveal read "buys a electricity in Australia",
    // which is both ungrammatical and missing the amount being priced.
    expect(itemPhrase(getItem("electricity-100kwh")!)).toBe(
      "100 kWh of electricity"
    );
    expect(itemPhrase(getItem("mobile-data-1gb")!)).toBe(
      "a gigabyte of mobile data"
    );
    expect(itemPhrase(getItem("milk-1l")!)).toBe("a litre of milk");
    expect(itemPhrase(getItem("big-mac")!)).toBe("a Big Mac");
  });

  it("gives every item a phrase that reads as English in a sentence", () => {
    for (const item of ITEMS) {
      const phrase = itemPhrase(item);
      // No "a electricity": an article is only ever followed by a consonant
      // sound here, and no phrase carries a bracketed label.
      expect(phrase, item.id).not.toMatch(/[()]/);
      expect(phrase, item.id).not.toMatch(/^a [aeiou]/i);
      expect(`buys ${phrase}.`, item.id).toMatch(/^buys \S/);
      // An item whose short name needs a quantity must state it in the phrase.
      if (item.measure) expect(phrase, item.id).toContain(item.measure);
    }
  });

  it("drops the article where the sentence supplies its own determiner", () => {
    expect(itemNoun(getItem("milk-1l")!)).toBe("litre of milk");
    expect(itemNoun(getItem("electricity-100kwh")!)).toBe(
      "100 kWh of electricity"
    );
    expect(dropArticle("an apple")).toBe("apple");
    expect(dropArticle("100 kWh of electricity")).toBe("100 kWh of electricity");
  });

  it("capitalises a phrase that opens a sentence", () => {
    expect(sentenceCase("a litre of milk")).toBe("A litre of milk");
    expect(sentenceCase("100 kWh of electricity")).toBe(
      "100 kWh of electricity"
    );
  });

  it("has no LPG left in the catalogue", () => {
    // Removed because a litre of autogas means nothing to almost anyone. The id
    // survives only as a tombstone in the retired rotation era, which is what
    // holds that era's list length fixed. See data/rotation.ts.
    expect(getItem("lpg-1l")).toBeUndefined();
    expect(ITEMS.some((i) => /lpg/i.test(i.id) || /LPG/.test(i.name))).toBe(
      false
    );
  });
});
