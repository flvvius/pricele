import { HISTORY_ITEMS, HOURLY_WAGE } from "@/data/price-history";
import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import { puzzleFor as thenNowPuzzle, type ThenNowItem } from "./thenandnow";

export interface YearRow {
  item: ThenNowItem;
  then: number;
  now: number;
  change: number;
  minutesThen: number;
  minutesNow: number;
  hidden: boolean;
}

export interface YearSummary {
  year: number;
  latestYear: number;
  wageThen: number;
  wageNow: number;
  rows: YearRow[];
}

export const LATEST_YEAR = Math.max(...Object.keys(HOURLY_WAGE).map(Number));
export const FIRST_YEAR = Math.min(...Object.keys(HOURLY_WAGE).map(Number));
export const YEARS = Array.from({ length: LATEST_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);

export function isYear(raw: string): boolean {
  return /^\d{4}$/.test(raw) && YEARS.includes(Number(raw));
}

export function liveThenNowPairs(now: Date = new Date()): Set<string> {
  const out = new Set<string>();
  for (const offset of [-1, 0, 1]) {
    const date = new Date(now.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
    const p = thenNowPuzzle(date, THEN_NOW_ITEMS);
    out.add(`${p.item.id}:${p.year}`);
  }
  return out;
}

export function minutesOfWork(price: number, year: number): number {
  return (price / HOURLY_WAGE[year]) * 60;
}

export function yearSummary(year: number, hidden: Set<string> = new Set()): YearSummary {
  const rows = HISTORY_ITEMS.filter((i) => i.prices[year] && i.prices[LATEST_YEAR]).map((item) => {
    const then = item.prices[year];
    const now = item.prices[LATEST_YEAR];
    return {
      item,
      then,
      now,
      change: now / then - 1,
      minutesThen: minutesOfWork(then, year),
      minutesNow: minutesOfWork(now, LATEST_YEAR),
      hidden: hidden.has(`${item.id}:${year}`),
    };
  });
  return {
    year,
    latestYear: LATEST_YEAR,
    wageThen: HOURLY_WAGE[year],
    wageNow: HOURLY_WAGE[LATEST_YEAR],
    rows,
  };
}

export function visibleRows(s: YearSummary): YearRow[] {
  return s.rows.filter((r) => !r.hidden);
}

export function biggestRise(s: YearSummary): YearRow | undefined {
  return [...visibleRows(s)].sort((a, b) => b.change - a.change)[0];
}

export function mostTimeSaved(s: YearSummary): YearRow | undefined {
  return [...visibleRows(s)].sort(
    (a, b) => b.minutesThen / b.minutesNow - a.minutesThen / a.minutesNow
  )[0];
}

export function basketMinutes(rows: YearRow[]): { then: number; now: number } {
  return {
    then: rows.reduce((n, r) => n + r.minutesThen, 0),
    now: rows.reduce((n, r) => n + r.minutesNow, 0),
  };
}

export function itemInProse(item: ThenNowItem): string {
  return item.name.charAt(0).toLowerCase() + item.name.slice(1);
}

export function bornCardLines(s: YearSummary): string[] {
  const pick = mostTimeSaved(s);
  const basket = basketMinutes(visibleRows(s));
  const lines = [`Born in ${s.year}? Here's what a U.S. grocery run cost then.`];
  if (pick) {
    lines.push(
      `${pick.item.name}: $${pick.then.toFixed(2)} then, $${pick.now.toFixed(2)} in ${s.latestYear}.`,
      `That's ${Math.round(pick.minutesThen)} minutes of work then, ${Math.round(pick.minutesNow)} now.`
    );
  }
  lines.push(
    `Whole basket: ${Math.round(basket.then)} min of work then, ${Math.round(basket.now)} now.`
  );
  return lines;
}

export function bornCardText(s: YearSummary, url: string): string {
  return [...bornCardLines(s), url].join("\n");
}
