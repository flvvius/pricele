/**
 * Refresh every price row that has a machine-readable, openly published
 * upstream. Run locally, never at build or runtime:
 *
 *   pnpm refresh-open-prices            # rewrite those rows in place
 *   pnpm refresh-open-prices --check    # exit non-zero if any of them is stale
 *   pnpm refresh-open-prices --offline  # rebuild from the committed snapshot
 *
 * WHAT THIS COVERS, AND WHY IT IS SEPARATE FROM refresh-big-mac
 *   The Big Mac has its own script because its upstream is a single CSV with a
 *   stable schema. Everything here is a different shape of problem: four
 *   different publishers, three different transports, and one figure that has
 *   to be converted out of local currency before it means anything. Keeping it
 *   in one place means there is exactly one file to read when a publisher
 *   changes their page and a row goes missing.
 *
 *   The rest of the table -- the Numbeo-sourced items (cappuccino, milk, eggs,
 *   apples, gasoline) and the hand-curated Coca-Cola rows -- has no upstream
 *   that may be fetched in bulk, and is still edited directly in
 *   data/prices.json. This script never touches those rows.
 *
 * SOURCES
 *   GlobalPetrolPrices.com   diesel, electricity, natural gas.
 *                            Weekly for fuels, quarterly for the two utilities.
 *                            Their robots.txt is `Allow: /`, and each country
 *                            page publishes the local-currency price next to
 *                            the dollar one, which is why this fetches one page
 *                            per country instead of scraping the ranking chart.
 *   WHO Global Health        cigarettes, beer, spirits, vape e-liquid. The 2024
 *   Observatory (OData)      round of the tobacco and alcohol/SSB tax surveys,
 *                            which publish a standardised retail price for the
 *                            most sold brand in local currency, US$ and PPP$.
 *   Cable.co.uk              1 GB of mobile data, June 2026 survey, 5,603 plans
 *                            across 237 countries. US$ only.
 *   World Bank / FAO         the cost of a healthy diet, from the Food Prices
 *   Food Prices for          for Nutrition database. Published per person per
 *   Nutrition                day in local currency, so it is converted here at
 *                            the World Bank's own official exchange rate for
 *                            the same year (PA.NUS.FCRF). Both halves are
 *                            published figures; the multiplication is ours, and
 *                            /methodology says so.
 *
 * UNITS
 *   Two rows are rescaled on the way in, and nowhere else. Electricity and
 *   natural gas are published per kWh, which lands between $0.02 and $0.40 and
 *   collapses to two identical-looking figures once the UI rounds to cents. Both
 *   are stored per 100 kWh -- the same number, times one hundred, which is also
 *   roughly a small flat's monthly draw. Every other figure is stored exactly as
 *   published.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { COUNTRY_META } from "../data/countries";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRICES_PATH = join(__dirname, "..", "data", "prices.json");
const SNAPSHOT_PATH = join(
  __dirname,
  "..",
  "data",
  "sources",
  "open-prices.json"
);

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

interface PriceEntry {
  itemId: string;
  countryCode: string;
  countryName: string;
  flag: string;
  priceUSD: number;
  /** Omitted when the publisher only gives a dollar figure. Never converted. */
  priceLocal?: number;
  localCurrency: string;
  avgHourlyWageUSD: number;
  source: string;
  sourceDate: string;
}

/** One harvested figure, before it is merged into the price table. */
interface Harvested {
  itemId: string;
  countryCode: string;
  priceUSD: number;
  priceLocal?: number;
  /** The currency the publisher quoted `priceLocal` in, for the sanity check. */
  localCurrency?: string;
  source: string;
  sourceDate: string;
}

interface SourceNames {
  /** GlobalPetrolPrices path segment, e.g. "South-Korea". */
  gpp: string;
  /** ISO 3166-1 alpha-3, for the WHO and World Bank APIs. */
  iso3: string;
  /** Cable.co.uk's spelling, where it differs from the country's name. */
  cable?: string;
}

/**
 * What each publisher calls each country. Deliberately explicit: a fuzzy match
 * here would silently attach Niger's diesel price to Nigeria.
 *
 * The countries themselves come from COUNTRY_META in data/countries.ts; this
 * only holds the aliases, and a country missing from it is a hard error rather
 * than a country that quietly gets no rows.
 */
