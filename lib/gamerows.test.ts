import { describe, expect, it } from "vitest";
import { COUNTRIES_ADDED_ON } from "@/data/countries";
import { gameRows } from "./catalog";
import { puzzleFor as atlas } from "./priceatlas";
import { puzzleFor as range } from "./openrange";
import { puzzleFor as chain } from "./pricechain";
import { puzzleFor as p1000 } from "./pricele1000";
import { PRICES } from "./puzzle";

const added = new Set(Object.keys(COUNTRIES_ADDED_ON));
const days = (from: string, n: number) =>
  Array.from({ length: n }, (_, i) =>
    new Date(Date.parse(`${from}T00:00:00Z`) + i * 86_400_000).toISOString().slice(0, 10)
  );

describe("countries joining the games", () => {
  it("keeps every game dated before a country joined free of it", () => {
    const joined = Object.values(COUNTRIES_ADDED_ON).sort()[0];
    for (const d of days("2026-10-22", 30).filter((d) => d < joined)) {
      expect(added.has(atlas(d).answer.code), `atlas ${d}`).toBe(false);
      for (const q of range(d).questions) expect(added.has(q.price.countryCode), `range ${d}`).toBe(false);
      for (const r of p1000(d).rounds) expect(added.has(r.price.countryCode), `p1000 ${d}`).toBe(false);
      for (const c of chain(d).cards) {
        const row = PRICES.find((p) => p.itemId === c.itemId && p.countryName === c.countryName);
        expect(added.has(row!.countryCode), `chain ${d}`).toBe(false);
      }
    }
  });

  it("deals them from the day they join", () => {
    const answers = new Set(days("2026-10-26", 120).map((d) => atlas(d).answer.code));
    for (const code of added) expect(answers.has(code), code).toBe(true);
    expect(gameRows("2026-10-26").some((p) => added.has(p.countryCode))).toBe(true);
  });
});
