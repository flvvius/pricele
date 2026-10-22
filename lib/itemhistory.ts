import { HISTORY_ITEMS, HOURLY_WAGE } from "@/data/price-history";
import type { ThenNowItem } from "./thenandnow";

export interface HistoryPoint {
  year: number;
  price: number;
  minutes: number;
  change: number | null;
  hidden: boolean;
}

export const HISTORY_TITLES: Record<string, string> = {
  eggs: "Egg prices",
  "white-bread": "White bread prices",
  gasoline: "Gas prices",
  "ground-beef": "Ground beef prices",
  bacon: "Bacon prices",
  bananas: "Banana prices",
  cheddar: "Cheddar cheese prices",
  "ice-cream": "Ice cream prices",
  coffee: "Coffee prices",
  "potato-chips": "Potato chip prices",
  "whole-chicken": "Chicken prices",
  cookies: "Chocolate chip cookie prices",
  tomatoes: "Tomato prices",
  sugar: "Sugar prices",
  "orange-juice": "Orange juice prices",
};

export function historyItem(id: string): ThenNowItem | undefined {
  return HISTORY_ITEMS.find((i) => i.id === id);
}

export function historyTitle(item: ThenNowItem): string {
  return HISTORY_TITLES[item.id] ?? `${item.name} prices`;
}

export function historyFor(item: ThenNowItem, hidden: Set<string> = new Set()): HistoryPoint[] {
  const years = Object.keys(item.prices)
    .map(Number)
    .sort((a, b) => a - b);
  return years.map((year) => {
    const price = item.prices[year];
    const prev = item.prices[year - 1];
    return {
      year,
      price,
      minutes: (price / HOURLY_WAGE[year]) * 60,
      change: prev ? price / prev - 1 : null,
      hidden: hidden.has(`${item.id}:${year}`),
    };
  });
}

export function shown(points: HistoryPoint[]): HistoryPoint[] {
  return points.filter((p) => !p.hidden);
}

export function extremes(points: HistoryPoint[]) {
  const v = shown(points);
  const by = (f: (p: HistoryPoint) => number) => [...v].sort((a, b) => f(a) - f(b));
  const byPrice = by((p) => p.price);
  const byMinutes = by((p) => p.minutes);
  const byJump = by((p) => p.change ?? 0);
  return {
    first: v[0],
    last: v[v.length - 1],
    priciest: byPrice[byPrice.length - 1],
    cheapestWork: byMinutes[0],
    dearestWork: byMinutes[byMinutes.length - 1],
    biggestJump: byJump[byJump.length - 1],
  };
}

export function segments(points: HistoryPoint[]): HistoryPoint[][] {
  const out: HistoryPoint[][] = [];
  let run: HistoryPoint[] = [];
  let prevYear: number | null = null;
  for (const p of points) {
    if (p.hidden || (prevYear !== null && p.year !== prevYear + 1)) {
      if (run.length) out.push(run);
      run = [];
    }
    if (!p.hidden) run.push(p);
    prevYear = p.year;
  }
  if (run.length) out.push(run);
  return out;
}
