// Maps each day to a country from an ordered list plus a start date. Order the list
// by hand to shape the difficulty curve. Only include codes that have a row in prices.json.

export interface Rotation {
  /** Launch date, i.e. puzzle #1. UTC. */
  epoch: string;
  /** First day of the current item's rotation. UTC. */
  startDate: string;
  /** Ordered country codes; today's index = daysSince(startDate) % length. */
  countryOrder: string[];
}

export const ROTATION: Rotation = {
  epoch: "2026-07-01",
  startDate: "2026-07-01",
  countryOrder: ["US", "JP", "BR", "IN", "NO", "MX", "VN", "CH", "EG", "LB"],
};
