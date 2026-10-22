import { describe, expect, it } from "vitest";
import { pairForDate } from "./catalog";
import { isPlayablePair } from "./higherlower";
import { PRICES, dateFromISO } from "./puzzle";
import { CALLS, CARDS, isOver, puzzleFor, result, score, shareText, truth } from "./pricechain";

const days = (n: number) =>
  Array.from({ length: n }, (_, i) => new Date(Date.UTC(2026, 9, 22 + i)).toISOString().slice(0, 10));

describe("higher or lower daily", () => {
  it("builds a playable ten-card chain every day for a year", () => {
    for (const d of days(365)) {
      const p = puzzleFor(d);
      expect(p.cards).toHaveLength(CARDS);
      const keys = new Set(p.cards.map((c) => `${c.itemId}:${c.countryName}`));
      expect(keys.size).toBe(CARDS);
      for (let i = 1; i < CARDS; i++) {
        expect(isPlayablePair(p.cards[i - 1], p.cards[i])).toBe(true);
        expect(p.cards[i].itemId).not.toBe(p.cards[i - 1].itemId);
      }
    }
  });

  it("keeps today's main puzzle out of the chain", () => {
    for (const d of days(60)) {
      const pair = pairForDate(dateFromISO(d))!;
      const name = PRICES.find((r) => r.countryCode === pair.countryCode)!.countryName;
      const p = puzzleFor(d);
      expect(p.cards.some((c) => c.itemId === pair.itemId && c.countryName === name)).toBe(false);
    }
  });

  it("is the same chain for everyone on a date", () => {
    expect(puzzleFor("2026-11-01")).toEqual(puzzleFor("2026-11-01"));
  });

  it("scores calls and shares a grid", () => {
    const p = puzzleFor("2026-10-22");
    const perfect = Array.from({ length: CALLS }, (_, i) => truth(p, i));
    const state = { date: p.date, calls: perfect };
    expect(isOver(state)).toBe(true);
    expect(score(p, perfect)).toBe(CALLS);
    expect(result(p, state)).toBe(`${CALLS}/${CALLS}`);
    const text = shareText(p, state, "https://x/h");
    expect(text).toContain("Higher or Lower Daily #1 9/9");
    expect(text).not.toContain(p.cards[0].countryName);
  });
});
