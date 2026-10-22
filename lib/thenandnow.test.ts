import { describe, expect, it } from "vitest";
import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import { dayIndex, isOver, judge, puzzleFor, shareText, MAX_GUESSES } from "./thenandnow";

describe("then and now", () => {
  it("is deterministic per date and starts at #1 on the epoch", () => {
    const a = puzzleFor("2026-10-22", THEN_NOW_ITEMS);
    const b = puzzleFor("2026-10-22", THEN_NOW_ITEMS);
    expect(a).toEqual(b);
    expect(a.number).toBe(1);
    expect(dayIndex("2026-10-23")).toBe(1);
  });

  it("asks about a year at least five years before the anchor, with a real price", () => {
    for (let i = -30; i < 400; i++) {
      const d = new Date(Date.UTC(2026, 9, 22 + i)).toISOString().slice(0, 10);
      const p = puzzleFor(d, THEN_NOW_ITEMS);
      expect(p.year).toBeLessThanOrEqual(p.anchorYear - 5);
      expect(p.answer).toBeGreaterThan(0);
      expect(p.answer).toBe(p.item.prices[p.year]);
    }
  });

  it("cycles all items before repeating", () => {
    const ids = new Set<string>();
    for (let i = 0; i < THEN_NOW_ITEMS.length; i++) {
      const d = new Date(Date.UTC(2026, 9, 22 + i)).toISOString().slice(0, 10);
      ids.add(puzzleFor(d, THEN_NOW_ITEMS).item.id);
    }
    expect(ids.size).toBe(THEN_NOW_ITEMS.length);
  });

  it("judges within 10%", () => {
    expect(judge(1.05, 1)).toBe("win");
    expect(judge(0.5, 1)).toBe("higher");
    expect(judge(2, 1)).toBe("lower");
  });

  it("ends on a win or after the last guess", () => {
    expect(isOver({ date: "x", guesses: [1] }, 1)).toBe(true);
    expect(isOver({ date: "x", guesses: Array(MAX_GUESSES).fill(9) }, 1)).toBe(true);
    expect(isOver({ date: "x", guesses: [9] }, 1)).toBe(false);
  });

  it("shares a spoiler-free line", () => {
    const p = puzzleFor("2026-10-22", THEN_NOW_ITEMS);
    const text = shareText(p, [p.answer * 3, p.answer], "https://x/games/then-and-now");
    expect(text).toContain(`Then & Now #1 2/${MAX_GUESSES}`);
    expect(text).toContain("⬇️🟩");
    expect(text).not.toContain(p.answer.toFixed(2));
  });

  it("data has every series with prices across the range", () => {
    for (const item of THEN_NOW_ITEMS) {
      expect(item.series).toMatch(/^APU0000/);
      expect(Object.keys(item.prices).length).toBeGreaterThan(20);
    }
  });
});
