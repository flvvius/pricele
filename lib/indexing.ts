// Which generated pages are substantial enough to ask a search engine to index.
//
// THE RULE. A templated page is indexed only if its data gives it something the
// neighbouring pages do not already say. Concretely:
//
//  - /prices/[country]: indexed when the country has at least
//    MIN_COUNTRY_ITEMS priced items. Below that the page is mostly the shared
//    template (intro, FAQ boilerplate, footer) wrapped around a handful of rows.
//  - /items/[item]: indexed when the item is priced in at least
//    MIN_ITEM_COUNTRIES countries. Below that the ranking is too short to be a
//    useful reference and overlaps the country pages it links to.
//  - /archive/[date]: indexed only the FIRST time an item+country pair is the
//    answer. A later day with the same pair renders the same price, same
//    ranking and same context, i.e. a near-duplicate of the earlier page.
//  - /games/answers/[date]: never indexed. Each is an auto-generated list of
//    that day's answers (one-line summaries, no editorial text) and every day
//    has the same shape; the /games/answers index stays indexed and links them.
//    /years/[year] and /history/[item] all clear 13+ sourced rows and stay in.
//  - /d/[n] and /week are noindex already (redirect/share shells, see those files).
//
// Pages that fail the rule still render normally (content is never removed);
// they carry robots noindex,follow and are left out of app/sitemap.ts.

import { pricesForCountry, pricesForItem, publishedArchiveDates } from "./catalog";
import { getPuzzleForISO } from "./puzzle";

export const MIN_COUNTRY_ITEMS = 10;
export const MIN_ITEM_COUNTRIES = 25;

export function isCountryIndexable(code: string): boolean {
  return pricesForCountry(code).length >= MIN_COUNTRY_ITEMS;
}

export function isItemIndexable(itemId: string): boolean {
  return pricesForItem(itemId).length >= MIN_ITEM_COUNTRIES;
}

/** Archive dates whose item+country pair has not appeared on an earlier date. */
export function indexableArchiveDates(now: Date = new Date()): Set<string> {
  const seen = new Set<string>();
  const out = new Set<string>();
  // publishedArchiveDates is newest first; walk oldest first so the original wins.
  for (const iso of [...publishedArchiveDates(now)].reverse()) {
    const p = getPuzzleForISO(iso);
    if (!p) continue;
    const key = `${p.item.id}:${p.price.countryCode}`;
    if (!seen.has(key)) out.add(iso);
    seen.add(key);
  }
  return out;
}

export function isArchiveDateIndexable(iso: string, now: Date = new Date()): boolean {
  return indexableArchiveDates(now).has(iso);
}
