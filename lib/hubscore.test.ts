import { describe, expect, it } from "vitest";
import { rankedScore, scoreFromResult, standing, standingLine, MIN_RANKED } from "./hubscore";
import { puzzleFor as chainPuzzle, truth, CALLS } from "./pricechain";

describe("scoreFromResult", () => {
  it("ranks fewer tries higher for guess-count games", () => {
    expect(scoreFromResult("price-atlas", "1/6")).toBeGreaterThan(
      scoreFromResult("price-atlas", "4/6")!
    );
    expect(scoreFromResult("price-atlas", "X/6")).toBe(0);
  });

  it("keeps points as they are for points games", () => {
    expect(scoreFromResult("pricele-1000", "740/1000")).toBe(740);
    expect(scoreFromResult("rent-ratio", "3/5")).toBe(3);
  });

  it("rejects anything that is not a result", () => {
    expect(scoreFromResult("rent-ratio", "3 of 5")).toBeNull();
  });
});

describe("rankedScore", () => {
  const date = "2026-10-20";
  const p = chainPuzzle(date);
  const perfect = Array.from({ length: CALLS }, (_, i) => truth(p, i));

  it("recomputes the score from the submitted state", () => {
    expect(rankedScore("higher-or-lower", date, { calls: perfect })).toBe(CALLS);
  });

  it("refuses an unfinished game", () => {
    expect(rankedScore("higher-or-lower", date, { calls: perfect.slice(0, 3) })).toBeNull();
  });

  it("refuses unknown games and the main puzzle", () => {
    expect(rankedScore("pricele", date, { guesses: [] })).toBeNull();
    expect(rankedScore("nope", date, {})).toBeNull();
  });
});

describe("standing", () => {
  it("counts lower scores as beaten and equal ones as tied", () => {
    const s = standing(
      [
        { score: 1, n: 10 },
        { score: 3, n: 5 },
        { score: 5, n: 2 },
      ],
      3
    );
    expect(s).toEqual({ plays: 17, beaten: 10, tied: 5 });
  });
});

describe("standingLine", () => {
  it("reports turnout only below the threshold", () => {
    expect(standingLine({ plays: 1, beaten: 0, tied: 1 }, "Rent Ratio")).toMatch(/first/);
    expect(standingLine({ plays: 5, beaten: 2, tied: 1 }, "Rent Ratio")).toBe(
      "5 players have finished today's Rent Ratio so far."
    );
  });

  it("gives a percentage of the other players once enough have played", () => {
    const plays = MIN_RANKED * 4 + 1;
    expect(standingLine({ plays, beaten: 50, tied: 1 }, "Rent Ratio")).toBe(
      `You beat 50% of today's ${plays} players.`
    );
    expect(standingLine({ plays, beaten: plays - 1, tied: 1 }, "Rent Ratio")).toMatch(/Top score/);
  });

  it("returns null with no data", () => {
    expect(standingLine(null, "Rent Ratio")).toBeNull();
  });
});
