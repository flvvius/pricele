import { describe, it, expect } from "vitest";
import {
  fromUSD,
  toUSD,
  otherCurrency,
  currencySymbol,
  USD_TO_EUR,
} from "./currency";
import { evaluate } from "./scoring";

describe("conversion", () => {
  it("round-trips a value through both currencies", () => {
    for (const usd of [0.31, 1.55, 5.17, 7.05, 24.9]) {
      expect(toUSD(fromUSD(usd, "EUR"), "EUR")).toBeCloseTo(usd, 10);
      expect(toUSD(fromUSD(usd, "USD"), "USD")).toBe(usd);
    }
  });

  it("leaves dollars untouched in both directions", () => {
    expect(fromUSD(7.05, "USD")).toBe(7.05);
    expect(toUSD(7.05, "USD")).toBe(7.05);
  });

  it("applies the reference rate to euros", () => {
    expect(fromUSD(1, "EUR")).toBe(USD_TO_EUR);
    expect(toUSD(USD_TO_EUR, "EUR")).toBeCloseTo(1, 10);
  });

  it("otherCurrency flips", () => {
    expect(otherCurrency("USD")).toBe("EUR");
    expect(otherCurrency("EUR")).toBe("USD");
  });

  it("has a symbol for each", () => {
    expect(currencySymbol("USD")).toBe("$");
    expect(currencySymbol("EUR")).toBe("€");
  });
});

describe("scoring is unaffected by the display currency", () => {
  // The property the whole feature rests on: scoring compares a ratio, so
  // converting both the guess and the answer by the same constant cannot move
  // a guess across a band boundary. If this ever fails, the euro player and
  // the dollar player are no longer playing the same game.
  it("gives the same band for the same real-world guess in either currency", () => {
    const actualUSD = 7.05;
    for (const usd of [3.0, 6.7, 7.0, 7.4, 9.0, 20.0]) {
      const viaEuros = toUSD(fromUSD(usd, "EUR"), "EUR");
      expect(evaluate(viaEuros, actualUSD).band).toBe(
        evaluate(usd, actualUSD).band
      );
    }
  });

  it("holds at the exact edge of the win band", () => {
    const actualUSD = 1.55;
    const edge = actualUSD * 1.05;
    expect(evaluate(toUSD(fromUSD(edge, "EUR"), "EUR"), actualUSD).win).toBe(
      evaluate(edge, actualUSD).win
    );
  });

  it("holds across the full price range in the game", () => {
    // Cheapest and priciest rows differ by ~80x; a scale-dependent bug would
    // show up at the ends before the middle.
    for (const actualUSD of [0.31, 24.9]) {
      const guess = actualUSD * 1.2;
      expect(evaluate(toUSD(fromUSD(guess, "EUR"), "EUR"), actualUSD).band).toBe(
        evaluate(guess, actualUSD).band
      );
    }
  });
});
