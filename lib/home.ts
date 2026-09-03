// The player's own country, and the two reveal lines that need it.
//
// The Big Mac Index has survived forty years of economists pointing out its
// flaws, and the reason is that it turned purchasing power parity into an object
// people can picture. "$3.10" is a fact nobody retains. "That is two and a half
// Egyptian cappuccinos, or nineteen minutes of work in Japan and four hours in
// Pakistan" is a fact people repeat at dinner.
//
// Both lines below do that conversion, and both need to know where the player
// is. That is the only personal thing this site asks for. It is asked once, it
// is optional, and declining is a complete answer that is remembered.

import { PRICES, findPrice, type PriceEntry } from "./puzzle";
import { getItem } from "@/data/items";
import { formatPrice } from "./format";
import type { Currency } from "./currency";

const HOME_KEY = "pricele:home";
const HOME_ASKED_KEY = "pricele:home-asked";

/** Stored when the player picked a country the table does not cover. */
export const HOME_ELSEWHERE = "XX";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** The player's declared home country code, "" if they never said. */
export function loadHome(): string {
  if (!hasStorage()) return "";
  try {
    return window.localStorage.getItem(HOME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveHome(code: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(HOME_KEY, code);
    window.localStorage.setItem(HOME_ASKED_KEY, "1");
  } catch {
    /* private mode: they will be asked again next time, once */
  }
}

/** True once the player has been asked, whether or not they answered. */
export function homeAsked(): boolean {
  if (!hasStorage()) return true;
  try {
    return !!window.localStorage.getItem(HOME_ASKED_KEY);
  } catch {
    return true;
  }
}

/** Record that the question was put and declined, so it is not put again. */
export function dismissHome(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(HOME_ASKED_KEY, "1");
  } catch {
    /* nothing to do */
  }
}

/**
 * The code to send to the server. "Somewhere else" is stored locally so the
 * player is not asked twice, but sent as "" because there is no audience row
 * worth keeping for it.
 */
export function submittableHome(home: string): string {
  return home === HOME_ELSEWHERE ? "" : home;
}

/** Every country that has at least one price, for the picker. */
export function homeOptions(): {
  code: string;
  name: string;
  flag: string;
}[] {
  const seen = new Map<string, { code: string; name: string; flag: string }>();
  for (const p of PRICES) {
    if (!seen.has(p.countryCode)) {
      seen.set(p.countryCode, {
        code: p.countryCode,
        name: p.countryName,
        flag: p.flag,
      });
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * "That is 2.4 cappuccinos at Romanian prices."
 *
 * The cross-table already exists, so this is one lookup: what the same item
 * costs at home, and how many of those the foreign price buys. Returns null when
 * the player's country has no row for today's item, which is common, because the
 * table is deliberately sparse rather than padded with invented numbers.
 *
 * `suppressed` is the live suppression set. If the player's home row for this
 * item is currently withheld, the line is withheld too: printing "2.4 cappuccinos
 * at Romanian prices" alongside today's answer would let a reader solve for the
 * Romanian figure the rest of the site is holding back.
 */
export function inYourMoneyLine(
  price: PriceEntry,
  homeCode: string,
  suppressed: Set<string>
): string | null {
  if (!homeCode || homeCode === HOME_ELSEWHERE || homeCode === price.countryCode) {
    return null;
  }
  if (suppressed.has(`${price.itemId}:${homeCode}`)) return null;

  const home = findPrice(price.itemId, homeCode);
  const item = getItem(price.itemId);
  if (!home || !item || !(home.priceUSD > 0)) return null;

  const ratio = price.priceUSD / home.priceUSD;
  const noun = item.shortName.toLowerCase();

  if (ratio >= 0.95 && ratio <= 1.05) {
    return `That is almost exactly what a ${noun} costs in ${home.countryName} ${home.flag}.`;
  }
  if (ratio > 1) {
    return `That buys ${ratio.toFixed(1)} of them in ${home.countryName} ${home.flag}.`;
  }
  return `A ${noun} at home in ${home.countryName} ${home.flag} costs ${(1 / ratio).toFixed(1)} times this.`;
}

/** Working time as a phrase: "19 minutes", "4.4 hours". */
export function workTime(minutes: number): string {
  if (minutes < 1) return "under a minute";
  if (minutes < 90) return `${Math.round(minutes)} minutes`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)} hours`;
  return `${(hours / 8).toFixed(1)} working days`;
}

/**
 * The minutes-of-work comparison, which is the line the teachers came for.
 *
 * UBS have been publishing Prices and Earnings on this principle since the
 * 1970s, and the reason it keeps getting quoted is that working time is the one
 * unit that needs no exchange rate and no explanation. "A Big Mac is nine
 * minutes in Hong Kong and three hours in Nairobi" is a whole lesson on real
 * income in one sentence, and the dollar figure next to it is not.
 *
 * Falls back to the local figure alone when the player has not said where they
 * are, which is still the more interesting half.
 */
export function minutesOfWorkLine(
  price: PriceEntry,
  homeCode: string
): string {
  const item = getItem(price.itemId);
  const noun = item ? item.shortName.toLowerCase() : "one";
  const localMinutes = (price.priceUSD / price.avgHourlyWageUSD) * 60;
  const local = `About ${workTime(localMinutes)} of the average local wage buys a ${noun} in ${price.countryName}.`;

  if (!homeCode || homeCode === HOME_ELSEWHERE || homeCode === price.countryCode) {
    return local;
  }

  // The home wage comes from any row that country has, since the wage is a
  // property of the country rather than of the item.
  const homeRow = PRICES.find(
    (p) => p.countryCode === homeCode && p.avgHourlyWageUSD > 0
  );
  if (!homeRow) return local;

  const homeMinutes = (price.priceUSD / homeRow.avgHourlyWageUSD) * 60;
  return `${local} On your wage in ${homeRow.countryName}, the same price is ${workTime(homeMinutes)}.`;
}

/**
 * The headline price in the currency the player reads in, with the working-time
 * figure beside it. Used by the stat plate.
 */
export function priceWithWork(
  price: PriceEntry,
  currency: Currency
): { money: string; work: string } {
  return {
    money: formatPrice(price.priceUSD, currency),
    work: workTime((price.priceUSD / price.avgHourlyWageUSD) * 60),
  };
}
