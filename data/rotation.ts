// Maps each day to a country from an ordered list plus a start date. Order the list
// by hand to shape the difficulty curve. Only include codes that have a row in prices.json.

export interface Rotation {
  /** Launch date, i.e. puzzle #1. Local date, "YYYY-MM-DD". */
  epoch: string;
  /** First day of the current item's rotation. Local date, "YYYY-MM-DD". */
  startDate: string;
  /** Ordered country codes; today's index = daysSince(startDate) % length. */
  countryOrder: string[];
}

// Ordered to bounce between cheap and pricey countries so consecutive days don't
// feel same-y.
export const ROTATION: Rotation = {
  epoch: "2026-07-01",
  startDate: "2026-07-01",
  countryOrder: [
    "US", "IN", "CH", "TH", "JP", "EG", "DE", "AR", "AU", "VN",
    "GB", "ZA", "BR", "KR", "NO", "ID", "FR", "SA", "MX", "PL",
    "NZ", "TR", "IT", "LB", "CA", "CN", "ES", "AE", "SE", "PT",
    "IE", "NL", "SG",
  ],
};
