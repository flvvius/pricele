// Deterministic date → country mapping, computed from an ordered list + a start date
// (§4, simplified). Order the array by hand to control the difficulty curve across the
// month; no per-date rows to maintain. Only include codes that have a row in prices.json.

export interface Rotation {
  /** Global launch date — puzzle #1. Used for the puzzle number. UTC. */
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
