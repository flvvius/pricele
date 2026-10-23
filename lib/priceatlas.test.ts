import { describe, expect, it } from "vitest";
import { pairForDate } from "./catalog";
import { dateFromISO } from "./puzzle";
import { GAME_RETIREMENT_DATE, RETIRED_FROM_GAMES } from "@/data/items";
import {
  COUNTRIES,
  MAX_GUESSES,
  START_CLUES,
  ARROW_AFTER,
  arrow,
  bearing,
  distanceKm,
  feedback,
  isOver,
  matchCountries,
  priceLevel,
  puzzleFor,
  result,
  shareText,
  visibleClues,
} from "./priceatlas";

function days(n: number): string[] {
  return Array.from({ length: n }, (_, i) =>
    new Date(Date.UTC(2026, 9, 22 + i)).toISOString().slice(0, 10)
  );
}

describe("price atlas puzzle", () => {
  it("covers every country with a capital", () => {
    expect(COUNTRIES.length).toBe(61);
  });

  it("never picks the country of the main daily on the same day", () => {
    for (const d of days(200)) {
      const pair = pairForDate(dateFromISO(d));
      expect(puzzleFor(d).answer.code).not.toBe(pair?.countryCode);
    }
  });

  it("deals enough clues and grows them with each miss", () => {
    for (const d of days(60)) {
      const p = puzzleFor(d);
      expect(p.clues.length).toBeGreaterThanOrEqual(START_CLUES + 2);
      expect(visibleClues(p, 0)).toHaveLength(START_CLUES);
      expect(visibleClues(p, 2).length).toBeGreaterThan(START_CLUES);
    }
  });

  it("stops dealing retired items as clues from the retirement date", () => {
    const dealt = (d: string) => puzzleFor(d).clues.map((c) => c.itemId);
    for (const d of days(60).filter((d) => d >= GAME_RETIREMENT_DATE)) {
      for (const id of dealt(d)) expect(RETIRED_FROM_GAMES.has(id), `${d} ${id}`).toBe(false);
    }
  });

  it("does not repeat a country within a lap", () => {
    const answers = days(40).map((d) => puzzleFor(d).answer.code);
    const consecutiveRepeats = answers.filter((a, i) => i > 0 && a === answers[i - 1]);
    expect(consecutiveRepeats).toHaveLength(0);
    expect(new Set(answers).size).toBeGreaterThan(35);
  });
});

describe("price atlas geometry", () => {
  it("measures capital to capital", () => {
    expect(distanceKm("GB", "FR")).toBeGreaterThan(300);
    expect(distanceKm("GB", "FR")).toBeLessThan(400);
    expect(distanceKm("JP", "JP")).toBe(0);
  });

  it("points the right way", () => {
    expect(arrow(bearing("GB", "NO"))).toBe("↗️");
    expect(arrow(bearing("NO", "ZA"))).toBe("⬇️");
    expect(arrow(bearing("JP", "CN"))).toBe("⬅️");
  });

  it("compares price levels on shared items", () => {
    const level = priceLevel("NO", "EG");
    expect(level).not.toBeNull();
    expect(level!).toBeGreaterThan(0.5);
  });
});

describe("price atlas play", () => {
  const p = puzzleFor("2026-10-22");
  const wrong = COUNTRIES.filter((c) => c.code !== p.answer.code).map((c) => c.code);

  it("scores a win and a loss", () => {
    expect(result(p, { date: p.date, guesses: [wrong[0], p.answer.code] })).toBe(`2/${MAX_GUESSES}`);
    const lost = { date: p.date, guesses: wrong.slice(0, MAX_GUESSES) };
    expect(isOver(p, lost)).toBe(true);
    expect(result(p, lost)).toBe(`X/${MAX_GUESSES}`);
  });

  it("gives a bullseye on the answer", () => {
    expect(feedback(p, p.answer.code, 0).arrow).toBe("🎯");
  });

  it("holds the compass arrow back until the late guesses", () => {
    for (let i = 0; i < ARROW_AFTER; i++) expect(feedback(p, wrong[0], i).arrow).toBe("");
    expect(feedback(p, wrong[0], ARROW_AFTER).arrow).not.toBe("");
    expect(feedback(p, wrong[0], 0).km).toBeGreaterThan(0);
  });

  it("shares without naming the country", () => {
    const text = shareText(p, { date: p.date, guesses: [wrong[0], p.answer.code] }, "https://x/a");
    expect(text.startsWith("Price Atlas #1 2/6")).toBe(true);
    expect(text).not.toContain(p.answer.name);
    expect(text).toContain("🟩🎯");
  });

  it("matches countries by prefix first", () => {
    const m = matchCountries("ar");
    expect(m[0].name).toBe("Argentina");
    expect(matchCountries("ar", ["AR"]).some((c) => c.code === "AR")).toBe(false);
    expect(matchCountries("  ")).toEqual([]);
  });

  it("matches the short names people type", () => {
    expect(matchCountries("usa")[0].code).toBe("US");
    expect(matchCountries("USA ")[0].code).toBe("US");
    expect(matchCountries("uk")[0].code).toBe("GB");
    expect(matchCountries("england")[0].code).toBe("GB");
    expect(matchCountries("uae")[0].code).toBe("AE");
    expect(matchCountries("Türkiye")[0].code).toBe("TR");
    // A name that starts with the query still outranks an alias that does.
    expect(matchCountries("u")[0].name.startsWith("U")).toBe(true);
    expect(matchCountries("us")[0].code).toBe("US");
  });
});
