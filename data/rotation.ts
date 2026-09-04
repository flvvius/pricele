// Maps each day to one (item, country) pair:
//   country = countryOrder[(dayIndex - from) % countryOrder.length]
//   item    = itemOrder   [(dayIndex - from) % itemOrder.length]
// where dayIndex = daysSince(startDate) and `from` is the day the list in force
// took over (see the era chain below).
//
// The two lists advance independently. Their lengths (49 and 16) are coprime, so
// a given pair only recurs after 49 x 16 = 784 days: a different country every
// day, a different item every day, and the same combination about once every
// two years.
//
// STABILITY RULE. Read this before editing:
//   Never move startDate, and never edit an era that is already in force. Each
//   era holds the schedule some stretch of days was actually played on, and
//   rewriting one changes which puzzle a past day had, which breaks the archive
//   and every share card already posted. (Reordering the country list under a
//   fixed startDate is exactly what shifted the puzzle from India to Lebanon
//   once before.)
//
//   Both schedules are chains of eras, oldest first. An era's `from` is the day
//   index it takes over on; every day before it belongs to the era before. That
//   is what makes it safe to add, remove and reorder entries, which editing one
//   list in place is not: changing a list's length moves `dayIndex % length` for
//   every day at once.
//
//   To change a schedule, append a new era with a `from` set a few days into the
//   future -- past today and past the answer-suppression window, so nothing
//   already played and nothing currently on the board moves. Never edit the
//   entries of an era whose `from` has passed.
//
//   One extra constraint on the item chain: keep the live list's length coprime
//   with the country list's, or the pairing collapses onto a short cycle and
//   most combinations never come up. With 49 countries, that rules out any item
//   count divisible by 7.
//
//   Removing an item from the catalogue does not remove it from the eras it was
//   scheduled in: an id stays behind as a tombstone so the list keeps its
//   length, and the resolver in lib/puzzle.ts simply walks past an id it can no
//   longer price. Deleting the entry instead would shorten a frozen list and
//   rewrite every day in that era.

/** One stretch of the schedule: the list in force, and the day it took over. */
export interface RotationEra {
  /** First day index this list is in force from. The first era must be 0. */
  from: number;
  /** Ordered country codes, or ordered item ids. */
  order: string[];
}

export interface Rotation {
  /** Puzzle #1 date, for the puzzle counter only. Local date "YYYY-MM-DD". */
  epoch: string;
  /** Day 0 of the rotation, i.e. the day-0 country + the day-0 item. Local date. */
  startDate: string;
  /** The country schedules, oldest first. Frozen once an era's `from` passes. */
  countryEras: RotationEra[];
  /** The item schedules, oldest first. Frozen once an era's `from` passes. */
  itemEras: RotationEra[];
}

// The 33-country schedule the game launched with. India was day 0 (2026-07-24).
const LAUNCH_COUNTRIES: string[] = [
  "IN", "US", "TH", "DE", "EG", "NO", "MX", "JP", "AR", "CH",
  "VN", "GB", "ZA", "AU", "ID", "FR", "TR", "BR", "SA", "IE",
  "CN", "KR", "NZ", "PL", "LB", "IT", "AE", "SE", "PT", "CA",
  "ES", "NL", "SG",
];

// The full 49-country roster, in force from day 30 (2026-08-23).
//
// Ordered to bounce between cheap and pricey countries so consecutive days
// don't feel same-y, and to keep thinly-stocked countries apart: two of them in
// a row are what make the same item show up twice running (see the item eras).
// It is a cycle, so it is also rotated to start clear of the six countries that
// came up in the last week of the old schedule -- otherwise the seam at the
// changeover would have shown the UAE twice inside seven days.
const FULL_COUNTRIES: string[] = [
  "HU", "UY", "NG", "MY", "VN", "RO", "JP", "ZA", "CO", "CR",
  "TZ", "US", "PK", "CN", "PE", "AU", "EG", "AE", "IL", "BD",
  "NO", "PH", "NZ", "FR", "GB", "MX", "ES", "DE", "IT", "NL",
  "PL", "TR", "SE", "ID", "CZ", "IN", "AR", "CH", "KR", "IE",
  "TH", "PT", "CA", "BR", "SA", "CL", "GH", "SG", "LB",
];

// The seven-item schedule the game launched with.
const LAUNCH_ITEMS: string[] = [
  "big-mac", "milk-1l", "cappuccino", "eggs-12",
  "gasoline-1l", "coke-330ml", "apples-1kg",
];

// The 17-item catalogue, in force from day 30 (2026-08-23) to day 45.
//
// "lpg-1l" is a tombstone: autogas was dropped from the catalogue because
// almost nobody outside the handful of countries that run autogas fleets knows
// what a litre of it is. The id stays here to hold the list at 17, because
// shortening it would move `dayIndex % 17` and rewrite this whole era. No day
// in it ever resolved to LPG anyway -- the one day scheduled for it, day 40,
// was Tanzania, which has no LPG row and fell through to beer.
const FULL_ITEMS: string[] = [
  "mobile-data-1gb", "healthy-diet-day", "diesel-1l", "spirits-750ml",
  "milk-1l", "gasoline-1l", "apples-1kg", "cappuccino",
  "eggs-12", "eliquid-1ml", "lpg-1l", "natural-gas-100kwh",
  "coke-330ml", "big-mac", "beer-330ml", "electricity-100kwh",
  "cigarettes-20",
];

// The catalogue without LPG, in force from day 46 (2026-09-08).
//
// Same ordering rule as before: consecutive days move between categories
// (restaurant, grocery, fuel, utility, drink, telecom) instead of running three
// groceries in a row.
//
// The order also works against a second problem the sparse table creates. When a
// country does not stock the scheduled item the puzzle falls through to the next
// item it does have, so two thinly-stocked countries in a row can land on the
// same fallback and show the same item two days running. How often that happens
// depends entirely on this ordering against the country one: an unconsidered
// arrangement put it at 17% of days, and this pair holds it well under that. A
// test measures it, so a well-meant reshuffle cannot quietly undo it.
const ITEMS_NO_LPG: string[] = [
  "mobile-data-1gb", "healthy-diet-day", "diesel-1l", "spirits-750ml",
  "milk-1l", "gasoline-1l", "apples-1kg", "cappuccino",
  "eggs-12", "eliquid-1ml", "natural-gas-100kwh", "coke-330ml",
  "big-mac", "beer-330ml", "electricity-100kwh", "cigarettes-20",
];

export const ROTATION: Rotation = {
  epoch: "2026-07-01",
  startDate: "2026-07-24",
  countryEras: [
    { from: 0, order: LAUNCH_COUNTRIES },
    { from: 30, order: FULL_COUNTRIES },
  ],
  itemEras: [
    { from: 0, order: LAUNCH_ITEMS },
    // 2026-08-23, four days after the ten new items landed.
    { from: 30, order: FULL_ITEMS },
    // 2026-09-08, four days after LPG was dropped. Nothing already played, and
    // nothing inside the answer-suppression window, moves.
    { from: 46, order: ITEMS_NO_LPG },
  ],
};
