import { describe, it, expect } from "vitest";
import { personaFor, roastFor, highlightFor, lookalikeLine } from "./verdict";
import { evaluate, pointsFor, roundScore, MAX_POINTS } from "./scoring";
import { buildLineItems, buildShareText, barcode } from "./share";
import { PRICES, findPrice } from "./puzzle";
import type { GuessRecord } from "./storage";

const ACTUAL = 4.0;

/** Build the guess records the game would have stored for these values. */
function round(values: number[], actual = ACTUAL): GuessRecord[] {
  return values.map((value) => {
    const r = evaluate(value, actual);
    return {
      value,
      band: r.band,
      direction: r.direction,
      closeness: r.closeness,
    };
  });
}

describe("persona verdicts", () => {
  it("calls a first-bid win", () => {
    expect(personaFor(round([4.0]), ACTUAL, true).title).toBe("The Local");
  });

  it("names someone who priced a different economy entirely", () => {
    // Three times over on the opening bid, and over every time after.
    expect(personaFor(round([13.0, 11.0]), ACTUAL, false).title).toBe(
      "The Oligarch"
    );
  });

  it("names a plain overbidder separately from an absurd one", () => {
    expect(personaFor(round([5.0, 4.6]), ACTUAL, false).title).toBe(
      "The Tourist"
    );
    expect(personaFor(round([3.0, 3.6]), ACTUAL, false).title).toBe(
      "The Haggler"
    );
  });

  it("names someone who opened at holiday prices and talked themselves down", () => {
    expect(personaFor(round([9.0, 4.1]), ACTUAL, false).title).toBe(
      "The Recovering Tourist"
    );
  });

  it("names a round that never converged", () => {
    expect(personaFor(round([16.0, 1.0, 14.0]), ACTUAL, false).title).toBe(
      "The Auctioneer"
    );
  });

  // The case that makes the auctioneer rule correct. High, low, land is a
  // bisection, which is the right way to play, and calling it chaotic would be
  // an insult aimed at the one player doing it properly.
  it("does not call a clean bisection an auction", () => {
    // High, low, land, with each bid closer than the last.
    expect(personaFor(round([6.0, 2.5, 4.05]), ACTUAL, true).title).toBe(
      "The Buyer"
    );
    // The same shape but with a wilder opening reads as a recovery, and either
    // way it is never the auctioneer, which is the point of the rule.
    expect(personaFor(round([16.0, 1.2, 4.05]), ACTUAL, true).title).not.toBe(
      "The Auctioneer"
    );
  });

  it("separates a near miss from a rout", () => {
    expect(personaFor(round([3.5, 4.3]), ACTUAL, false).title).toBe(
      "The Near Miss"
    );
    expect(personaFor(round([0.4, 0.5, 30.0]), ACTUAL, false).title).toBe(
      "The Backpacker"
    );
  });

  // The regression. Written against percent error, The Backpacker could never
  // fire: a bid under the price is at most "100% off", so any round containing
  // one fell through to the catch-all, and every round without one was caught by
  // The Tourist first. Half and double have to be the same distance.
  it("reaches the rout verdict from either side of the price", () => {
    expect(personaFor(round([0.2, 0.5, 30.0]), ACTUAL, false).title).toBe(
      "The Backpacker"
    );
    expect(personaFor(round([30.0, 0.3, 25.0]), ACTUAL, false).title).not.toBe(
      "The Browser"
    );
  });

  it("always returns something, including for an empty round", () => {
    expect(personaFor([], ACTUAL, false).title).toBeTruthy();
    expect(personaFor(round([4.3, 3.7]), ACTUAL, false).title).toBeTruthy();
  });

  // The receipt quotes the verdict, so two renders of the same round have to
  // produce the same words on every device.
  it("is deterministic", () => {
    const guesses = round([9.0, 2.0, 4.02]);
    expect(personaFor(guesses, ACTUAL, true)).toEqual(
      personaFor(guesses, ACTUAL, true)
    );
  });
});

