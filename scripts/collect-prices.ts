/**
 * Helper for building data/prices.json. Run locally, not at build or runtime:
 *
 *   pnpm collect-prices
 *
 * It does no network requests by default. Wire fetchCandidates() to your source, or
 * just hand-enter verified rows into data/prices.json. Whatever the source, spot-check
 * a sample against a second reference before shipping, and drop rows you can't confirm.
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

/** Reject obviously broken rows before they reach the game. */
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

/** Fetch candidate rows. Plug in your source here. */
async function fetchCandidates(): Promise<PriceEntry[]> {
  throw new Error(
    "fetchCandidates() is not wired up. Implement a source here, or edit data/prices.json by hand."
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
    `prices.json: ${merged.length} countries (${added} added/updated, ${rejected} rejected).`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
