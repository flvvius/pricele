import { describe, expect, it } from "vitest";
import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import {
  MAX_TRIES,
  MIN_SPREAD,
  RUNGS,
  isOver,
  isSolved,
  markOrder,
  moveRung,
  percent,
  puzzleFor,
  result,
  shareText,
} from "./inflationladder";

function days(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(2026, 9, 22 + i));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

describe("inflation ladder puzzle", () => {
  it("is deterministic per date and numbered from the epoch", () => {
    const a = puzzleFor("2026-10-22", THEN_NOW_ITEMS);
    const b = puzzleFor("2026-10-22", THEN_NOW_ITEMS);
    expect(a.number).toBe(1);
    expect(a.answer).toEqual(b.answer);
  });

  it("deals distinct, well-spread rungs sorted by rise for a year of days", () => {
    for (const d of days(365)) {
      const p = puzzleFor(d, THEN_NOW_ITEMS);
      expect(new Set(p.answer).size).toBe(RUNGS);
      const changes = p.answer.map((id) => p.rungs.find((r) => r.item.id === id)!.change);
      for (let i = 1; i < changes.length; i++) {
        expect(changes[i - 1] - changes[i]).toBeGreaterThanOrEqual(MIN_SPREAD);
      }
      expect(p.baseYear).toBeLessThan(p.latestYear);
    }
  });

  it("varies the set from day to day", () => {
    const sets = new Set(days(30).map((d) => puzzleFor(d, THEN_NOW_ITEMS).answer.join()));
    expect(sets.size).toBeGreaterThan(25);
  });
});

describe("inflation ladder play", () => {
  const answer = ["a", "b", "c", "d"];

  it("marks each rung", () => {
    expect(markOrder(["a", "c", "b", "d"], answer)).toEqual(["right", "wrong", "wrong", "right"]);
    expect(isSolved(answer, answer)).toBe(true);
  });

  it("moves rungs and ignores moves off the ends", () => {
    expect(moveRung(answer, 1, 0)).toEqual(["b", "a", "c", "d"]);
    expect(moveRung(answer, 0, -1)).toBe(answer);
    expect(moveRung(answer, 3, 4)).toBe(answer);
  });

  it("ends on a solve or after the last try", () => {
    const wrong = ["d", "c", "b", "a"];
    expect(isOver({ date: "x", tries: [wrong] }, answer)).toBe(false);
    expect(isOver({ date: "x", tries: [wrong, answer] }, answer)).toBe(true);
    const lost = { date: "x", tries: Array(MAX_TRIES).fill(wrong) };
    expect(isOver(lost, answer)).toBe(true);
    expect(result(lost, answer)).toBe(`X/${MAX_TRIES}`);
    expect(result({ date: "x", tries: [wrong, answer] }, answer)).toBe(`2/${MAX_TRIES}`);
  });

  it("shares a spoiler-free grid", () => {
    const p = puzzleFor("2026-10-22", THEN_NOW_ITEMS);
    const first = [...p.answer].reverse();
    const text = shareText(p, { date: p.date, tries: [first, p.answer] }, "https://x/l");
    expect(text).toContain("Inflation Ladder #1 2/3");
    expect(text).toContain("🟩🟩🟩🟩");
    for (const r of p.rungs) expect(text).not.toContain(r.item.name);
  });

  it("formats signed percentages", () => {
    expect(percent(1.5)).toBe("+150%");
    expect(percent(-0.124)).toBe("-12%");
  });
});
