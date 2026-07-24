/**
 * Offline data-acquisition helper for prices.json.
 *
 * Run locally (never at build or runtime):  pnpm collect-prices
 *
 * IMPORTANT — read before running:
 *  - Numbeo tracks "Coke/Pepsi (0.33L)" price and average net hourly wage per country,
 *    covering both the guess target and the wage stat. But its Terms of Service restrict
 *    automated scraping, and its data is crowd-sourced (so individual entries can be stale
 *    or wrong). Treat any collected number as a *candidate*, not ground truth.
 *  - Be polite: rate-limit to ~1 request / few seconds, cache responses under scripts/.cache/,
 *    and never hammer the source.
 *  - Manually spot-check ~10-15% of rows against a second source (local retail sites, XE for
 *    FX) before shipping. Drop any row you can't corroborate — do not ship unverified prices.
 *  - If the source blocks automated access, DON'T fight it. Fall back to hand-entering a
 *    curated ~15-30 country subset of real, verified numbers directly into data/prices.json.
 *
 * This scaffold defines the shape and the merge/validation step. Wire the actual fetch to
 * your chosen source (or a licensed dataset) where marked. It intentionally does no network
 * I/O by default so an accidental run can't scrape anything.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRICES_PATH = join(__dirname, "..", "data", "prices.json");
const ITEM_ID = "coke-330ml";

interface PriceEntry {
  itemId: string;
  countryCode: string;
  countryName: string;
  flag: string;
  priceUSD: number;
  priceLocal: number;
  localCurrency: string;
  avgHourlyWageUSD: number;
  source: string;
  sourceDate: string;
}

/** Basic sanity checks — reject obviously-broken rows before they reach the game. */
function isValid(e: PriceEntry): boolean {
  return (
    e.itemId === ITEM_ID &&
    /^[A-Z]{2}$/.test(e.countryCode) &&
    typeof e.countryName === "string" &&
    e.priceUSD > 0 &&
    e.priceUSD < 20 && // a 330ml Coke over $20 is a data error
    e.priceLocal > 0 &&
    typeof e.localCurrency === "string" &&
    e.avgHourlyWageUSD > 0
  );
}

/**
 * Fetch candidate rows from the chosen source.
 * Left unimplemented on purpose — plug in your source here, with rate-limiting and caching.
 */
async function fetchCandidates(): Promise<PriceEntry[]> {
  throw new Error(
    "fetchCandidates() is not wired up. Either implement a rate-limited, ToS-respecting\n" +
      "source here, or hand-enter verified rows directly into data/prices.json (recommended\n" +
      "for the MVP). See the header comment in this file."
  );
}

async function main() {
  const existing: PriceEntry[] = existsSync(PRICES_PATH)
    ? JSON.parse(readFileSync(PRICES_PATH, "utf8"))
    : [];

  const candidates = await fetchCandidates();

  // Merge by countryCode; new valid candidates overwrite older rows for the same country.
  const byCode = new Map(existing.map((e) => [e.countryCode, e]));
  let added = 0;
  let rejected = 0;
  for (const c of candidates) {
    if (!isValid(c)) {
      rejected++;
      continue;
    }
    byCode.set(c.countryCode, c);
    added++;
  }

  const merged = [...byCode.values()].sort((a, b) =>
    a.countryCode.localeCompare(b.countryCode)
  );

  writeFileSync(PRICES_PATH, JSON.stringify(merged, null, 2) + "\n");
  console.log(
    `prices.json: ${merged.length} countries (${added} added/updated, ${rejected} rejected).\n` +
      `Now spot-check ~10-15% by hand before shipping.`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
