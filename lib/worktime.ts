import { HISTORY_ITEMS, HOURLY_WAGE } from "@/data/price-history";
import type { HistoryPoint } from "./itemhistory";
import { fullCoverage } from "./priceyear";
import type { ThenNowItem } from "./thenandnow";

export const BASKET: ThenNowItem[] = fullCoverage(HISTORY_ITEMS);

export function basketSeries(items: ThenNowItem[] = BASKET): HistoryPoint[] {
  return Object.keys(HOURLY_WAGE)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((year) => items.every((i) => i.prices[year]))
    .map((year, k, years) => {
      const minutes = items.reduce((s, i) => s + (i.prices[year] / HOURLY_WAGE[year]) * 60, 0);
      const prevYear = years[k - 1];
      const prev =
        prevYear === year - 1
          ? items.reduce((s, i) => s + (i.prices[prevYear] / HOURLY_WAGE[prevYear]) * 60, 0)
          : null;
      return {
        year,
        price: minutes,
        minutes,
        change: prev ? minutes / prev - 1 : null,
        hidden: false,
      };
    });
}

export interface ItemWorkChange {
  item: ThenNowItem;
  fromYear: number;
  from: number;
  to: number;
  change: number;
}

export function itemWorkChanges(latestYear: number): ItemWorkChange[] {
  return HISTORY_ITEMS.map((item) => {
    const fromYear = Math.min(...Object.keys(item.prices).map(Number));
    const from = (item.prices[fromYear] / HOURLY_WAGE[fromYear]) * 60;
    const to = (item.prices[latestYear] / HOURLY_WAGE[latestYear]) * 60;
    return { item, fromYear, from, to, change: to / from - 1 };
  }).sort((a, b) => b.change - a.change);
}

export function lowest(series: HistoryPoint[]): HistoryPoint {
  return series.reduce((a, b) => (b.price < a.price ? b : a));
}
