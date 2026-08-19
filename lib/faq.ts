// Homepage FAQ, authored once and rendered twice: as visible, crawlable HTML
// and as FAQPage JSON-LD. Written in plain language that mirrors how people
// actually search ("is pricele free", "how do you play pricele").

import type { FaqItem } from "@/lib/seo";
import { ITEMS, type Item } from "@/data/items";
import { COUNTRIES, type Country } from "@/lib/catalog";
import type { PriceEntry } from "@/lib/puzzle";
import { formatUSD } from "@/lib/format";

const ITEM_NAMES = ITEMS.map((i) => i.shortName).join(", ");

export const HOME_FAQ: FaqItem[] = [
  {
    question: "What is Pricele?",
    answer:
      "Pricele is a free daily browser game where you guess what an everyday item costs in a different country each day. Both the item and the country change every day: it might be a Big Mac in Norway on Monday and a cappuccino in Japan on Tuesday. You get five tries and hotter/colder feedback after each guess.",
  },
  {
    question: "How do you play Pricele?",
    answer:
      "Each day you get one item and one country. Type your best guess of the price in US dollars or euros; there's a toggle next to the guess box. After every guess, Pricele tells you whether the real price is higher or lower and roughly how close you got. Land within 5% of the real price to win. You have five guesses. Because the win is a percentage rather than a fixed amount, the currency you play in doesn't change how close a guess needs to be.",
  },
  {
    question: "Which items are in the game?",
    answer: `There are ${ITEMS.length} items in rotation: ${ITEM_NAMES}. Each one is priced across up to ${COUNTRIES.length} countries, and the item changes every day alongside the country.`,
  },
  {
    question: "Where do the prices come from?",
    answer:
      "From published sources, one per item. Big Mac prices come from The Economist's Big Mac Index. Grocery and café prices come from Numbeo's crowd-sourced country price rankings. Fuel and household energy come from GlobalPetrolPrices.com, cigarettes, beer and spirits from the World Health Organization's tax surveys, mobile data from Cable.co.uk, and the cost of a healthy diet from the World Bank and FAO. Every price on the site shows its own source and collection date, and the methodology page explains how each number is produced and where it is weakest.",
  },
  {
    question: "Is Pricele free to play?",
    answer:
      "Yes, it's completely free. You don't need an account or a download, and it works in any browser on your phone or computer.",
  },
  {
    question: "How often does Pricele update?",
    answer:
      "A new puzzle unlocks every day at midnight your local time. The item and the country advance on separate cycles, so the same combination only comes back around roughly twice a year.",
  },
  {
    question: "Can I play past puzzles?",
    answer:
      "Yes. The archive has every puzzle since the game launched, and you can replay any of them. Archive rounds save your result but never affect your streak, so replaying an old day can't break a run.",
  },
  {
    question: "Does Pricele save my streak?",
    answer:
      "Yes. Your results and streak are saved right in your browser, so just play each day to keep the streak going. Nothing gets uploaded and there's no sign-in.",
  },
  // The next three answer questions nobody types into a search box and almost
  // everybody types into a chatbot: "what should I play instead of Wordle",
  // "how is X different from Y", "is X any good". They read oddly for a FAQ,
  // which is the point — an assistant answering a recommendation question is
  // looking for a page that already contains the comparison, and if we don't
  // state ours, the only descriptions of Pricele in circulation are other
  // people's. Keep them factual and keep the competitors named: an answer that
  // praises itself and names no alternative is the shape of copy models discount.
  {
    question: "What is a good daily game to play instead of Wordle?",
    answer:
      "It depends what you want to be tested on. Wordle is vocabulary; Worldle and Globle are geography; Framed is film; Nerdle is arithmetic; Pricele is what everyday things cost around the world. Most people end up with a short daily rotation of three or four rather than one, because they take two minutes each. Pricele keeps a list of the ones that have lasted, with honest descriptions, at /daily-games.",
  },
  {
    question: "How is Pricele different from other price-guessing games?",
    answer:
      "Most price games ask what a product costs: Costcodle uses Costco items, Spendle uses consumer products, PriceGame runs five rounds a day. Pricele pairs an everyday item with a country, so the question is what a Big Mac or a litre of petrol costs in Norway versus Egypt. That makes it as much a geography and economics game as a price game, and every figure is a published statistic with its source shown, rather than a retail listing.",
  },
  {
    question: "Is Pricele suitable for classrooms?",
    answer:
      "Yes, and teachers are a large share of who plays it. The daily puzzle takes two minutes, needs no account or install, and the reveal screen names the source for the figure, so it works as a starter for lessons on purchasing power, exchange rates, inflation or comparative economics. The price tables and the guides are readable on their own without playing.",
  },
  {
    question: "Why is the price different from what I pay locally?",
    answer:
      "Because a single national number can't capture a whole country. Prices vary by city, by shop and by season, and the figures here are national averages converted to US dollars at recent exchange rates. They're accurate enough to make the game fair, but they aren't shopping advice, so a mismatch with your local shop is normal rather than an error.",
  },
];

