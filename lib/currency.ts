// Display currency. The US dollar is the game's canonical unit: every figure in
// data/prices.json is stored as priceUSD, every guess is scored against it, and
// this module only converts on the way in and out of the UI.
//
// WHY THE RATE CANNOT AFFECT FAIRNESS
//   lib/scoring is multiplicative — it compares log(guess / actual), so what it
//   measures is a ratio. Converting both sides by the same constant leaves that
//   ratio untouched. A player guessing in euros therefore gets exactly the band
//   a player guessing the equivalent dollar figure would, and the reference rate
//   below only ever changes which numbers are printed, never who wins. That is
//   what makes a fixed rate acceptable here instead of a live FX feed.

export type Currency = "USD" | "EUR";

/**
 * Fixed reference rate, USD -> EUR. Chosen to match the rate the dataset's own
 * local-currency conversions were struck at (the euro rows in prices.json imply
 * ~0.868), so a converted figure and a eurozone row's published price stay
 * within about a cent of each other rather than visibly disagreeing.
 */
export const USD_TO_EUR = 0.87;

export const CURRENCY_KEY = "pricele:currency";

/** USD (canonical) -> the number shown in `currency`. */
export function fromUSD(usd: number, currency: Currency): number {
  return currency === "EUR" ? usd * USD_TO_EUR : usd;
}

/** A number the player typed in `currency` -> USD (canonical). */
export function toUSD(value: number, currency: Currency): number {
  return currency === "EUR" ? value / USD_TO_EUR : value;
}

/** The other currency — what a toggle switches to. */
export function otherCurrency(currency: Currency): Currency {
  return currency === "USD" ? "EUR" : "USD";
}

export function currencySymbol(currency: Currency): string {
  return currency === "EUR" ? "€" : "$";
}

// Eurozone territories that sit outside the Europe/ tree — the Canaries and
// Madeira are Spain and Portugal, Ceuta is Spain, and the French overseas
// departments are all in the euro area.
const EURO_ZONES = new Set([
  "Atlantic/Canary",
  "Atlantic/Madeira",
  "Atlantic/Azores",
  "Africa/Ceuta",
  "Indian/Reunion",
  "Indian/Mayotte",
  "America/Martinique",
  "America/Guadeloupe",
  "America/Cayenne",
]);

// Region subtags used only when the environment reports no timezone at all.
const EURO_REGIONS = new Set([
  "AD", "AT", "AX", "BE", "BG", "CH", "CY", "CZ", "DE", "DK", "EE", "ES",
  "FI", "FR", "GB", "GR", "HR", "HU", "IE", "IS", "IT", "LI", "LT", "LU",
  "LV", "MC", "MT", "NL", "NO", "PL", "PT", "RO", "RS", "SE", "SI", "SK",
  "SM", "UA", "VA",
]);

/**
 * True when the visitor looks European. Client-side only.
 *
 * Every Europe/ zone counts, not just the twenty euro-area members. A Pole or a
 * Swede does not pay in euros, but the euro is still the price they see quoted
 * across the border and on every airline and hotel site — a far more legible
 * reference than the dollar. Drawing the line at the eurozone proper would send
 * most of the continent to USD to split a hair, and the toggle is one tap for
 * anyone who disagrees.
 */
export function isEuropean(): boolean {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone) return zone.startsWith("Europe/") || EURO_ZONES.has(zone);
  } catch {
    /* no Intl or no zone — fall through to the language tag */
  }
  try {
    const region = new Intl.Locale(navigator.language).region;
    return region ? EURO_REGIONS.has(region) : false;
  } catch {
    return false;
  }
}

/**
 * The currency to start a first-time visitor on: euros in Europe, dollars for
 * everyone else. The dollar is the fallback rather than the default because it
 * is the unit the price data is actually published in, and the one the rest of
 * the world is most used to seeing international prices quoted in.
 */
export function defaultCurrency(): Currency {
  return isEuropean() ? "EUR" : "USD";
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** The player's saved currency, or the locale-derived default. Client-side only. */
export function loadCurrency(): Currency {
  if (!hasStorage()) return "USD";
  try {
    const stored = window.localStorage.getItem(CURRENCY_KEY);
    if (stored === "USD" || stored === "EUR") return stored;
  } catch {
    /* private mode — fall back to the default */
  }
  return defaultCurrency();
}

export function saveCurrency(currency: Currency): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(CURRENCY_KEY, currency);
  } catch {
    /* private mode — the choice just won't survive a reload */
  }
}
