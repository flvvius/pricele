import { describe, it, expect } from "vitest";
import {
  passport,
  summariseWeek,
  weekOf,
  withRecord,
  type PlayRecord,
} from "./history";
import { decodeWeek, encodeWeek, roastWeek, toSharedWeek } from "./weekshare";
import {
  egoGapLine,
  homeBiasLine,
  overshootLine,
  percentileLine,
  turnoutLine,
  MIN_CROWD,
  MIN_LOCALS,
} from "./crowd";
import { bucketFor, BUCKET_COUNT, type CrowdRow } from "./db";

const rec = (over: Partial<PlayRecord> = {}): PlayRecord => ({
  date: "2026-09-03",
  itemId: "big-mac",
  itemName: "Big Mac",
  countryCode: "JP",
  countryName: "Japan",
  flag: "🇯🇵",
  won: true,
  numGuesses: 3,
  firstGuessUSD: 6,
  bestPctOff: 2,
  actualUSD: 4,
  score: 700,
  persona: "The Tourist",
  ...over,
});

describe("the history tape", () => {
  it("keeps one record per day, last write winning", () => {
    const first = withRecord([], rec({ won: false }));
    const second = withRecord(first, rec({ won: true }));
    expect(second).toHaveLength(1);
    expect(second[0].won).toBe(true);
  });

  it("stays in date order however records arrive", () => {
    const h = withRecord(
      withRecord([], rec({ date: "2026-09-05" })),
      rec({ date: "2026-09-01" })
    );
    expect(h.map((r) => r.date)).toEqual(["2026-09-01", "2026-09-05"]);
  });

  it("trims the oldest records rather than growing without limit", () => {
    let h: PlayRecord[] = [];
    for (let i = 0; i < 500; i++) {
      h = withRecord(h, rec({ date: `2026-01-${String(i + 1).padStart(3, "0")}` }));
    }
    expect(h.length).toBeLessThanOrEqual(430);
    expect(h[h.length - 1].date).toBe("2026-01-500");
  });
});

describe("the passport", () => {
  it("stamps one page per country and one mark per item bought there", () => {
    const h = [
      rec({ date: "2026-09-01", itemId: "big-mac", won: false }),
      rec({ date: "2026-09-02", itemId: "milk-1l", won: true }),
      rec({ date: "2026-09-03", itemId: "big-mac", won: true }),
    ];
    const [japan] = passport(h);
    expect(japan.items.sort()).toEqual(["big-mac", "milk-1l"]);
    // One win anywhere turns the stamp gold, and it never turns back.
    expect(japan.solved.sort()).toEqual(["big-mac", "milk-1l"]);
    expect(japan.lastPlayed).toBe("2026-09-03");
  });

  it("does not double-count the same item bought twice", () => {
    const h = [
      rec({ date: "2026-09-01", itemId: "big-mac" }),
      rec({ date: "2026-09-02", itemId: "big-mac" }),
    ];
    expect(passport(h)[0].items).toEqual(["big-mac"]);
  });

  it("is alphabetical, so the book does not reshuffle as it fills", () => {
    const stamps = passport([
      rec({ countryCode: "JP", countryName: "Japan", date: "2026-09-01" }),
      rec({ countryCode: "AR", countryName: "Argentina", date: "2026-09-02" }),
    ]);
    expect(stamps.map((s) => s.countryName)).toEqual(["Argentina", "Japan"]);
  });
});

