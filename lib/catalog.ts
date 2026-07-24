// Read-only views over the bundled price data, used to generate the static SEO
// reference pages (/prices and /prices/[country]) and the sitemap.

import pricesData from "@/data/prices.json";
import { ACTIVE_ITEM } from "@/data/item";
import type { PriceEntry } from "@/lib/puzzle";
import { countrySlug } from "@/lib/format";

const PRICES = pricesData as PriceEntry[];

/** Every price row for the currently active item, cheapest first. */
export function activePriceEntries(): PriceEntry[] {
  return PRICES.filter((p) => p.itemId === ACTIVE_ITEM.id).sort(
    (a, b) => a.priceUSD - b.priceUSD
  );
}

/** Look up a single country's row by its URL slug. */
export function priceEntryBySlug(slug: string): PriceEntry | undefined {
  return activePriceEntries().find((p) => countrySlug(p.countryName) === slug);
}

/** All country slugs, for generateStaticParams and the sitemap. */
export function allCountrySlugs(): string[] {
  return activePriceEntries().map((p) => countrySlug(p.countryName));
}