const SOURCE_NAMES: Record<string, SourceNames> = {
  AE: { gpp: "United-Arab-Emirates", iso3: "ARE" },
  AR: { gpp: "Argentina", iso3: "ARG" },
  AU: { gpp: "Australia", iso3: "AUS" },
  BD: { gpp: "Bangladesh", iso3: "BGD" },
  BR: { gpp: "Brazil", iso3: "BRA" },
  CA: { gpp: "Canada", iso3: "CAN" },
  CH: { gpp: "Switzerland", iso3: "CHE" },
  CL: { gpp: "Chile", iso3: "CHL" },
  CN: { gpp: "China", iso3: "CHN" },
  CO: { gpp: "Colombia", iso3: "COL" },
  CR: { gpp: "Costa-Rica", iso3: "CRI" },
  CZ: { gpp: "Czech-Republic", iso3: "CZE", cable: "Czech Republic" },
  DE: { gpp: "Germany", iso3: "DEU" },
  EG: { gpp: "Egypt", iso3: "EGY" },
  ES: { gpp: "Spain", iso3: "ESP" },
  FR: { gpp: "France", iso3: "FRA" },
  GB: { gpp: "United-Kingdom", iso3: "GBR" },
  GH: { gpp: "Ghana", iso3: "GHA" },
  HU: { gpp: "Hungary", iso3: "HUN" },
  ID: { gpp: "Indonesia", iso3: "IDN" },
  IE: { gpp: "Ireland", iso3: "IRL" },
  IL: { gpp: "Israel", iso3: "ISR" },
  IN: { gpp: "India", iso3: "IND" },
  IT: { gpp: "Italy", iso3: "ITA" },
  JP: { gpp: "Japan", iso3: "JPN" },
  KR: { gpp: "South-Korea", iso3: "KOR" },
  LB: { gpp: "Lebanon", iso3: "LBN" },
  MX: { gpp: "Mexico", iso3: "MEX" },
  MY: { gpp: "Malaysia", iso3: "MYS" },
  NG: { gpp: "Nigeria", iso3: "NGA" },
  NL: { gpp: "Netherlands", iso3: "NLD", cable: "The Netherlands" },
  NO: { gpp: "Norway", iso3: "NOR" },
  NZ: { gpp: "New-Zealand", iso3: "NZL" },
  PE: { gpp: "Peru", iso3: "PER" },
  PH: { gpp: "Philippines", iso3: "PHL" },
  PK: { gpp: "Pakistan", iso3: "PAK" },
  PL: { gpp: "Poland", iso3: "POL" },
  PT: { gpp: "Portugal", iso3: "PRT" },
  RO: { gpp: "Romania", iso3: "ROU" },
  SA: { gpp: "Saudi-Arabia", iso3: "SAU" },
  SE: { gpp: "Sweden", iso3: "SWE" },
  SG: { gpp: "Singapore", iso3: "SGP" },
  TH: { gpp: "Thailand", iso3: "THA" },
  TR: { gpp: "Turkey", iso3: "TUR" },
  TZ: { gpp: "Tanzania", iso3: "TZA" },
  US: { gpp: "USA", iso3: "USA" },
  UY: { gpp: "Uruguay", iso3: "URY" },
  VN: { gpp: "Vietnam", iso3: "VNM" },
  ZA: { gpp: "South-Africa", iso3: "ZAF" },
};

const CODES = Object.keys(COUNTRY_META);

