/**
 * Refresh the Big Mac rows in data/prices.json from The Economist's published
 * dataset. Run locally, never at build or runtime:
 *
 *   pnpm refresh-big-mac            # rewrite the big-mac rows in place
 *   pnpm refresh-big-mac --check    # exit non-zero if they're out of date
 *
 * WHY ONLY BIG MAC
 *   Of the seven items, only this one has a machine-readable upstream that is
 *   published for reuse. The Economist puts the raw index on GitHub under
 *   TheEconomist/big-mac-data. The Numbeo-sourced items (cappuccino, milk,
 *   eggs, apples, gasoline) are collected by hand from Numbeo's country price
 *   rankings, because bulk-scraping them is both rate-limited and against their
 *   terms. Coca-Cola rows are a hand-curated table. Those three groups are
 *   edited directly in data/prices.json; this script leaves them untouched.
 *
 * The euro area is published as one price rather than per member state, so
 * every eurozone country in the game receives that same figure, labelled as
 * such. See app/methodology for how this is disclosed to readers.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRICES_PATH = join(__dirname, "..", "data", "prices.json");
const SNAPSHOT_PATH = join(
  __dirname,
  "..",
  "data",
  "sources",
  "big-mac-full-index.csv"
);
const SOURCE_URL =
  "https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data/big-mac-full-index.csv";

const ITEM_ID = "big-mac";

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

/** ISO-2 country code -> the Economist's iso_a3. EUZ is the euro-area row. */
const ISO3: Record<string, string> = {
  AE: "ARE", AR: "ARG", AU: "AUS", BR: "BRA", CA: "CAN", CH: "CHE",
  CN: "CHN", DE: "EUZ", EG: "EGY", ES: "EUZ", FR: "EUZ", GB: "GBR",
  ID: "IDN", IE: "EUZ", IN: "IND", IT: "EUZ", JP: "JPN", KR: "KOR",
  LB: "LBN", MX: "MEX", NL: "EUZ", NO: "NOR", NZ: "NZL", PL: "POL",
  PT: "EUZ", SA: "SAU", SE: "SWE", SG: "SGP", TH: "THA", TR: "TUR",
  US: "USA", VN: "VNM", ZA: "ZAF",
};

interface Row {
  local_price: number;
  dollar_price: number;
}

function parseLatest(csv: string): { date: string; rows: Map<string, Row> } {
  const lines = csv.trim().split("\n");
  const header = lines[0].split(",");
  const col = (name: string) => {
    const i = header.indexOf(name);
    if (i < 0) throw new Error(`missing column "${name}" in the upstream CSV`);
    return i;
  };
  const [iDate, iIso, iLocal, iDollar] = [
    col("date"),
    col("iso_a3"),
    col("local_price"),
    col("dollar_price"),
  ];

  const parsed = lines.slice(1).map((l) => l.split(","));
  const latest = parsed
    .map((f) => f[iDate])
    .sort()
    .at(-1);
  if (!latest) throw new Error("upstream CSV has no rows");

  const rows = new Map<string, Row>();
  for (const f of parsed) {
    if (f[iDate] !== latest) continue;
    rows.set(f[iIso], {
      local_price: Number(f[iLocal]),
      dollar_price: Number(f[iDollar]),
    });
  }
  return { date: latest, rows };
}

async function main() {
  const check = process.argv.includes("--check");
  const offline = process.argv.includes("--offline");

  let csv: string;
  if (offline) {
    csv = readFileSync(SNAPSHOT_PATH, "utf8");
  } else {
    const res = await fetch(SOURCE_URL);
    if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
    csv = await res.text();
    writeFileSync(SNAPSHOT_PATH, csv);
  }

  const { date, rows } = parseLatest(csv);
  const edition = date.slice(0, 7); // "2026-01", stored in sourceDate
  // The source string is shown to readers next to the price, so it gets the
  // human-readable form rather than the ISO one.
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const label = `${MONTHS[Number(date.slice(5, 7)) - 1]} ${date.slice(0, 4)}`;
  console.log(`Economist edition: ${date} (${rows.size} economies)`);

  const prices: PriceEntry[] = JSON.parse(readFileSync(PRICES_PATH, "utf8"));

  let changed = 0;
  let missing = 0;
  for (const entry of prices) {
    if (entry.itemId !== ITEM_ID) continue;
    const iso3 = ISO3[entry.countryCode];
    const row = iso3 ? rows.get(iso3) : undefined;
    if (!row) {
      console.warn(`  no upstream row for ${entry.countryCode} (${iso3})`);
      missing++;
      continue;
    }
    const priceUSD = Math.round(row.dollar_price * 100) / 100;
    const priceLocal = Math.round(row.local_price * 100) / 100;
    const source =
      iso3 === "EUZ"
        ? `The Economist Big Mac Index (euro-area price), ${label}`
        : `The Economist Big Mac Index, ${label}`;

    if (
      entry.priceUSD !== priceUSD ||
      entry.priceLocal !== priceLocal ||
      entry.source !== source ||
      entry.sourceDate !== edition
    ) {
      changed++;
      entry.priceUSD = priceUSD;
      entry.priceLocal = priceLocal;
      entry.source = source;
      entry.sourceDate = edition;
    }
  }

  if (check) {
    if (changed > 0) {
      console.error(
        `\n${changed} Big Mac row(s) are stale. Run \`pnpm refresh-big-mac\` and commit the result.`
      );
      process.exit(1);
    }
    console.log("Big Mac rows are up to date.");
    return;
  }

  if (changed > 0) {
    writeFileSync(PRICES_PATH, JSON.stringify(prices, null, 1) + "\n");
  }
  console.log(
    `data/prices.json: ${changed} row(s) updated, ${missing} without an upstream match.`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
