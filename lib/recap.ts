import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import { HISTORY_ITEMS } from "@/data/price-history";
import { RENT_AREAS } from "@/data/rent-ratio";
import { answersFor, HOLDBACK_DAYS, type GameAnswer } from "./answers";
import { isPublishedArchiveDate } from "./catalog";
import { formatArchiveDate, formatUSD } from "./format";
import { addDaysISO, dateFromISO, getPuzzleForISO, isoDate } from "./puzzle";
import { puzzleFor as atlasPuzzle } from "./priceatlas";
import { puzzleFor as chainPuzzle } from "./pricechain";
import { puzzleFor as yearPuzzle } from "./priceyear";
import { puzzleFor as thenNowPuzzle } from "./thenandnow";
import { EPOCH, puzzleFor as rangePuzzle } from "./openrange";
import { puzzleFor as rentPuzzle, twoBed } from "./rentratio";
import { puzzleFor as ladderPuzzle } from "./inflationladder";
import { puzzleFor as scoredPuzzle } from "./pricele1000";

export function weekStart(date: string): string {
  const day = dateFromISO(date).getDay();
  return addDaysISO(date, -((day + 6) % 7));
}

export function weekEnd(monday: string): string {
  return addDaysISO(monday, 6);
}

export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysISO(monday, i)).filter((d) => d >= EPOCH);
}

export function publishedRecapWeeks(today: string = isoDate()): string[] {
  const out: string[] = [];
  const newest = addDaysISO(today, -HOLDBACK_DAYS);
  for (let m = weekStart(EPOCH); weekEnd(m) <= newest; m = addDaysISO(m, 7)) out.unshift(m);
  return out;
}

export function isPublishedRecapWeek(monday: string, today: string = isoDate()): boolean {
  return publishedRecapWeeks(today).includes(monday);
}

export function weekLabel(monday: string): string {
  return `${formatArchiveDate(weekDays(monday)[0])} to ${formatArchiveDate(weekEnd(monday))}`;
}

interface PricePoint {
  label: string;
  country: string;
  priceUSD: number;
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const rent = (n: number) => `$${n.toLocaleString("en-US")}`;
const ratio = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);

function pricePoints(days: string[]): PricePoint[] {
  return days.flatMap((d) => [
    ...rangePuzzle(d).questions.map((q) => ({
      label: q.label,
      country: q.price.countryName,
      priceUSD: q.price.priceUSD,
    })),
    ...scoredPuzzle(d).rounds.map((r) => ({
      label: r.label,
      country: r.price.countryName,
      priceUSD: r.price.priceUSD,
    })),
    ...chainPuzzle(d).cards.map((c) => ({
      label: c.itemName,
      country: c.countryName,
      priceUSD: c.priceUSD,
    })),
  ]);
}

export function highlights(days: string[]): string[] {
  const out: string[] = [];

  const points = pricePoints(days);
  points.sort((a, b) => a.priceUSD - b.priceUSD);
  if (points.length > 1) {
    const lo = points[0];
    const hi = points.at(-1)!;
    out.push(
      `The dearest price in this week's games was ${lowerFirst(hi.label)} in ${hi.country} at ${formatUSD(hi.priceUSD)}. The cheapest was ${lowerFirst(lo.label)} in ${lo.country} at ${formatUSD(lo.priceUSD)}.`
    );
  }

  const countries = [...new Set(days.map((d) => atlasPuzzle(d).answer.name))];
  const countryCount = countries.length === 1 ? "one country" : `${countries.length} countries`;
  out.push(`Price Atlas players had to name ${countryCount}: ${countries.join(", ")}.`);

  const years = days.flatMap((d) => yearPuzzle(d, HISTORY_ITEMS).receipts.map((r) => r.year));
  if (years.length > 0) {
    out.push(
      `Price Year receipts ran from ${Math.min(...years)} to ${Math.max(...years)}, ${years.length} receipts in all.`
    );
  }

  const gaps = days.flatMap((d) =>
    rentPuzzle(d, RENT_AREAS).rounds.map((r) => {
      const [hi, lo] = twoBed(r.a) >= twoBed(r.b) ? [r.a, r.b] : [r.b, r.a];
      return { hi, lo, r: twoBed(hi) / twoBed(lo) };
    })
  );
  gaps.sort((a, b) => b.r - a.r);
  const widest = gaps[0];
  if (widest) {
    out.push(
      `The widest Rent Ratio matchup: a two-bedroom in ${widest.hi.name} rents for ${ratio(widest.r)} times one in ${widest.lo.name} (${rent(twoBed(widest.hi))} against ${rent(twoBed(widest.lo))} a month).`
    );
  }

  const rungs = days.flatMap((d) => {
    const p = ladderPuzzle(d, THEN_NOW_ITEMS);
    return p.rungs.map((r) => ({ ...r, base: p.baseYear, latest: p.latestYear }));
  });
  rungs.sort((a, b) => b.change - a.change);
  const riser = rungs[0];
  if (riser) {
    out.push(
      `The biggest climber on the Inflation Ladder was ${lowerFirst(riser.item.name)}, up ${Math.round(riser.change * 100)}% from ${riser.base} to ${riser.latest}.`
    );
  }

  const thenNow = days.map((d) => thenNowPuzzle(d, THEN_NOW_ITEMS));
  const oldest = [...thenNow].sort((a, b) => a.year - b.year)[0];
  if (oldest) {
    out.push(
      `The oldest Then & Now price: ${lowerFirst(oldest.item.name)} at ${formatUSD(oldest.answer)} in ${oldest.year}.`
    );
  }

  return out;
}

export interface RecapDay {
  date: string;
  pricele: { item: string; country: string; flag: string; priceUSD: number } | null;
  answers: GameAnswer[];
}

export interface Recap {
  monday: string;
  days: RecapDay[];
  highlights: string[];
}

export function recapFor(monday: string): Recap {
  const days = weekDays(monday);
  return {
    monday,
    highlights: highlights(days),
    days: days.map((date) => {
      const p = isPublishedArchiveDate(date) ? getPuzzleForISO(date) : null;
      return {
        date,
        pricele: p
          ? {
              item: p.item.name,
              country: p.price.countryName,
              flag: p.price.flag,
              priceUSD: p.price.priceUSD,
            }
          : null,
        answers: answersFor(date),
      };
    }),
  };
}
