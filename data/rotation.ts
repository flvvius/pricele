// Maps each day to one (item, country) pair:
//   country = countryOrder[(dayIndex - countryOrderFrom) % countryOrder.length]
//   item    = itemOrder   [(dayIndex - itemOrderFrom)    % itemOrder.length]
// where dayIndex = daysSince(startDate).
//
// The two lists advance independently. Their lengths (49 and 17) are coprime, so
// a given pair only recurs after 49 x 17 = 833 days: a different country every
// day, a different item every day, and the same combination about once every
// two and a half years.
//
// STABILITY RULE. Read this before editing:
//   Never move startDate, and never edit legacyCountryOrder or legacyItemOrder.
//   Those two hold the schedules the game was actually played on, and rewriting
//   one changes which puzzle a past day had, which breaks the archive and every
//   share card already posted. (Reordering the country list under a fixed
//   startDate is exactly what shifted the puzzle from India to Lebanon once
//   before.)
//
//   Both live lists work the same way. Each has a `...From` day index, set in
//   the future at the time it was set, from which the list takes over; every day
//   before it uses the frozen legacy list. That is what makes it safe to add
//   entries and to reorder freely, which appending alone is not: changing a
//   list's length moves `dayIndex % length` for every day at once.
//
//   Both changed over on day 30 (2026-08-23), when the catalogue grew from 7
//   items to 17 and the roster from 33 countries to 49. Next time, push the
//   current list onto the legacy chain and set a new `...From` in the future.
//   Do not edit a live list in place once its changeover day has passed.
//
//   One extra constraint on itemOrder: keep its length coprime with
//   countryOrder's, or the pairing collapses onto a short cycle and most
//   combinations never come up. With 49 countries, that rules out any item count
//   divisible by 7.

export interface Rotation {
  /** Puzzle #1 date, for the puzzle counter only. Local date "YYYY-MM-DD". */
  epoch: string;
  /** Day 0 of the rotation, i.e. countryOrder[0] + the day-0 item. Local date. */
  startDate: string;
  /** Ordered country codes, in force from `countryOrderFrom` onwards. */
  countryOrder: string[];
  /** First day index that uses `countryOrder`. Earlier days use the legacy list. */
  countryOrderFrom: number;
  /** The country schedule days 0..countryOrderFrom-1 were played with. Frozen. */
  legacyCountryOrder: string[];
  /** Ordered item ids, in force from `itemOrderFrom` onwards. */
  itemOrder: string[];
  /** First day index that uses `itemOrder`. Earlier days use the legacy list. */
  itemOrderFrom: number;
  /** The item schedule days 0..itemOrderFrom-1 were played with. Frozen. */
  legacyItemOrder: string[];
}

const COUNTRY_ORDER: string[] = [
  "HU", "UY", "NG", "MY", "VN", "RO", "JP", "ZA", "CO", "CR",
  "TZ", "US", "PK", "CN", "PE", "AU", "EG", "AE", "IL", "BD",
  "NO", "PH", "NZ", "FR", "GB", "MX", "ES", "DE", "IT", "NL",
  "PL", "TR", "SE", "ID", "CZ", "IN", "AR", "CH", "KR", "IE",
  "TH", "PT", "CA", "BR", "SA", "CL", "GH", "SG", "LB",
];

export const ROTATION: Rotation = {
  epoch: "2026-07-01",
  startDate: "2026-07-24",
  // Ordered to bounce between cheap and pricey countries so consecutive days
  // don't feel same-y, and to keep thinly-stocked countries apart: two of them
  // in a row are what make the same item show up twice running (see itemOrder).
  // It is a cycle, so it is also rotated to start clear of the six countries
  // that came up in the last week of the old schedule -- otherwise the seam at
  // the changeover would have shown the UAE twice inside seven days.
  countryOrder: COUNTRY_ORDER,
  countryOrderFrom: 30,
  // The 33-country schedule the game launched with. India was day 0
  // (2026-07-24). Never edit this.
  legacyCountryOrder: [
    "IN", "US", "TH", "DE", "EG", "NO", "MX", "JP", "AR", "CH",
    "VN", "GB", "ZA", "AU", "ID", "FR", "TR", "BR", "SA", "IE",
    "CN", "KR", "NZ", "PL", "LB", "IT", "AE", "SE", "PT", "CA",
    "ES", "NL", "SG",
  ],
  // Ordered so consecutive days move between categories (restaurant, grocery,
  // fuel, utility, drink, telecom) instead of running three groceries in a row.
  //
  // Both lists are also ordered against a second problem the sparse table
  // creates. When a country does not stock the scheduled item the puzzle falls
  // through to the next item it does have, so two thinly-stocked countries in a
  // row can land on the same fallback and show the same item two days running.
  // How often that happens depends entirely on these two orderings: an
  // unconsidered arrangement put it at 17% of days, and this pair holds it
  // under 2.5%. A test measures it, so a well-meant reshuffle cannot quietly
  // undo it.
  itemOrder: [
    "mobile-data-1gb", "healthy-diet-day", "diesel-1l", "spirits-750ml",
    "milk-1l", "gasoline-1l", "apples-1kg", "cappuccino",
    "eggs-12", "eliquid-1ml", "lpg-1l", "natural-gas-100kwh",
    "coke-330ml", "big-mac", "beer-330ml", "electricity-100kwh",
    "cigarettes-20",
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
