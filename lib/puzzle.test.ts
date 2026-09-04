import { describe, it, expect } from "vitest";
import {
  isoDate,
  daysSince,
  getDailyPuzzle,
  getPuzzleForISO,
  puzzleNumber,
  addDaysISO,
  pastPuzzleDates,
  dateFromISO,
  findPrice,
  itemOrderForDay,
  countryForDay,
  PRICES,
} from "./puzzle";
import { ROTATION } from "@/data/rotation";
import { ITEMS } from "@/data/items";
import {
  suppressedPairs,
  pairForDate,
  publishedArchiveDates,
  isPublishedArchiveDate,
  COUNTRIES,
} from "./catalog";

const getPuzzleItemFor = (iso: string) => getPuzzleForISO(iso)?.item.id;

/** The schedule lists in force, newest era last. */
const countryOrder = ROTATION.countryEras.at(-1)!.order;
const itemOrder = ROTATION.itemEras.at(-1)!.order;
const itemOrderFrom = ROTATION.itemEras.at(-1)!.from;

describe("date logic (local time)", () => {
  it("isoDate formats a local date as YYYY-MM-DD", () => {
    expect(isoDate(new Date(2026, 6, 5))).toBe("2026-07-05");
    expect(isoDate(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("daysSince counts whole calendar days from the start date", () => {
    expect(daysSince("2026-07-01", new Date(2026, 6, 1))).toBe(0);
    expect(daysSince("2026-07-01", new Date(2026, 6, 11))).toBe(10);
    // Spans a DST boundary in many timezones; still an exact day count.
    expect(daysSince("2026-03-01", new Date(2026, 2, 31))).toBe(30);
  });
});

describe("daily puzzle rotation", () => {
  it("starts on India on the rotation start date (2026-07-24)", () => {
    const day0 = getDailyPuzzle(new Date(2026, 6, 24));
    expect(day0?.price.countryCode).toBe("IN");
    expect(day0?.puzzleNumber).toBe(24); // epoch is 2026-07-01
  });

  it("keeps the historical country schedule unchanged", () => {
    // These days were already played; nothing added since may move them.
    expect(getDailyPuzzle(new Date(2026, 6, 25))?.price.countryCode).toBe("US");
    expect(getDailyPuzzle(new Date(2026, 6, 26))?.price.countryCode).toBe("TH");
  });

  it("never rewrites a schedule that is already in force", () => {
    // Each era is what some stretch of days was actually played on. The oldest
    // two are frozen here as well as in data/rotation.ts, so a well-meaning
    // tidy-up of either fails the build instead of silently rewriting the
    // archive and every share card already posted.
    expect(ROTATION.countryEras[0]).toEqual({
      from: 0,
      order: [
        "IN", "US", "TH", "DE", "EG", "NO", "MX", "JP", "AR", "CH",
        "VN", "GB", "ZA", "AU", "ID", "FR", "TR", "BR", "SA", "IE",
        "CN", "KR", "NZ", "PL", "LB", "IT", "AE", "SE", "PT", "CA",
        "ES", "NL", "SG",
      ],
    });
    expect(ROTATION.itemEras[0]).toEqual({
      from: 0,
      order: [
        "big-mac", "milk-1l", "cappuccino", "eggs-12",
        "gasoline-1l", "coke-330ml", "apples-1kg",
      ],
    });
    // The 17-item era. "lpg-1l" is a tombstone: the item is gone from the
    // catalogue, but dropping the id would shorten this list and move every day
    // in the era onto a different puzzle.
    expect(ROTATION.itemEras[1]).toEqual({
      from: 30,
      order: [
        "mobile-data-1gb", "healthy-diet-day", "diesel-1l", "spirits-750ml",
        "milk-1l", "gasoline-1l", "apples-1kg", "cappuccino",
        "eggs-12", "eliquid-1ml", "lpg-1l", "natural-gas-100kwh",
        "coke-330ml", "big-mac", "beer-330ml", "electricity-100kwh",
        "cigarettes-20",
      ],
    });
    expect(ROTATION.startDate).toBe("2026-07-24");
    expect(ROTATION.epoch).toBe("2026-07-01");
  });

  it("starts each chain at day 0 and moves forward from there", () => {
    for (const eras of [ROTATION.countryEras, ROTATION.itemEras]) {
      expect(eras[0].from).toBe(0);
      for (let i = 1; i < eras.length; i++) {
        expect(eras[i].from).toBeGreaterThan(eras[i - 1].from);
      }
    }
  });

  it("keeps every day already played on its original country", () => {
    const [launch, full] = ROTATION.countryEras;
    for (let day = 0; day < full.from; day++) {
      const expected = launch.order[day % launch.order.length];
      expect(countryForDay(day), `day ${day}`).toBe(expected);
      const iso = addDaysISO(ROTATION.startDate, day);
      expect(getPuzzleForISO(iso)?.price.countryCode, iso).toBe(expected);
    }
  });

  it("lists every country once, in every era", () => {
    for (const era of ROTATION.countryEras) {
      expect(new Set(era.order).size).toBe(era.order.length);
    }
    // The live list is the whole roster; the older ones are subsets of it.
    expect([...countryOrder].sort()).toEqual(
      [...COUNTRIES.map((c) => c.code)].sort()
    );
    for (const era of ROTATION.countryEras) {
      for (const code of era.order) expect(countryOrder).toContain(code);
    }
  });

  it("schedules a different item every day", () => {
    // The scheduled item always advances. What a day actually resolves to can
    // repeat, because a country that does not stock the scheduled item falls
    // through to the next one it does have, and two thinly-stocked countries in
    // a row can land on the same fallback. That is checked separately below.
    for (const day of [0, 1, 2, 29, 30, 31, 40, 41, 42]) {
      expect(itemOrderForDay(day)[0], `day ${day}`).not.toBe(
        itemOrderForDay(day + 1)[0]
      );
    }
  });

  it("rarely shows the same item two days running", () => {
    let repeats = 0;
    const days = 784; // one full country x item cycle
    for (let i = itemOrderFrom; i < itemOrderFrom + days; i++) {
      const a = pairForDate(dateFromISO(addDaysISO(ROTATION.startDate, i)));
      const b = pairForDate(dateFromISO(addDaysISO(ROTATION.startDate, i + 1)));
      if (a && b && a.itemId === b.itemId) repeats++;
    }
    // Sparse countries make some repetition unavoidable; a table that had gone
    // badly hollow would show up here as this number climbing.
    expect(repeats / days).toBeLessThan(0.05);
  });

  it("keeps every day already played on the schedule it was played on", () => {
    // Every era change moves `dayIndex % length` for the days that follow it.
    // Days inside an era that has already run have to keep the item they were
    // actually played with, or the archive and every share card already posted
    // start describing a different puzzle.
    for (let e = 0; e < ROTATION.itemEras.length; e++) {
      const era = ROTATION.itemEras[e];
      const until = ROTATION.itemEras[e + 1]?.from ?? era.from + era.order.length;
      for (let day = era.from; day < until; day++) {
        const scheduled = era.order[(day - era.from) % era.order.length];
        const country = countryForDay(day)!;
        // Only assert where the country actually stocks the scheduled item;
        // elsewhere the substitution rule picks, and it picks from this era's
        // list either way.
        if (!findPrice(scheduled, country)) continue;
        const iso = addDaysISO(ROTATION.startDate, day);
        expect(getPuzzleItemFor(iso), `day ${day} (${iso})`).toBe(scheduled);
      }
    }
  });

  it("leaves the days already played untouched by the LPG removal", () => {
    // The exact puzzles days 30..45 resolved to under the 17-item era, recorded
    // before LPG was dropped. Appending an era rather than editing one is what
    // keeps these fixed; shortening the live list in place moved day 41 off
    // natural gas and day 43 off the Big Mac.
    const played: [number, string, string][] = [
      [30, "HU", "mobile-data-1gb"], [31, "UY", "healthy-diet-day"],
      [32, "NG", "diesel-1l"], [33, "MY", "natural-gas-100kwh"],
      [34, "VN", "milk-1l"], [35, "RO", "eliquid-1ml"],
      [36, "JP", "apples-1kg"], [37, "ZA", "cappuccino"],
      [38, "CO", "natural-gas-100kwh"], [39, "CR", "big-mac"],
      [40, "TZ", "beer-330ml"], [41, "US", "natural-gas-100kwh"],
      [42, "PK", "big-mac"], [43, "CN", "big-mac"],
      [44, "PE", "beer-330ml"], [45, "AU", "electricity-100kwh"],
    ];
    for (const [day, code, itemId] of played) {
      const iso = addDaysISO(ROTATION.startDate, day);
      const puzzle = getPuzzleForISO(iso);
      expect(puzzle?.price.countryCode, `day ${day} (${iso})`).toBe(code);
      expect(puzzle?.item.id, `day ${day} (${iso})`).toBe(itemId);
    }
  });

  it("uses the live catalogue from the latest changeover onwards", () => {
    for (let day = itemOrderFrom; day < itemOrderFrom + itemOrder.length; day++) {
      const scheduled = itemOrder[(day - itemOrderFrom) % itemOrder.length];
      const country = countryForDay(day)!;
      if (!findPrice(scheduled, country)) continue;
      const iso = addDaysISO(ROTATION.startDate, day);
      expect(getPuzzleItemFor(iso), `day ${day} (${iso})`).toBe(scheduled);
    }
  });

  it("only repeats an (item, country) pair after a full cycle", () => {
    const period = countryOrder.length * itemOrder.length;
    expect(period).toBe(784); // 49 countries x 16 items

    const seen = new Set<string>();
    for (let i = itemOrderFrom; i < itemOrderFrom + period; i++) {
      const pair = pairForDate(dateFromISO(addDaysISO(ROTATION.startDate, i)));
      expect(pair).not.toBeNull();
      seen.add(`${pair!.itemId}:${pair!.countryCode}`);
    }
    // The table is sparse, so a country's 16 scheduled slots collapse onto
    // however many items it actually stocks. Every row in the table should be
    // reachable.
    expect(seen.size).toBe(PRICES.length);

    // And the cycle really does close: one full period on, the pair repeats.
    const first = pairForDate(
      dateFromISO(addDaysISO(ROTATION.startDate, itemOrderFrom))
    );
    const wrapped = pairForDate(
      dateFromISO(addDaysISO(ROTATION.startDate, itemOrderFrom + period))
    );
    expect(wrapped).toEqual(first);
  });

  it("item and country list lengths stay coprime", () => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    expect(gcd(countryOrder.length, itemOrder.length)).toBe(1);
  });

  it("always resolves to a puzzle whose price row actually exists", () => {
    for (let i = 0; i < 400; i++) {
      const d = dateFromISO(addDaysISO(ROTATION.startDate, i));
      const puzzle = getDailyPuzzle(d);
      expect(puzzle, `no puzzle for day ${i}`).not.toBeNull();
      expect(
        findPrice(puzzle!.item.id, puzzle!.price.countryCode)
      ).toBeDefined();
      expect(puzzle!.price.priceUSD).toBeGreaterThan(0);
    }
  });

  it("substitutes deterministically when a country lacks the scheduled item", () => {
    // Lebanon has no milk row, so whichever day pairs LB with milk must fall
    // through to an item it does have, and do so identically every call.
    const lbDays: number[] = [];
    for (let i = 0; i < 784; i++) {
      const pair = pairForDate(dateFromISO(addDaysISO(ROTATION.startDate, i)));
      if (pair?.countryCode === "LB") lbDays.push(i);
    }
    expect(lbDays.length).toBeGreaterThan(0);
    for (const day of lbDays) {
      const d = dateFromISO(addDaysISO(ROTATION.startDate, day));
      const first = getDailyPuzzle(d);
      const second = getDailyPuzzle(d);
      expect(first?.item.id).toBe(second?.item.id);
      expect(findPrice(first!.item.id, "LB")).toBeDefined();
    }
  });

  it("puzzleNumber increments by one each day", () => {
    expect(puzzleNumber(new Date(2026, 6, 24))).toBe(24);
    expect(puzzleNumber(new Date(2026, 6, 25))).toBe(25);
  });
});

describe("archive date helpers", () => {
  it("addDaysISO adds days, crossing month boundaries", () => {
    expect(addDaysISO("2026-07-24", 5)).toBe("2026-07-29");
    expect(addDaysISO("2026-07-30", 3)).toBe("2026-08-02");
    expect(addDaysISO("2026-07-24", 0)).toBe("2026-07-24");
  });

  it("pastPuzzleDates lists prior days, newest first, excluding today", () => {
    const dates = pastPuzzleDates(dateFromISO("2026-07-29"));
    expect(dates).toEqual([
      "2026-07-28",
      "2026-07-27",
      "2026-07-26",
      "2026-07-25",
      "2026-07-24",
    ]);
  });

  it("has no archive on the rotation start date", () => {
    expect(pastPuzzleDates(dateFromISO("2026-07-24"))).toEqual([]);
  });
});

describe("answer suppression", () => {
  it("hides yesterday, today and tomorrow", () => {
    const now = dateFromISO("2026-09-01");
    const s = suppressedPairs(now);
    for (const offset of [-1, 0, 1]) {
      const iso = addDaysISO("2026-09-01", offset);
      const pair = pairForDate(dateFromISO(iso));
      expect(s.has(`${pair!.itemId}:${pair!.countryCode}`)).toBe(true);
    }
    expect(s.size).toBeGreaterThanOrEqual(1);
  });

  it("does not hide a puzzle from two days ago", () => {
    const now = dateFromISO("2026-09-01");
    const s = suppressedPairs(now);
    const old = pairForDate(dateFromISO(addDaysISO("2026-09-01", -2)));
    expect(s.has(`${old!.itemId}:${old!.countryCode}`)).toBe(false);
  });

  it("never hides more than one item on a single country page", () => {
    // Consecutive days are always different countries, so a three-day window
    // can only ever touch one item per country.
    for (let i = 0; i < 240; i++) {
      const now = dateFromISO(addDaysISO(ROTATION.startDate, i + 3));
      const s = suppressedPairs(now);
      const perCountry = new Map<string, number>();
      for (const key of s) {
        const code = key.split(":")[1];
        perCountry.set(code, (perCountry.get(code) ?? 0) + 1);
      }
      for (const [code, n] of perCountry) {
        expect(n, `${code} had ${n} hidden items on day ${i}`).toBe(1);
      }
    }
  });
});

describe("published archive window", () => {
  it("stops two days short of today, so no live answer is published", () => {
    const now = dateFromISO("2026-09-01");
    const dates = publishedArchiveDates(now);
    expect(dates[0]).toBe("2026-08-30");
    expect(dates).not.toContain("2026-08-31");
    expect(dates).not.toContain("2026-09-01");
  });

  it("agrees with isPublishedArchiveDate", () => {
    const now = dateFromISO("2026-09-01");
    for (const iso of publishedArchiveDates(now)) {
      expect(isPublishedArchiveDate(iso, now), iso).toBe(true);
    }
    expect(isPublishedArchiveDate("2026-08-31", now)).toBe(false);
    expect(isPublishedArchiveDate("2026-09-01", now)).toBe(false);
    expect(isPublishedArchiveDate("2026-09-02", now)).toBe(false);
  });

  it("no published archive entry is also a suppressed pair", () => {
    // The two rules have to agree, or an archive page would leak a live answer.
    for (let i = 5; i < 200; i++) {
      const now = dateFromISO(addDaysISO(ROTATION.startDate, i));
      const s = suppressedPairs(now);
      for (const iso of publishedArchiveDates(now, 10)) {
        const pair = pairForDate(dateFromISO(iso));
        expect(
          s.has(`${pair!.itemId}:${pair!.countryCode}`),
          `${iso} is published but suppressed on day ${i}`
        ).toBe(false);
      }
    }
  });

  it("is empty before the game has two full days of history", () => {
    expect(publishedArchiveDates(dateFromISO("2026-07-24"))).toEqual([]);
    expect(publishedArchiveDates(dateFromISO("2026-07-25"))).toEqual([]);
    expect(publishedArchiveDates(dateFromISO("2026-07-26"))).toEqual([
      "2026-07-24",
    ]);
  });
});

describe("catalog", () => {
  it("derives one entry per country with a unique slug", () => {
    expect(COUNTRIES.length).toBe(countryOrder.length);
    const slugs = new Set(COUNTRIES.map((c) => c.slug));
    expect(slugs.size).toBe(COUNTRIES.length);
  });

  it("covers every country the rotation can schedule", () => {
    const codes = new Set(COUNTRIES.map((c) => c.code));
    for (const era of ROTATION.countryEras) {
      for (const code of era.order) {
        expect(
          codes.has(code),
          `rotation references unknown country ${code}`
        ).toBe(true);
      }
    }
  });

  it("has a price row for every item the live rotation can schedule", () => {
    // Only the live era. An era that has already run may name an item that has
    // since left the catalogue -- the id stays behind as a tombstone so the
    // list keeps its length, and getDailyPuzzle walks past it.
    const ids = new Set(ITEMS.map((i) => i.id));
    for (const id of itemOrder) {
      expect(ids.has(id), `rotation references unknown item ${id}`).toBe(true);
      expect(
        PRICES.some((p) => p.itemId === id),
        `no price row anywhere for ${id}`
      ).toBe(true);
    }
  });

  it("schedules the whole catalog, with nothing listed twice", () => {
    expect([...itemOrder].sort()).toEqual(ITEMS.map((i) => i.id).sort());
  });

  it("resolves a puzzle on every day of a retired era, tombstones and all", () => {
    // A tombstoned id has no item and no price row, so the walk has to skip it
    // rather than give up on the day.
    for (let day = 0; day < itemOrderFrom; day++) {
      const iso = addDaysISO(ROTATION.startDate, day);
      expect(getPuzzleForISO(iso), `day ${day} (${iso})`).not.toBeNull();
    }
  });

  it("offers every item as a fallback on every day", () => {
    // getDailyPuzzle walks this list until it finds an item the country
    // stocks, so a rotation of the list, not a slice of it, is what keeps a
    // thinly-stocked country from falling off the end.
    for (const day of [0, 5, 29, 30, 31, 45, 46, 400]) {
      const order = itemOrderForDay(day);
      const era = [...ROTATION.itemEras].reverse().find((e) => day >= e.from)!;
      expect(order.length).toBe(era.order.length);
      expect([...order].sort()).toEqual([...era.order].sort());
    }
  });
});