describe("cutting a week", () => {
  it("takes seven days ending today and nothing outside them", () => {
    const h = [
      rec({ date: "2026-08-26" }), // 8 days back
      rec({ date: "2026-08-28" }), // 6 days back
      rec({ date: "2026-09-03" }),
    ];
    expect(weekOf(h, "2026-09-03").map((r) => r.date)).toEqual([
      "2026-08-28",
      "2026-09-03",
    ]);
  });

  it("summarises what happened", () => {
    const s = summariseWeek([
      rec({ date: "2026-09-01", bestPctOff: 40, score: 100, firstGuessUSD: 8, actualUSD: 4 }),
      rec({ date: "2026-09-02", bestPctOff: 2, score: 800, firstGuessUSD: 4, actualUSD: 4 }),
      rec({ date: "2026-09-03", bestPctOff: 20, won: false, score: 300, persona: "The Haggler" }),
    ]);
    expect(s.played).toBe(3);
    expect(s.wins).toBe(2);
    expect(s.points).toBe(1200);
    expect(s.worst?.date).toBe("2026-09-01");
    expect(s.best?.date).toBe("2026-09-02");
  });

  it("handles an empty week without inventing a summary", () => {
    const s = summariseWeek([]);
    expect(s.played).toBe(0);
    expect(s.openingErrorPct).toBeNull();
    expect(s.persona).toBeNull();
  });
});