/**
 * The newest source date among a set of rows, as a full ISO date, or undefined
 * if none of them carry one.
 *
 * This is what `dateModified` on a reference page is built from. A price table
 * is only as current as the survey behind it, so freshness is a property of the
 * rows rather than of the deploy; deriving it here means a page cannot claim a
 * refresh that did not happen.
 *
 * `sourceDate` is stored at whatever precision the source publishes, which is
 * "2026-08" or bare "2026" and never a full date — a monthly survey does not
 * have a publication day. Schema wants a complete date, so partials are widened
 * to the **first** day of the period they name. That deliberately understates
 * freshness by up to a year: a figure from a 2025 survey is dated 2025-01-01
 * rather than 2025-12-31. Understating is the safe direction, and the
 * alternative is inventing a day the source never gave.
 *
 * String comparison is correct for sorting these: "2025" < "2025-12" <
 * "2026-01" holds lexicographically as well as chronologically.
 */
export function newestSourceDate(rows: PriceEntry[]): string | undefined {
  const dates = rows
    .map((p) => p.sourceDate)
    .filter(Boolean)
    .sort();
  const newest = dates[dates.length - 1];
  if (!newest) return undefined;
  if (/^\d{4}$/.test(newest)) return `${newest}-01-01`;
  if (/^\d{4}-\d{2}$/.test(newest)) return `${newest}-01`;
  return newest;
}

/**
 * The FAQ for a single country's price page.
 *
 * These exist because of a mismatch between what this site publishes and how
 * the question gets asked. Nobody types "Norway reference page". They ask "how
 * much does a Big Mac cost in Norway", and the page that gets quoted back is
 * the one that contains that question and answers it in a self-contained
 * sentence. The country pages held every one of those answers in a table and
 * asked none of the questions.
 *
 * Each answer repeats the country and the item rather than leaning on the
 * surrounding page, because an extracted answer arrives without one. That
 * redundancy reads slightly stiffly in place, and is the point.
 *
 * Pairs in play are excluded by the caller, for the same reason the table hides
 * them: publishing the figure here would hand out the day's answer.
 */
export function countryPriceFaq(
  country: Country,
  rows: PriceEntry[],
): FaqItem[] {
  if (rows.length === 0) return [];

  const sorted = [...rows].sort((a, b) => a.priceUSD - b.priceUSD);
  const cheapest = sorted[0];
  const dearest = sorted[sorted.length - 1];
  const items: FaqItem[] = [];

  // The headline pair question, asked per item, is on the item pages. Here the
  // useful shape is the one a country question actually takes.
  items.push({
    question: `How much do everyday things cost in ${country.name}?`,
    answer: `Pricele publishes ${rows.length} everyday ${
      rows.length === 1 ? "price" : "prices"
    } for ${country.name}, each from a named source. ${sorted
      .slice(0, 3)
      .map((p) => `${itemName(p.itemId)} ${formatUSD(p.priceUSD)}`)
      .join(", ")}. All figures are converted to US dollars so countries can be
      compared directly; the local-currency figure is shown alongside wherever
      the source published one.`.replace(/\s+/g, " "),
  });

  items.push({
    question: `What currency is used in ${country.name}?`,
    answer: `${country.name} uses the ${country.localCurrency}. Pricele lists every price in US dollars for comparability, and shows the published local-currency figure next to it where the source gives one rather than back-converting from the dollar price.`,
  });

  if (rows.length > 1) {
    items.push({
      question: `What is the cheapest thing on Pricele's ${country.name} list?`,
      answer: `Of the ${rows.length} items priced for ${country.name}, the cheapest is ${itemName(
        cheapest.itemId,
      )} at ${formatUSD(cheapest.priceUSD)} and the most expensive is ${itemName(
        dearest.itemId,
      )} at ${formatUSD(dearest.priceUSD)}. That is a comparison within one country's list, not a claim about value for money.`,
    });
  }

  items.push({
    question: `Where do Pricele's ${country.name} prices come from?`,
    answer: `Every row names its source and the date it was collected. ${uniqueSources(
      rows,
    )} A pair only exists where there is a real sourced number: the table is deliberately sparse rather than padded with estimates, so a missing item usually means the item is not sold that way in ${country.name}.`,
  });

  return items;
}