describe("roast tiers", () => {
  it("escalates with distance", () => {
    expect(roastFor(2, 1)).toMatch(/cent|the price|rung up/i);
    expect(roastFor(900, 1)).toMatch(/ransom|factor of four|invented/i);
  });

  it("picks a line for every distance, including absurd ones", () => {
    for (const off of [0, 5, 15, 40, 100, 300, 301, 5000]) {
      expect(roastFor(off, 3).length).toBeGreaterThan(0);
    }
  });

  it("is stable for a given puzzle and varies between puzzles", () => {
    expect(roastFor(20, 7)).toBe(roastFor(20, 7));
    const lines = new Set([roastFor(20, 1), roastFor(20, 2), roastFor(20, 3)]);
    expect(lines.size).toBeGreaterThan(1);
  });

  it("survives a negative puzzle number without indexing off the array", () => {
    expect(roastFor(20, -5)).toBeTruthy();
  });
});

describe("leading with what went right", () => {
  it("names the best bid by its ordinal on a loss", () => {
    const h = highlightFor(round([9.0, 1.0, 4.4]), ACTUAL, false);
    expect(h?.guessNumber).toBe(3);
    expect(h?.line).toBe("Your 3rd bid was 10% off.");
  });

  it("stays quiet on a win, where the win is already the good news", () => {
    expect(highlightFor(round([4.0]), ACTUAL, true)).toBeNull();
  });

  it("stays quiet with nothing played", () => {
    expect(highlightFor([], ACTUAL, false)).toBeNull();
  });
});

describe("the price-lookalike line", () => {
  const price = PRICES.find((p) => p.itemId === "big-mac")!;

  it("names a country whose price the bid actually matches", () => {
    const peer = PRICES.find(
      (p) => p.itemId === "big-mac" && p.countryCode !== price.countryCode
    )!;
    const line = lookalikeLine(peer.priceUSD, price, new Set());
    expect(line).toContain("big mac");
    expect(line).toMatch(/costs in /);
  });

  it("says nothing when the bid resembles nowhere", () => {
    expect(lookalikeLine(9999, price, new Set())).toBeNull();
  });

  // The suppression rule. Naming a country whose figure the rest of the site is
  // holding back would hand it over in a sentence.
  it("never names a country inside the suppression window", () => {
    const peer = PRICES.find(
      (p) => p.itemId === "big-mac" && p.countryCode !== price.countryCode
    )!;
    const hidden = new Set([`${peer.itemId}:${peer.countryCode}`]);
    const line = lookalikeLine(peer.priceUSD, price, hidden);
    expect(line ?? "").not.toContain(peer.countryName);
  });

  it("never names the country already on the board", () => {
    const line = lookalikeLine(price.priceUSD, price, new Set());
    expect(line ?? "").not.toContain(price.countryName);
  });
});

describe("the points curve", () => {
  it("is worth full marks for an exact bid and nothing for a wild one", () => {
    expect(pointsFor(4, 4)).toBe(MAX_POINTS);
    expect(pointsFor(400, 4)).toBe(0);
  });

  it("is steep where players are good and flat where they are guessing", () => {
    // Closing from 5% to exact is worth far more than closing from 45% to 40%.
    const nearGain = pointsFor(4, 4) - pointsFor(4.2, 4);
    const farGain = pointsFor(5.6, 4) - pointsFor(5.8, 4);
    expect(nearGain).toBeGreaterThan(farGain * 3);
  });

  // Scored on the ratio, so an item's price cannot decide how scoreable it is.
  it("treats the same proportional error alike on a cheap and dear item", () => {
    expect(pointsFor(0.33, 0.3)).toBe(pointsFor(8.8, 8));
  });

  it("charges a toll for every bid after the first", () => {
    const one = roundScore([{ value: 4 }], 4);
    const three = roundScore([{ value: 40 }, { value: 1 }, { value: 4 }], 4);
    expect(one).toBe(MAX_POINTS);
    expect(three).toBe(MAX_POINTS - 80);
  });

  it("never goes negative", () => {
    expect(
      roundScore([{ value: 900 }, { value: 800 }, { value: 700 }, { value: 600 }, { value: 500 }], 4)
    ).toBe(0);
  });
});

