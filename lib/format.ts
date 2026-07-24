// Shared, framework-free formatting helpers used by both the interactive game
// (Reveal) and the statically rendered SEO reference pages, so the numbers and
// copy stay identical everywhere.

import type { PriceEntry } from "@/lib/puzzle";

/** "140 JPY", "45,000 LBP" — the price in its local currency. */
export function formatLocal(price: PriceEntry): string {
  const n = price.priceLocal.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  return `${n} ${price.localCurrency}`;
}

/** "$1.55" — the price in USD. */
export function formatUSD(priceUSD: number): string {
  return `$${priceUSD.toFixed(2)}`;
}

/**
 * Locale-aware currency formatting for the interactive client — it uses the
 * visitor's browser locale for separators and symbol placement. Use this in
 * client components only; the SEO reference pages use the en-US helpers above so
 * their HTML stays byte-for-byte deterministic across builds.
 */
export function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
  }
}

/** How much local working time the item costs, as a human sentence. */
export function affordanceLine(price: PriceEntry): string {
  const minutes = (price.priceUSD / price.avgHourlyWageUSD) * 60;
  if (minutes < 1) {
    return "Under a minute of the average local wage buys one.";
  }
  if (minutes < 90) {
    return `About ${Math.round(minutes)} minutes of the average local wage buys one.`;
  }
  const hours = minutes / 60;
  return `About ${hours.toFixed(1)} hours of the average local wage buys one.`;
}

/** URL-safe slug for a country, e.g. "United States" -> "united-states". */
export function countrySlug(countryName: string): string {
  return countryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