for (const code of CODES) {
  if (!SOURCE_NAMES[code]) {
    throw new Error(
      `${code} is in COUNTRY_META but has no publisher aliases in SOURCE_NAMES`
    );
  }
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

const UA =
  "pricele-refresh/1.0 (+https://www.pricele.online; one request per country)";

async function getText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.text();
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Markup to one line of plain text, so a single regex can read the prose. */
function text(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function num(raw: string): number {
  return Number(raw.replace(/,/g, ""));
}

/** Round to `dp` decimals without the float dust that JSON.stringify prints. */
function round(value: number, dp: number): number {
  return Number(value.toFixed(dp));
}

// ---------------------------------------------------------------------------
// GlobalPetrolPrices
// ---------------------------------------------------------------------------

/**
 * One country page per product. Each one states the price twice, once in the
 * local currency and once in dollars, from the same collection date, so a row
 * built from it is internally consistent in a way that reading the ranking
 * chart and converting would not be.
 */
async function harvestGlobalPetrolPrices(): Promise<Harvested[]> {
  interface Product {
    itemId: string;
    path: string;
    /** Pulls [currency, local, usd, dateLabel] out of the page text. */
    read: (t: string) => [string, number, number, string] | null;
    /** Multiplier applied to both figures; see the UNITS note at the top. */
    scale: number;
  }

  // A bare number, not swallowing the sentence's full stop. Written once
  // because every one of these pages ends a price with one.
  const N = String.raw`([\d,]+(?:\.\d+)?)`;

  const products: Product[] = [
    {
      itemId: "diesel-1l",
      path: "diesel_prices",
      scale: 1,
      // A country whose currency is the dollar gets one figure, not two.
      read: (t) => {
        const m = t.match(
          new RegExp(
            `price of diesel fuel in .+? is (?:([A-Z]{3}) ${N} per liter or )?USD ${N} per liter`
          )
        );
        const d = t.match(/latest update from (\d{2}-[A-Za-z]{3}-\d{4})/);
        if (!m || !d) return null;
        return m[1]
          ? [m[1], num(m[2]), num(m[3]), d[1]]
          : ["USD", num(m[3]), num(m[3]), d[1]];
      },
    },
    {
      itemId: "electricity-100kwh",
      path: "electricity_prices",
      scale: 100,
      read: (t) => {
        const m = t.match(
          new RegExp(
            `residential electricity price in .+? is (?:([A-Z]{3}) ${N} per kWh or )?USD ${N}`
          )
        );
        const d = t.match(/collected in ([A-Z][a-z]+ \d{4})/);
        if (!m || !d) return null;
        return m[1]
          ? [m[1], num(m[2]), num(m[3]), d[1]]
          : ["USD", num(m[3]), num(m[3]), d[1]];
      },
    },
    {
      itemId: "natural-gas-100kwh",
      path: "natural_gas_prices",
      scale: 100,
      // This page prints a table rather than a sentence, names the local
      // currency in words ("Japanese Yen"), and omits the business column
      // where there is no business tariff. So only the household figures are
      // read, and the currency is taken from the price table instead.
      read: (t) => {
        const m = t.match(
          new RegExp(
            `Household, kWh Business, kWh [A-Za-z.\\s]+? ${N}(?: [\\d.,]+)? U\\.S\\. Dollar ${N}`
          )
        );
        const d = t.match(/, ([A-Z][a-z]+ \d{4}): The price of natural gas/);
        return m && d ? ["", num(m[1]), num(m[2]), d[1]] : null;
      },
    },
  ];

  const out: Harvested[] = [];
  for (const p of products) {
    let found = 0;
    for (const code of CODES) {
      const url = `https://www.globalpetrolprices.com/${SOURCE_NAMES[code].gpp}/${p.path}/`;
      let body = "";
      try {
        body = await getText(url);
      } catch {
        // A country with no page for this product simply has no row.
      }
      await sleep(250);
      if (!body) continue;
      const parsed = p.read(text(body));
      if (!parsed) continue;
      const [currency, local, usd, date] = parsed;
      if (!(usd > 0) || !(local > 0)) continue;
      found++;
      out.push({
        itemId: p.itemId,
        countryCode: code,
        priceUSD: round(usd * p.scale, 2),
        priceLocal: round(local * p.scale, 2),
        localCurrency: currency || undefined,
        source: `GlobalPetrolPrices.com, ${date}`,
        sourceDate: gppSourceDate(date),
      });
    }
    console.log(`  ${p.itemId}: ${found} countries`);
  }
  return out;
}

/** "17-Aug-2026" or "December 2025" -> "2026-08". */
function gppSourceDate(label: string): string {
  const MONTHS = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
  ];
  const iso = label.match(/^\d{2}-([A-Za-z]{3})-(\d{4})$/);
  if (iso) {
    const m = MONTHS.indexOf(iso[1].toLowerCase()) + 1;
    return `${iso[2]}-${String(m).padStart(2, "0")}`;
  }
  const long = label.match(/^([A-Za-z]+) (\d{4})$/);
  if (long) {
    const m = MONTHS.indexOf(long[1].slice(0, 3).toLowerCase()) + 1;
    return `${long[2]}-${String(m).padStart(2, "0")}`;
  }
  throw new Error(`unrecognised GlobalPetrolPrices date: ${label}`);
}

// ---------------------------------------------------------------------------
// WHO Global Health Observatory
// ---------------------------------------------------------------------------

interface GhoRow {
  SpatialDim: string;
  TimeDim: number;
  Dim1: string | null;
  Dim2: string | null;
  Dim3: string | null;
  Value: string | null;
  NumericValue: number | null;
}

const WHO_YEAR = 2024;

/**
 * Four rows out of two WHO tax surveys. Both publish the same three figures for
 * every product -- local currency, US$ at the official rate, and PPP$ -- for a
 * standardised container, which is what makes them comparable across countries
 * and worth putting in the game.
 */
async function harvestWho(): Promise<Harvested[]> {
  const out: Harvested[] = [];

  // --- Tobacco and nicotine (MPOWER "raise taxes" module) -------------------
  const tob = await getJson<{ value: GhoRow[] }>(
    `https://ghoapi.azureedge.net/api/TOBACCO_MPOWER_R_PRICE?$filter=TimeDim%20eq%20${WHO_YEAR}`
  );
  const tobacco: { itemId: string; product: string; label: string }[] = [
    {
      itemId: "cigarettes-20",
      product: "TOBACCO_NICOTINE_PRODUCT_CIGARETTE_MOSTSOLD",
      label: "most sold brand",
    },
    {
      itemId: "eliquid-1ml",
      product: "TOBACCO_NICOTINE_PRODUCT_ELIQUID_CLOSED_DISPOSABLE_CHEAPEST",
      label: "cheapest disposable device",
    },
  ];
  for (const t of tobacco) {
    const pick = (dim: string) =>
      new Map(
        tob.value
          .filter((r) => r.Dim2 === t.product && r.Dim1 === dim)
          .map((r) => [r.SpatialDim, r] as const)
      );
    const usd = pick("TOBACCO_INDICATOR_PRICE_IN_USD");
    const local = pick("TOBACCO_INDICATOR_PRICE_IN_CURRENCY");
    const currency = pick("TOBACCO_INDICATOR_CURRENCY_LOCAL");
    let found = 0;
    for (const code of CODES) {
      const iso3 = SOURCE_NAMES[code].iso3;
      const u = usd.get(iso3)?.NumericValue;
      if (u == null || !(u > 0)) continue;
      found++;
      out.push({
        itemId: t.itemId,
        countryCode: code,
        priceUSD: round(u, 2),
        priceLocal: local.get(iso3)?.NumericValue ?? undefined,
        localCurrency: currency.get(iso3)?.Value ?? undefined,
        source: `WHO Global Health Observatory, tobacco tax survey ${WHO_YEAR} (${t.label})`,
        sourceDate: String(WHO_YEAR),
      });
    }
    console.log(`  ${t.itemId}: ${found} countries`);
  }

  // --- Alcohol and sugar-sweetened beverages -------------------------------
  const bev = await getJson<{ value: GhoRow[] }>(
    `https://ghoapi.azureedge.net/api/TAXBEV_PRICE?$filter=TimeDim%20eq%20${WHO_YEAR}`
  );
  const drinks: { itemId: string; product: string }[] = [
    { itemId: "beer-330ml", product: "BEVERAGE_BEV_BEER" },
    { itemId: "spirits-750ml", product: "BEVERAGE_BEV_SPIRITS" },
  ];
  for (const d of drinks) {
    const pick = (dim: string) =>
      new Map(
        bev.value
          .filter((r) => r.Dim2 === d.product && r.Dim3 === dim)
          .map((r) => [r.SpatialDim, r] as const)
      );
    const usd = pick("PRICE_PRICE_IN_USD");
    // Quoted as one string, e.g. "ILS 5.52", rather than a value and a code.
    const local = pick("PRICE_PRICE_IN_CURRENCY");
    let found = 0;
    for (const code of CODES) {
      const iso3 = SOURCE_NAMES[code].iso3;
      const u = usd.get(iso3)?.NumericValue;
      if (u == null || !(u > 0)) continue;
      found++;
      const raw = local.get(iso3)?.Value ?? "";
      const m = raw.match(/^([A-Z]{3})\s+([\d.,]+)$/);
      out.push({
        itemId: d.itemId,
        countryCode: code,
        priceUSD: round(u, 2),
        priceLocal: m ? num(m[2]) : undefined,
        localCurrency: m ? m[1] : undefined,
        source: `WHO Global Health Observatory, alcohol tax survey ${WHO_YEAR} (most sold brand)`,
        sourceDate: String(WHO_YEAR),
      });
    }
    console.log(`  ${d.itemId}: ${found} countries`);
  }

  return out;
}

// ---------------------------------------------------------------------------
// Cable.co.uk mobile data
// ---------------------------------------------------------------------------

/** The ranking table, which is plain server-rendered HTML. US$ only. */
async function harvestMobileData(
  countryNames: Map<string, string>
): Promise<Harvested[]> {
  const html = await getText(
    "https://www.cable.co.uk/mobiles/worldwide-data-pricing/"
  );
  // The page prints no collection date in its prose, and third-party writeups
  // relabel the same figures with whatever the current year is. The publisher's
  // own dataset download is versioned by edition, so that path is the only
  // statement of vintage on the page worth trusting. No default: a wrong year
  // printed under a price is worse than a failed refresh.
  const year = html.match(
    /worldwide-data-pricing\/(\d{4})\/worldwide_mobile_data_pricing_data\.xlsx/
  )?.[1];
  if (!year) {
    throw new Error(
      "cable.co.uk: could not read the edition year from the dataset download link"
    );
  }

  const start = html.indexOf('<table class="content_table text-left">');
  if (start < 0) throw new Error("cable.co.uk: ranking table not found");
  const table = html.slice(start, html.indexOf("</table>", start));

  const byName = new Map<string, number>();
  for (const row of table.match(/<tr>[\s\S]*?<\/tr>/g) ?? []) {
    const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) =>
      text(c[1])
    );
    if (cells.length < 3) continue;
    const price = Number(cells[2]);
    if (!Number.isFinite(price) || price <= 0) continue;
    byName.set(cells[1], price);
  }

  const out: Harvested[] = [];
  for (const code of CODES) {
    const name = SOURCE_NAMES[code].cable ?? countryNames.get(code) ?? "";
    const price = byName.get(name);
    if (price == null) continue;
    out.push({
      itemId: "mobile-data-1gb",
      countryCode: code,
      priceUSD: round(price, 2),
      source: `Cable.co.uk worldwide mobile data pricing, ${year}`,
      sourceDate: year,
    });
  }
  console.log(`  mobile-data-1gb: ${out.length} countries`);
  return out;
}

