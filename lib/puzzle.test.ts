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
    // These days were already played under the single-item rotation; adding
    // items must not have moved any of them to a different country.
    expect(getDailyPuzzle(new Date(2026, 6, 25))?.price.countryCode).toBe("US");
    expect(getDailyPuzzle(new Date(2026, 6, 26))?.price.countryCode).toBe("TH");
    const wrapped = getDailyPuzzle(new Date(2026, 6, 24 + 33));
    expect(wrapped?.price.countryCode).toBe("IN");
  });

  it("advances the item every day too", () => {
    for (const day of [0, 1, 2, 40, 41, 42]) {
      const iso = addDaysISO(ROTATION.startDate, day);
      const next = addDaysISO(ROTATION.startDate, day + 1);
      expect(getPuzzleItemFor(iso), iso).not.toBe(getPuzzleItemFor(next));
    }
  });

  it("keeps every day already played on the seven-item schedule", () => {
    // The catalogue went from 7 items to 17, which moves `dayIndex % length`
    // for every day at once. Days before ROTATION.itemOrderFrom have to keep
    // the item they were actually played with, or the archive and every share
    // card already posted start describing a different puzzle.
    const { legacyItemOrder, itemOrderFrom } = ROTATION;
    expect(itemOrderFrom).toBeGreaterThan(0);
    for (let day = 0; day < itemOrderFrom; day++) {
      const scheduled = legacyItemOrder[day % legacyItemOrder.length];
      const country = ROTATION.countryOrder[day % ROTATION.countryOrder.length];
      // Only assert where the country actually stocks the scheduled item;
      // elsewhere the substitution rule picks, and it picks from the legacy
      // list either way.
      if (!findPrice(scheduled, country)) continue;
      const iso = addDaysISO(ROTATION.startDate, day);
      expect(getPuzzleItemFor(iso), `day ${day} (${iso})`).toBe(scheduled);
    }
  });

  it("uses the full catalogue from the changeover day onwards", () => {
    const { itemOrder, itemOrderFrom, countryOrder } = ROTATION;
    for (let day = itemOrderFrom; day < itemOrderFrom + itemOrder.length; day++) {
      const scheduled = itemOrder[(day - itemOrderFrom) % itemOrder.length];
      const country = countryOrder[day % countryOrder.length];
      if (!findPrice(scheduled, country)) continue;
      const iso = addDaysISO(ROTATION.startDate, day);
      expect(getPuzzleItemFor(iso), `day ${day} (${iso})`).toBe(scheduled);
    }
  });

  it("only repeats an (item, country) pair after a full cycle", () => {
    const { itemOrderFrom, countryOrder, itemOrder } = ROTATION;
    const period = countryOrder.length * itemOrder.length;
    expect(period).toBe(561); // 33 countries x 17 items

    const seen = new Set<string>();
    for (let i = itemOrderFrom; i < itemOrderFrom + period; i++) {
      const pair = pairForDate(dateFromISO(addDaysISO(ROTATION.startDate, i)));
      expect(pair).not.toBeNull();
      seen.add(`${pair!.itemId}:${pair!.countryCode}`);
    }
    // The table is sparse, so a country's 17 scheduled slots collapse onto
    // however many items it actually stocks. There are 503 rows in all, and
    // every one of them should be reachable.
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
    expect(gcd(ROTATION.countryOrder.length, ROTATION.itemOrder.length)).toBe(1);
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
    for (let i = 0; i < 561; i++) {
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
    expect(COUNTRIES.length).toBe(ROTATION.countryOrder.length);
    const slugs = new Set(COUNTRIES.map((c) => c.slug));
    expect(slugs.size).toBe(COUNTRIES.length);
  });

  it("covers every country the rotation can schedule", () => {
    const codes = new Set(COUNTRIES.map((c) => c.code));
    for (const code of ROTATION.countryOrder) {
      expect(codes.has(code), `rotation references unknown country ${code}`).toBe(
        true
      );
    }
  });

  it("has a price row for every item the rotation can schedule", () => {
    const ids = new Set(ITEMS.map((i) => i.id));
    for (const id of [...ROTATION.itemOrder, ...ROTATION.legacyItemOrder]) {
      expect(ids.has(id), `rotation references unknown item ${id}`).toBe(true);
      expect(
        PRICES.some((p) => p.itemId === id),
        `no price row anywhere for ${id}`
      ).toBe(true);
    }
  });

  it("schedules the whole catalog, with nothing listed twice", () => {
    expect([...ROTATION.itemOrder].sort()).toEqual(
      ITEMS.map((i) => i.id).sort()
    );
  });

  it("offers every item as a fallback on every day", () => {
    // getDailyPuzzle walks this list until it finds an item the country
    // stocks, so a rotation of the list, not a slice of it, is what keeps a
    // thinly-stocked country from falling off the end.
    for (const day of [0, 5, 29, 30, 31, 400]) {
      const order = itemOrderForDay(day);
      const expected =
        day < ROTATION.itemOrderFrom
          ? ROTATION.legacyItemOrder
          : ROTATION.itemOrder;
      expect(order.length).toBe(expected.length);
      expect([...order].sort()).toEqual([...expected].sort());
    }
  });
});
