// Maps each day to a country: index = daysSince(startDate) % countryOrder.length.
//
// STABILITY RULE — read before editing:
//   To keep a given day's country from ever changing, only ever *append* new
//   countries to the end of countryOrder, and never move startDate or reorder
//   the existing entries. Because the day index is the raw day count until it
//   exceeds the list length, appending only affects days far in the future and
//   leaves today and the near-term schedule fixed. (Reordering the list or
//   changing its length under a fixed startDate is exactly what shifted the
//   puzzle from India to Lebanon before, so don't do that.)

export interface Rotation {
  /** Puzzle #1 date, for the puzzle counter only. Local date "YYYY-MM-DD". */
  epoch: string;
  /** Day 0 of the rotation, i.e. countryOrder[0]. Local date "YYYY-MM-DD". */
  startDate: string;
  /** Ordered country codes; today's index = daysSince(startDate) % length. */
  countryOrder: string[];
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
};
