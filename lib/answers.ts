import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import { HISTORY_ITEMS } from "@/data/price-history";
import { RENT_AREAS } from "@/data/rent-ratio";
import { formatUSD } from "./format";
import { addDaysISO, isoDate } from "./puzzle";
import { puzzleFor as atlasPuzzle } from "./priceatlas";
import { puzzleFor as chainPuzzle } from "./pricechain";
import { puzzleFor as yearPuzzle } from "./priceyear";
import { puzzleFor as thenNowPuzzle } from "./thenandnow";
import { EPOCH, puzzleFor as rangePuzzle } from "./openrange";
import { puzzleFor as rentPuzzle, twoBed } from "./rentratio";
import { puzzleFor as ladderPuzzle } from "./inflationladder";
import { puzzleFor as scoredPuzzle } from "./pricele1000";
import { itemInProse } from "./yearprices";

export const HOLDBACK_DAYS = 2;

export interface GameAnswer {
  slug: string;
  name: string;
  href: string;
  number: number;
  summary: string;
  lines: string[];
}

const rent = (n: number) => `$${n.toLocaleString("en-US")}`;
const percent = (n: number) => `${n >= 0 ? "+" : ""}${Math.round(n * 100)}%`;

export function answersFor(date: string): GameAnswer[] {
  const atlas = atlasPuzzle(date);
  const chain = chainPuzzle(date);
  const year = yearPuzzle(date, HISTORY_ITEMS);
  const thenNow = thenNowPuzzle(date, THEN_NOW_ITEMS);
  const range = rangePuzzle(date);
  const rentP = rentPuzzle(date, RENT_AREAS);
  const ladder = ladderPuzzle(date, THEN_NOW_ITEMS);
  const scored = scoredPuzzle(date);
  const rungById = new Map(ladder.rungs.map((r) => [r.item.id, r]));

  return [
    {
      slug: "price-atlas",
      name: "Price Atlas",
      href: "/games/price-atlas",
      number: atlas.number,
      summary: `The mystery country was ${atlas.answer.name} ${atlas.answer.flag}.`,
      lines: atlas.clues.map((c) => `${c.label}: ${formatUSD(c.priceUSD)}`),
    },
    {
      slug: "higher-or-lower",
      name: "Higher or Lower Daily",
      href: "/games/higher-or-lower",
      number: chain.number,
      summary: `The chain ran through ${chain.cards.length} prices.`,
      lines: chain.cards.map(
        (c, i) =>
          `${c.itemName} in ${c.countryName}: ${formatUSD(c.priceUSD)}${
            i === 0 ? "" : c.priceUSD >= chain.cards[i - 1].priceUSD ? " (higher)" : " (lower)"
          }`
      ),
    },
    {
      slug: "price-year",
      name: "Price Year",
      href: "/games/price-year",
      number: year.number,
      summary: `The five receipts were from ${year.receipts.map((r) => r.year).join(", ")}.`,
      lines: year.receipts.map(
        (r) =>
          `${r.year}: ${r.items
            .map((i) => `${itemInProse(i)} ${formatUSD(i.prices[r.year])}`)
            .join(", ")}`
      ),
    },
    {
      slug: "then-and-now",
      name: "Then & Now",
      href: "/games/then-and-now",
      number: thenNow.number,
      summary: `${thenNow.item.name} cost ${formatUSD(thenNow.answer)} in ${thenNow.year}.`,
      lines: [`In ${thenNow.anchorYear} it cost ${formatUSD(thenNow.anchor)}.`],
    },
    {
      slug: "open-range",
      name: "Open Range",
      href: "/games/open-range",
      number: range.number,
      summary: "The five prices to bracket:",
      lines: range.questions.map(
        (q) => `${q.label} in ${q.price.countryName}: ${formatUSD(q.price.priceUSD)}`
      ),
    },
    {
      slug: "rent-ratio",
      name: "Rent Ratio",
      href: "/games/rent-ratio",
      number: rentP.number,
      summary: "The higher two-bedroom fair market rent in each matchup:",
      lines: rentP.rounds.map((r) => {
        const [hi, lo] = twoBed(r.a) > twoBed(r.b) ? [r.a, r.b] : [r.b, r.a];
        return `${hi.name} ${rent(twoBed(hi))} over ${lo.name} ${rent(twoBed(lo))}`;
      }),
    },
    {
      slug: "inflation-ladder",
      name: "Inflation Ladder",
      href: "/games/inflation-ladder",
      number: ladder.number,
      summary: `Biggest price rise first, ${ladder.baseYear} to ${ladder.latestYear}:`,
      lines: ladder.answer.map((id) => {
        const r = rungById.get(id)!;
        return `${r.item.name}: ${formatUSD(r.from)} to ${formatUSD(r.to)}, ${percent(r.change)}`;
      }),
    },
    {
      slug: "pricele-1000",
      name: "Pricele 1000",
      href: "/games/pricele-1000",
      number: scored.number,
      summary: "The five rounds:",
      lines: scored.rounds.map(
        (r) => `${r.label} in ${r.price.countryName}: ${formatUSD(r.price.priceUSD)}`
      ),
    },
  ];
}

export function publishedAnswerDates(today: string = isoDate()): string[] {
  const newest = addDaysISO(today, -HOLDBACK_DAYS);
  const out: string[] = [];
  for (let d = newest; d >= EPOCH; d = addDaysISO(d, -1)) out.push(d);
  return out;
}

export function isPublishedAnswerDate(date: string, today: string = isoDate()): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= EPOCH && date <= addDaysISO(today, -HOLDBACK_DAYS)
  );
}
