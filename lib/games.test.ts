import { describe, expect, it } from "vitest";
import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import { RENT_AREAS } from "@/data/rent-ratio";
import { puzzleFor as tnPuzzle } from "./thenandnow";
import { puzzleFor as rrPuzzle } from "./rentratio";
import {
  GAMES,
  HUB_KEY,
  dailySetShare,
  hubStreak,
  knownDoneDates,
  nextGame,
  statuses,
  type KV,
} from "./games";

const D = "2026-10-22";
const kv = (o: Record<string, unknown>): KV => ({
  getItem: (k) => (k in o ? (typeof o[k] === "string" ? (o[k] as string) : JSON.stringify(o[k])) : null),
});

describe("games registry", () => {
  it("has unique slugs and hrefs", () => {
    expect(new Set(GAMES.map((g) => g.slug)).size).toBe(GAMES.length);
    expect(new Set(GAMES.map((g) => g.href)).size).toBe(GAMES.length);
  });

  it("reads not started for empty or stale storage", () => {
    const st = statuses(D, kv({ "pricele:rent-ratio": { date: "2026-10-21", picks: ["a"] } }));
    for (const g of GAMES) expect(st[g.slug].phase).toBe("not_started");
  });

  it("survives corrupt JSON", () => {
    const st = statuses(D, kv({ "pricele:then-and-now": "{oops", [`pricele:day:${D}`]: "nope" }));
    expect(st["then-and-now"].phase).toBe("not_started");
  });

  it("reads each game's existing keys", () => {
    const tn = tnPuzzle(D, THEN_NOW_ITEMS);
    const rr = rrPuzzle(D, RENT_AREAS);
    const picks = rr.rounds.map((r) => (r.a.fmr[2] > r.b.fmr[2] ? "a" : "b"));
    const st = statuses(
      D,
      kv({
        [`pricele:day:${D}`]: { date: D, guesses: [1, 2, 3], done: true, won: true },
        "pricele:then-and-now": { date: D, guesses: [tn.answer * 3] },
        "pricele:rent-ratio": { date: D, picks },
      })
    );
    expect(st.pricele).toEqual({ phase: "done", result: "3/5" });
    expect(st["then-and-now"].phase).toBe("in_progress");
    expect(st["rent-ratio"]).toEqual({ phase: "done", result: "5/5" });
  });

  it("nextGame skips finished games and returns null when all done", () => {
    const st = { pricele: { phase: "done" as const }, "then-and-now": { phase: "done" as const } };
    expect(nextGame("pricele", st)?.slug).toBe("rent-ratio");
    expect(nextGame("rent-ratio", { ...st, "rent-ratio": { phase: "done" } })?.slug).toBe(
      "inflation-ladder"
    );
    const allDone = Object.fromEntries(GAMES.map((g) => [g.slug, { phase: "done" as const }]));
    expect(nextGame("rent-ratio", allDone)).toBeNull();
  });
});

describe("hub streak", () => {
  it("counts consecutive days ending today", () => {
    expect(hubStreak(["2026-10-20", "2026-10-21", D], D)).toBe(3);
  });
  it("keeps yesterday's streak alive before today is played", () => {
    expect(hubStreak(["2026-10-20", "2026-10-21"], D)).toBe(2);
  });
  it("breaks on a gap", () => {
    expect(hubStreak(["2026-10-19", D], D)).toBe(1);
    expect(hubStreak(["2026-10-19"], D)).toBe(0);
  });
  it("crosses month boundaries", () => {
    expect(hubStreak(["2026-09-30", "2026-10-01"], "2026-10-01")).toBe(2);
  });
  it("merges hub log, main game history and today's state", () => {
    const dates = knownDoneDates(
      D,
      kv({
        [HUB_KEY]: ["2026-10-19"],
        "pricele:history": [{ date: "2026-10-20" }],
        "pricele:rent-ratio": { date: "2026-10-21", picks: ["a", "a", "a", "a", "a"] },
        "pricele:then-and-now": { date: D, guesses: [1, 1, 1, 1, 1] },
      })
    );
    expect([...dates].sort()).toEqual(["2026-10-19", "2026-10-20", D]);
    expect(hubStreak(dates, D)).toBe(1);
  });
});

describe("daily set share", () => {
  it("is spoiler-free and lists every game", () => {
    const text = dailySetShare(
      { pricele: { phase: "done", result: "2/5" }, "rent-ratio": { phase: "in_progress" } },
      4,
      "https://x/today",
      new Date(2026, 9, 22)
    );
    const lines = text.split("\n");
    expect(lines[0]).toMatch(/^Pricele daily set #\d+ ✅⬜⬜⬜$/);
    expect(text).toContain("✅ Pricele 2/5");
    expect(text).toContain("⬜ Rent Ratio");
    expect(text).toContain("🔥 4-day streak");
    expect(lines.at(-1)).toBe("https://x/today");
  });
});