describe("the shared week", () => {
  const week = [
    rec({ date: "2026-09-01", countryCode: "FR", bestPctOff: 44 }),
    rec({ date: "2026-09-02", countryCode: "JP", bestPctOff: 2 }),
  ];

  it("survives a round trip through a URL fragment", () => {
    const decoded = decodeWeek(encodeWeek(week));
    expect(decoded?.d).toHaveLength(2);
    expect(decoded?.d[0].c).toBe("FR");
    expect(decoded?.d[1].b).toBe(2);
  });

  // The reason this format exists. A recipient who has not played today must not
  // be able to read a price out of their friend's card.
  it("carries no price and no bid", () => {
    // Checked field by field rather than by searching the JSON for a digit: the
    // percentages and scores are full of digits that happen to match, and a
    // substring test would either pass for the wrong reason or fail for one.
    const shared = toSharedWeek(week);
    const allowed = new Set(["i", "c", "w", "b", "s", "p"]);
    for (const day of shared.d) {
      expect(Object.keys(day).every((k) => allowed.has(k))).toBe(true);
    }
    // And nothing in the payload equals a price or a bid from the source records.
    const values = shared.d.flatMap((d) => Object.values(d));
    for (const r of week) {
      expect(values).not.toContain(r.actualUSD);
      expect(values).not.toContain(r.firstGuessUSD);
    }
  });

  it("rejects a fragment that is not a week", () => {
    expect(decodeWeek("not-base64-at-all!!")).toBeNull();
    expect(decodeWeek(btoa(JSON.stringify({ v: 9, d: [] })))).toBeNull();
    expect(
      decodeWeek(
        btoa(JSON.stringify({ v: 1, d: [{ i: "x", c: "toolong", w: 1, b: 0, s: 0, p: "x" }] }))
      )
    ).toBeNull();
    expect(
      decodeWeek(
        btoa(
          JSON.stringify({
            v: 1,
            d: Array(8).fill({ i: "x", c: "JP", w: 1, b: 0, s: 0, p: "x" }),
          })
        )
      )
    ).toBeNull();
  });

  it("writes a roast for the week, and for an empty one", () => {
    expect(roastWeek(toSharedWeek(week)).length).toBeGreaterThan(2);
    expect(roastWeek({ v: 1, d: [] })).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------

const rowOf = (over: Partial<CrowdRow> = {}): CrowdRow => ({
  plays: 100,
  wins: 50,
  // ln(1.36) x 100: the crowd opens 36% over, on average.
  first_log_sum: Math.log(1.36) * 100,
  first_over: 73,
  best_log_sum: 20,
  ...over,
});

describe("withholding a figure there is no sample for", () => {
  it("every line is silent below the threshold", () => {
    const thin = rowOf({ plays: MIN_CROWD - 1 });
    expect(egoGapLine(thin, "Cappuccino", "Japan")).toBeNull();
    expect(overshootLine(thin, "Japan")).toBeNull();
    expect(turnoutLine(thin)).toBeNull();
    expect(
      percentileLine({ all: thin, locals: null, worseThanReader: 10 })
    ).toBeNull();
  });

  it("every line is silent with no data at all", () => {
    expect(egoGapLine(null, "Cappuccino", "Japan")).toBeNull();
    expect(overshootLine(null, "Japan")).toBeNull();
    expect(homeBiasLine(null, "Cappuccino", "Japan")).toBeNull();
    expect(turnoutLine(null)).toBeNull();
    expect(percentileLine(null)).toBeNull();
  });
});

describe("the ego gap", () => {
  it("reports the geometric mean of the opening bids", () => {
    expect(egoGapLine(rowOf(), "Cappuccino", "Japan")).toBe(
      "Players overestimate a cappuccino in Japan by 36% on their opening bid."
    );
  });

  it("says under when the crowd lowballs", () => {
    const low = rowOf({ first_log_sum: Math.log(0.7) * 100 });
    expect(egoGapLine(low, "Cappuccino", "Japan")).toMatch(/underestimate/);
  });

  // The whole reason the sums are kept in log space. One player typing 500 on a
  // $4 item would drag an arithmetic mean into nonsense; it barely moves this.
  it("is not run away with by a single absurd bid", () => {
    const sane = Math.log(1.1) * 99;
    const withOutlier = rowOf({ first_log_sum: sane + Math.log(125) });
    const line = egoGapLine(withOutlier, "Cappuccino", "Japan")!;
    const pct = Number(line.match(/(\d+)%/)![1]);
    expect(pct).toBeLessThan(30);
  });

  it("does not claim a gap it cannot measure", () => {
    const flat = rowOf({ first_log_sum: Math.log(1.01) * 100 });
    expect(egoGapLine(flat, "Cappuccino", "Japan")).toMatch(/almost exactly/);
  });
});

describe("who bid high", () => {
  it("leads with the majority, whichever side it is on", () => {
    expect(overshootLine(rowOf({ first_over: 73 }), "Japan")).toBe(
      "73% of players opened above the real price in Japan."
    );
    expect(overshootLine(rowOf({ first_over: 27 }), "Japan")).toBe(
      "73% of players opened below the real price in Japan."
    );
  });
});

describe("home-country bias", () => {
  it("needs its own, smaller sample", () => {
    expect(
      homeBiasLine(rowOf({ plays: MIN_LOCALS - 1 }), "Cappuccino", "Japan")
    ).toBeNull();
    const line = homeBiasLine(
      rowOf({ plays: MIN_LOCALS, first_log_sum: Math.log(1.2) * MIN_LOCALS }),
      "Cappuccino",
      "Japan"
    );
    expect(line).toBe("Players in Japan overestimate their own cappuccino by 20%.");
  });
});

describe("the percentile and turnout lines", () => {
  it("reports how much of the field the reader beat", () => {
    expect(
      percentileLine({ all: rowOf(), locals: null, worseThanReader: 81 })
    ).toBe("Closer than 81% of everyone who has played today.");
  });

  it("says nothing rather than something deflating", () => {
    expect(
      percentileLine({ all: rowOf(), locals: null, worseThanReader: 4 })
    ).toBeNull();
  });

  it("reads as a scoreboard", () => {
    expect(turnoutLine(rowOf({ plays: 1204, wins: 758 }))).toBe(
      "1,204 played today · 63% solved it"
    );
  });
});

describe("histogram buckets", () => {
  it("covers 0 to 200% in five-point steps", () => {
    expect(bucketFor(0)).toBe(0);
    expect(bucketFor(4)).toBe(0);
    expect(bucketFor(5)).toBe(1);
    expect(bucketFor(195)).toBe(BUCKET_COUNT - 1);
  });

  it("clamps rather than indexing past the end", () => {
    expect(bucketFor(100000)).toBe(BUCKET_COUNT - 1);
    expect(bucketFor(-3)).toBe(0);
  });

  // A better bid must never land in a higher bucket than a worse one, or the
  // "closer than X%" line inverts.
  it("is monotonic", () => {
    let previous = -1;
    for (let pct = 0; pct < 250; pct += 1) {
      const b = bucketFor(pct);
      expect(b).toBeGreaterThanOrEqual(previous);
      previous = b;
    }
  });
});
