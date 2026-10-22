import { describe, expect, it } from "vitest";
import { RENT_AREAS } from "@/data/rent-ratio";
import { dayIndex, isCorrect, isOver, puzzleFor, score, shareText, twoBed, MIN_GAP, ROUNDS } from "./rentratio";

const day = (i: number) => new Date(Date.UTC(2026, 9, 22 + i)).toISOString().slice(0, 10);

describe("rent ratio", () => {
  it("is deterministic per date and starts at #1 on the epoch", () => {
    const a = puzzleFor("2026-10-22", RENT_AREAS);
    expect(a).toEqual(puzzleFor("2026-10-22", RENT_AREAS));
    expect(a.number).toBe(1);
    expect(dayIndex("2026-10-23")).toBe(1);
    expect(puzzleFor(day(1), RENT_AREAS)).not.toEqual(a);
  });

  it("builds five rounds of distinct metros with a clear gap", () => {
    for (let i = -30; i < 400; i++) {
      const p = puzzleFor(day(i), RENT_AREAS);
      expect(p.rounds).toHaveLength(ROUNDS);
      const ids = p.rounds.flatMap((r) => [r.a.id, r.b.id]);
      expect(new Set(ids).size).toBe(ROUNDS * 2);
      for (const r of p.rounds) expect(Math.abs(twoBed(r.a) - twoBed(r.b))).toBeGreaterThanOrEqual(MIN_GAP);
    }
  });

  it("judges the pricier side and scores", () => {
    const p = puzzleFor("2026-10-22", RENT_AREAS);
    const right = p.rounds.map((r) => (twoBed(r.a) > twoBed(r.b) ? "a" : "b") as "a" | "b");
    expect(right.every((k, i) => isCorrect(p.rounds[i], k))).toBe(true);
    expect(score(p, right)).toBe(ROUNDS);
    expect(isOver({ date: "x", picks: right })).toBe(true);
    expect(isOver({ date: "x", picks: right.slice(1) })).toBe(false);
  });

  it("shares a spoiler-free line", () => {
    const p = puzzleFor("2026-10-22", RENT_AREAS);
    const picks = p.rounds.map((r, i) => ((twoBed(r.a) > twoBed(r.b)) === (i !== 0) ? "a" : "b") as "a" | "b");
    const text = shareText(p, picks, "https://x/games/rent-ratio");
    expect(text).toContain(`Rent Ratio #1 4/${ROUNDS}`);
    expect(text).toContain("🟥🟩🟩🟩🟩");
    for (const r of p.rounds) {
      expect(text).not.toContain(r.a.name);
      expect(text).not.toContain(String(twoBed(r.a)));
    }
  });

  it("data covers ~60 HUD areas with sane, increasing FMRs", () => {
    expect(RENT_AREAS.length).toBeGreaterThanOrEqual(55);
    expect(new Set(RENT_AREAS.map((a) => a.id)).size).toBe(RENT_AREAS.length);
    for (const a of RENT_AREAS) {
      expect(a.code).toMatch(/^METRO/);
      expect(a.fmr).toHaveLength(5);
      expect(twoBed(a)).toBeGreaterThan(500);
      expect(a.fmr[2]).toBeGreaterThan(a.fmr[1]);
    }
  });
});