describe("the receipt", () => {
  const guesses = round([9.0, 2.0, 4.02]);

  it("points the arrow at where the price was, not at the bid", () => {
    // Bid 1.00 against a price of 4.00: the price was higher, arrow points up.
    expect(buildLineItems(round([1.0]))).toContain("⬆");
    expect(buildLineItems(round([16.0]))).toContain("⬇");
  });

  it("gives a winning bid a green block and no arrow", () => {
    expect(buildLineItems(round([4.0]))).toBe("🟩");
  });

  it("encodes the puzzle number in the barcode, differently for each day", () => {
    expect(barcode(214)).toBe(barcode(214));
    expect(barcode(214)).not.toBe(barcode(215));
    expect(barcode(214).startsWith("║")).toBe(true);
  });

  it("carries the header, the line items, the totals and the verdict", () => {
    const text = buildShareText({
      puzzleNumber: 214,
      itemName: "Cappuccino",
      countryName: "Japan",
      flag: "🇯🇵",
      guesses,
      won: true,
      streak: 12,
      bestPctOff: 1,
      score: 870,
      actualUSD: ACTUAL,
    });
    const lines = text.split("\n");
    expect(lines[0]).toBe("🧾 PRICELE #214");
    expect(lines[1]).toBe("CAPPUCCINO · JAPAN 🇯🇵");
    expect(lines[5]).toBe("BIDS 3/5 · BEST 1% · SCORE 870");
    expect(lines[6]).toBe('"The Recovering Tourist" · 🔥12');
  });

  it("marks a loss as X of five", () => {
    const text = buildShareText({
      puzzleNumber: 1,
      itemName: "Milk",
      countryName: "Japan",
      flag: "🇯🇵",
      guesses: round([1, 1.2, 1.4, 1.6, 1.8]),
      won: false,
      bestPctOff: 55,
      actualUSD: ACTUAL,
    });
    expect(text).toContain("BIDS X/5");
  });

  it("never claims an exact hit the rounding cannot stand behind", () => {
    const text = buildShareText({
      puzzleNumber: 1,
      itemName: "Milk",
      countryName: "Japan",
      flag: "🇯🇵",
      guesses: round([4.0]),
      won: true,
      bestPctOff: 0,
      actualUSD: ACTUAL,
    });
    expect(text).toContain("BEST 1%");
    expect(text).not.toContain("BEST 0%");
  });

  it("leaves the streak off a run of one, where it is not a run", () => {
    const text = buildShareText({
      puzzleNumber: 1,
      itemName: "Milk",
      countryName: "Japan",
      flag: "🇯🇵",
      guesses,
      won: true,
      streak: 1,
      actualUSD: ACTUAL,
    });
    expect(text).not.toContain("🔥");
  });

  // THE property. A receipt gives away the shape of the round and nothing that
  // could be worked back into the price.
  it("contains no bid and no price", () => {
    const text = buildShareText({
      puzzleNumber: 214,
      itemName: "Cappuccino",
      countryName: "Japan",
      flag: "🇯🇵",
      guesses: round([9.0, 2.0, 4.02]),
      won: true,
      bestPctOff: 1,
      score: 870,
      actualUSD: ACTUAL,
    });
    for (const forbidden of ["9.0", "2.0", "4.02", "4.00", "$"]) {
      expect(text).not.toContain(forbidden);
    }
  });
});

describe("the price table is intact", () => {
  it("still resolves a known pair", () => {
    expect(findPrice("big-mac", "JP")?.priceUSD).toBeGreaterThan(0);
  });
});
