// Maps each day to one (item, country) pair:
//   country = countryOrder[dayIndex % countryOrder.length]
//   item    = itemOrder[(dayIndex - itemOrderFrom) % itemOrder.length]
// where dayIndex = daysSince(startDate).
//
// The two lists advance independently. Their lengths (33 and 17) are coprime, so
// a given pair only recurs after 33 x 17 = 561 days: a different country every
// day, a different item every day, and the same combination less than twice in
// three years.
//
// STABILITY RULE. Read this before editing:
//   To keep a given day's puzzle from ever changing, only ever *append* to
//   countryOrder, and never move startDate or reorder the existing entries.
//   Appending changes a list's length, and therefore the modulo for every day
//   past the current cycle, so append at the END only, never insert in the
//   middle. (Reordering countryOrder under a fixed startDate is exactly what
//   shifted the puzzle from India to Lebanon once before.)
//
//   itemOrder cannot follow that rule, because the item catalogue grew from 7
//   entries to 17 and no amount of appending leaves `dayIndex % length` alone.
//   So the old schedule is frozen in legacyItemOrder and the new one takes over
//   from itemOrderFrom, a day index in the future at the time it was set. Every
//   day before that keeps the item it was played with; every day after it uses
//   the full catalogue. If the catalogue ever changes again, do the same thing:
//   push the current itemOrder onto the legacy chain rather than editing it.
//
//   One extra constraint on itemOrder: keep its length coprime with
//   countryOrder's, or the pairing collapses onto a short cycle and most
//   combinations never come up. With 33 countries, that rules out any item count
//   divisible by 3 or 11.

export interface Rotation {
  /** Puzzle #1 date, for the puzzle counter only. Local date "YYYY-MM-DD". */
  epoch: string;
  /** Day 0 of the rotation, i.e. countryOrder[0] + the day-0 item. Local date. */
  startDate: string;
  /** Ordered country codes; today's index = daysSince(startDate) % length. */
  countryOrder: string[];
  /** Ordered item ids, in force from `itemOrderFrom` onwards. */
  itemOrder: string[];
  /** First day index that uses `itemOrder`. Earlier days use the legacy list. */
  itemOrderFrom: number;
  /** The item schedule days 0..itemOrderFrom-1 were played with. Frozen. */
  legacyItemOrder: string[];
}

export const ROTATION: Rotation = {
  epoch: "2026-07-01",
  startDate: "2026-07-24",
  // India is day 0 (2026-07-24). The rest are ordered to bounce between cheap
  // and pricey countries so consecutive days don't feel same-y. Append only.
  countryOrder: [
    "IN", "US", "TH", "DE", "EG", "NO", "MX", "JP", "AR", "CH",
    "VN", "GB", "ZA", "AU", "ID", "FR", "TR", "BR", "SA", "IE",
    "CN", "KR", "NZ", "PL", "LB", "IT", "AE", "SE", "PT", "CA",
    "ES", "NL", "SG",
  ],
  // Ordered so consecutive days move between categories (restaurant, grocery,
  // fuel, utility, drink, telecom) instead of running three groceries in a row.
  itemOrder: [
    "big-mac", "milk-1l", "electricity-100kwh", "cappuccino",
    "cigarettes-20", "eggs-12", "gasoline-1l", "beer-330ml",
    "apples-1kg", "mobile-data-1gb", "diesel-1l", "coke-330ml",
    "natural-gas-100kwh", "spirits-750ml", "healthy-diet-day",
    "lpg-1l", "eliquid-1ml",
  ],
  // 2026-08-23, four days after the ten new items landed. Nothing already
  // played, and nothing inside the answer-suppression window, moves.
  itemOrderFrom: 30,
  // The seven-item schedule the game launched with. Never edit this.
  legacyItemOrder: [
    "big-mac", "milk-1l", "cappuccino", "eggs-12",
    "gasoline-1l", "coke-330ml", "apples-1kg",
  ],
};