// ---------------------------------------------------------------------------
// World Bank / FAO Food Prices for Nutrition
// ---------------------------------------------------------------------------

interface WbSeriesRow {
  variable: { concept: string; id: string; value: string }[];
  value: number | null;
}

/**
 * The cost of the cheapest local basket that meets dietary guidelines, per
 * person per day. Published in local currency only, so it is converted at the
 * World Bank's own official exchange rate for the same year.
 */
async function harvestHealthyDiet(): Promise<Harvested[]> {
  const lcu = new Map<string, { year: number; value: number }>();
  for (let page = 1; ; page++) {
    const d = await getJson<{
      pages: number;
      source: { data: WbSeriesRow[] };
    }>(
      `https://api.worldbank.org/v2/sources/88/country/all/series/CoHD_LCU/time/all/data?format=json&per_page=1000&page=${page}`
    );
    for (const row of d.source.data) {
      if (row.value == null) continue;
      const by = Object.fromEntries(row.variable.map((v) => [v.concept, v]));
      const iso3 = by.Country?.id;
      const year = Number(by.Time?.id?.replace("YR", ""));
      if (!iso3 || !Number.isFinite(year)) continue;
      const prev = lcu.get(iso3);
      if (!prev || year > prev.year) lcu.set(iso3, { year, value: row.value });
    }
    if (page >= d.pages) break;
  }

  // Official exchange rate, LCU per US$, period average. `mrnev=1` takes each
  // country's most recent non-empty year, which matters for the handful that
  // report late.
  const [, fxRows] = await getJson<
    [unknown, { countryiso3code: string; date: string; value: number | null }[]]
  >(
    "https://api.worldbank.org/v2/country/all/indicator/PA.NUS.FCRF?format=json&per_page=400&mrnev=1"
  );
  const fx = new Map<string, { year: number; rate: number }>();
  for (const r of fxRows ?? []) {
    if (r.value == null || !(r.value > 0)) continue;
    fx.set(r.countryiso3code, { year: Number(r.date), rate: r.value });
  }

  const out: Harvested[] = [];
  for (const code of CODES) {
    const iso3 = SOURCE_NAMES[code].iso3;
    const cost = lcu.get(iso3);
    const rate = fx.get(iso3);
    if (!cost || !rate) continue;
    out.push({
      itemId: "healthy-diet-day",
      countryCode: code,
      priceUSD: round(cost.value / rate.rate, 2),
      priceLocal: round(cost.value, 2),
      source: `World Bank Food Prices for Nutrition, ${cost.year} (converted at the World Bank official exchange rate)`,
      sourceDate: String(cost.year),
    });
  }
  console.log(`  healthy-diet-day: ${out.length} countries`);
  return out;
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/** Every item id this script owns. Rows for these are rebuilt wholesale. */
const MANAGED = [
  "diesel-1l",
  "electricity-100kwh",
  "natural-gas-100kwh",
  "cigarettes-20",
  "beer-330ml",
  "spirits-750ml",
  "eliquid-1ml",
  "mobile-data-1gb",
  "healthy-diet-day",
];

async function main() {
  const check = process.argv.includes("--check");
  const offline = process.argv.includes("--offline");

  const prices: PriceEntry[] = JSON.parse(readFileSync(PRICES_PATH, "utf8"));

  // Country name, flag, currency and wage are properties of the country rather
  // than of any one item, so they come from the roster in data/countries.ts.
  // Reading them off whatever rows happened to exist already would have meant a
  // newly added country could never get its first row.
  const names = new Map(
    CODES.map((c) => [c, COUNTRY_META[c].name] as const)
  );

  let harvested: Harvested[];
  if (offline) {
    harvested = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")).rows;
    console.log(`Using the committed snapshot: ${harvested.length} figures.`);
  } else {
    console.log("GlobalPetrolPrices.com (one page per country, please be patient)");
    const gpp = await harvestGlobalPetrolPrices();
    console.log("WHO Global Health Observatory");
    const who = await harvestWho();
    console.log("Cable.co.uk");
    const mobile = await harvestMobileData(names);
    console.log("World Bank Food Prices for Nutrition");
    const diet = await harvestHealthyDiet();
    harvested = [...gpp, ...who, ...mobile, ...diet];
    writeFileSync(
      SNAPSHOT_PATH,
      JSON.stringify(
        { retrieved: new Date().toISOString().slice(0, 10), rows: harvested },
        null,
        1
      ) + "\n"
    );
  }

  // Build the replacement rows.
  const built: PriceEntry[] = [];
  const dropped: string[] = [];
  for (const h of harvested) {
    const base = COUNTRY_META[h.countryCode];
    if (!base) continue;
    // A local figure is only kept when the publisher quoted it in the currency
    // this country is priced in everywhere else in the table. Anything else is
    // dropped rather than converted, so no row shows a local price nobody
    // published.
    const keepLocal =
      h.priceLocal != null &&
      h.priceLocal > 0 &&
      (h.localCurrency == null || h.localCurrency === base.localCurrency);
    if (h.priceLocal != null && !keepLocal) {
      dropped.push(`${h.itemId}:${h.countryCode} (${h.localCurrency})`);
    }
    built.push({
      itemId: h.itemId,
      countryCode: h.countryCode,
      countryName: base.name,
      flag: base.flag,
      priceUSD: h.priceUSD,
      ...(keepLocal ? { priceLocal: h.priceLocal } : {}),
      localCurrency: base.localCurrency,
      avgHourlyWageUSD: base.avgHourlyWageUSD,
      source: h.source,
      sourceDate: h.sourceDate,
    });
  }

  const managed = new Set(MANAGED);
  const kept = prices.filter((p) => !managed.has(p.itemId));
  const next = [
    ...kept,
    ...MANAGED.flatMap((id) =>
      built
        .filter((p) => p.itemId === id)
        .sort((a, b) => a.countryCode.localeCompare(b.countryCode))
    ),
  ];

  const before = JSON.stringify(prices, null, 1) + "\n";
  const after = JSON.stringify(next, null, 1) + "\n";

  if (check) {
    if (before !== after) {
      console.error(
        "\nThe openly-sourced rows are stale. Run `pnpm refresh-open-prices` and commit the result."
      );
      process.exit(1);
    }
    console.log("Openly-sourced rows are up to date.");
    return;
  }

  writeFileSync(PRICES_PATH, after);
  if (dropped.length > 0) {
    console.log(
      `\nLocal-currency figure dropped for ${dropped.length} row(s) quoted in another currency:\n  ${dropped.join("\n  ")}`
    );
  }
  console.log(
    `\ndata/prices.json: ${built.length} openly-sourced row(s) across ${MANAGED.length} items, ${kept.length} row(s) left untouched.`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