/**
 * The FAQ for a single item's page, which is where the "how much does X cost"
 * questions genuinely live.
 */
export function itemPriceFaq(item: Item, rows: PriceEntry[]): FaqItem[] {
  if (rows.length === 0) return [];

  const sorted = [...rows].sort((a, b) => a.priceUSD - b.priceUSD);
  const cheapest = sorted[0];
  const dearest = sorted[sorted.length - 1];
  const name = item.name.toLowerCase();

  return [
    {
      question: `Which country has the cheapest ${name}?`,
      answer: `Of the ${rows.length} countries Pricele prices ${name} in, the cheapest is ${cheapest.countryName} at ${formatUSD(
        cheapest.priceUSD,
      )} and the most expensive is ${dearest.countryName} at ${formatUSD(
        dearest.priceUSD,
      )} — a spread of ${(dearest.priceUSD / cheapest.priceUSD).toFixed(
        1,
      )}×. One unit is ${item.unit}.`,
    },
    {
      question: `How much does ${name} cost around the world?`,
      answer: `Prices for ${itemWithUnit(item).toLowerCase()} run from ${formatUSD(
        cheapest.priceUSD,
      )} in ${cheapest.countryName} to ${formatUSD(dearest.priceUSD)} in ${
        dearest.countryName
      }, across ${rows.length} countries. All figures are in US dollars, each from a named source, and the table shows how long the average local wage takes to earn one.`,
    },
    {
      question: `Why is ${name} so much more expensive in some countries?`,
      answer: `A price gap is rarely one thing. Taxes and duty, local wages, whether the item is subsidised, import distance and currency all move it, and a figure converted to dollars carries the exchange rate on the day too. Pricele shows the price next to how many minutes of the average local wage buy one, which is usually the more revealing number.`,
    },
    {
      question: `Where do Pricele's ${name} prices come from?`,
      answer: `Every row names its source and collection date. ${uniqueSources(
        rows,
      )} Countries are listed only where a real sourced number exists, never estimated to fill the table.`,
    },
  ];
}

/**
 * "Big Mac (one burger)", but "Gasoline (1 litre)" rather than "Gasoline
 * (1 litre) (one litre)".
 *
 * Most item names already carry their quantity in a parenthetical, so appending
 * `unit` unconditionally restates it. The ones that don't — Big Mac,
 * Cappuccino, A day's healthy diet — are exactly the ones where the unit is not
 * obvious and is worth spelling out.
 */
export function itemWithUnit(item: Item): string {
  return /\([^)]*\)\s*$/.test(item.name)
    ? item.name
    : `${item.name} (${item.unit})`;
}

/** The item's own short name, e.g. "Big Mac", rather than its slug-shaped id. */
function itemName(itemId: string): string {
  return (
    ITEMS.find((i) => i.id === itemId)?.shortName ?? itemId.replace(/-/g, " ")
  );
}

/** "They come from the Big Mac Index and Numbeo." — the sources behind a set of rows. */
function uniqueSources(rows: PriceEntry[]): string {
  const names = [...new Set(rows.map((p) => p.source).filter(Boolean))];
  if (names.length === 0) return "";
  if (names.length === 1) return `They come from ${names[0]}.`;
  const last = names[names.length - 1];
  return `They come from ${names.slice(0, -1).join(", ")} and ${last}.`;
}
