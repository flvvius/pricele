// Maps each day to one (item, country) pair:
//   country = countryOrder[dayIndex % countryOrder.length]
//   item    = itemOrder[dayIndex % itemOrder.length]
// where dayIndex = daysSince(startDate).
//
// The two lists advance independently. Their lengths (33 and 7) are coprime, so
// a given pair only recurs after 33 x 7 = 231 days: a different country every
// day, a different item every day, and the same combination about twice a year.
//
// STABILITY RULE. Read this before editing:
//   To keep a given day's puzzle from ever changing, only ever *append* to
//   countryOrder or itemOrder, and never move startDate or reorder the existing
//   entries. Appending changes a list's length, and therefore the modulo for
//   every day past the current cycle, so append at the END only, never insert
//   in the middle. (Reordering countryOrder under a fixed startDate is exactly
//   what shifted the puzzle from India to Lebanon once before.)
//
//   One extra constraint on itemOrder: keep its length coprime with
//   countryOrder's, or the pairing collapses onto a short cycle and most
//   combinations never come up. With 33 countries, avoid item counts of 11, 22
//   and 33; lengths 8, 9 and 10 are all fine.

export interface Rotation {
  /** Puzzle #1 date, for the puzzle counter only. Local date "YYYY-MM-DD". */
  epoch: string;
  /** Day 0 of the rotation, i.e. countryOrder[0] + itemOrder[0]. Local date. */
  startDate: string;
  /** Ordered country codes; today's index = daysSince(startDate) % length. */
  countryOrder: string[];
  /** Ordered item ids; today's index = daysSince(startDate) % length. */
  itemOrder: string[];
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
  // fuel) instead of running three groceries in a row. Append only.
  itemOrder: [
    "big-mac", "milk-1l", "cappuccino", "eggs-12",
    "gasoline-1l", "coke-330ml", "apples-1kg",
  ],
};
