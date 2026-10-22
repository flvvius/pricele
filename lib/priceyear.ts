import type { ThenNowItem } from "./thenandnow";

export interface Receipt {
  year: number;
  items: ThenNowItem[];
}

export interface YearPuzzle {
  number: number;
  date: string;
  firstYear: number;
  latestYear: number;
  receipts: Receipt[];
}

export const ROUNDS = 5;
export const ROUND_MAX = 200;
export const ZERO_AT = 8;
export const MIN_GAP = 0.12;
export const EPOCH = "2026-10-22";
const DAY_MS = 86_400_000;

export function dayIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [ey, em, ed] = EPOCH.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / DAY_MS);
}

function rng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function yearSpan(items: ThenNowItem[]): {
  firstYear: number;
  latestYear: number;
} {
  const years = items.flatMap((i) => Object.keys(i.prices).map(Number));
  return { firstYear: Math.min(...years), latestYear: Math.max(...years) };
}

export function fullCoverage(items: ThenNowItem[]): ThenNowItem[] {
  const { firstYear, latestYear } = yearSpan(items);
  return items.filter((i) => {
    for (let y = firstYear; y <= latestYear; y++) if (!i.prices[y]) return false;
    return true;
  });
}

export function buckets(firstYear: number, latestYear: number): [number, number][] {
  const size = Math.floor((latestYear - firstYear + 1) / ROUNDS);
  return Array.from({ length: ROUNDS }, (_, i) => {
    const lo = firstYear + i * size;
    return [lo, i === ROUNDS - 1 ? latestYear : lo + size - 1];
  });
}

export function separation(
  items: ThenNowItem[],
  year: number,
  firstYear: number,
  latestYear: number
): number {
  let worst = Infinity;
  for (let y = firstYear; y <= latestYear; y++) {
    if (Math.abs(y - year) < 4) continue;
    const gap =
      items.reduce((s, i) => s + Math.abs(Math.log(i.prices[y] / i.prices[year])), 0) /
      items.length;
    worst = Math.min(worst, gap);
  }
  return worst;
}

function triples(n: number): number[][] {
  const out: number[][] = [];
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) out.push([a, b, c]);
  return out;
}

function receiptFor(
  year: number,
  pool: ThenNowItem[],
  rand: () => number,
  firstYear: number,
  latestYear: number,
  taken: Set<string>
): Receipt {
  const scored = triples(pool.length).map((t) => {
    const items = t.map((i) => pool[i]);
    return {
      items,
      gap: separation(items, year, firstYear, latestYear),
      reused: items.filter((i) => taken.has(i.id)).length,
    };
  });
  const fair = scored.filter((s) => s.gap >= MIN_GAP);
  if (fair.length === 0)
    return {
      year,
      items: scored.reduce((a, b) => (b.gap > a.gap ? b : a)).items,
    };
  const leastReused = Math.min(...fair.map((s) => s.reused));
  const fresh = fair.filter((s) => s.reused === leastReused);
  return { year, items: fresh[Math.floor(rand() * fresh.length)].items };
}

export function puzzleFor(date: string, items: ThenNowItem[]): YearPuzzle {
  const idx = dayIndex(date);
  const rand = rng(idx * 2654435761 + 1980);
  const pool = fullCoverage(items);
  const { firstYear, latestYear } = yearSpan(pool);
  const years = shuffle(
    buckets(firstYear, latestYear).map(([lo, hi]) => lo + Math.floor(rand() * (hi - lo + 1))),
    rand
  );
  const taken = new Set<string>();
  const receipts = years.map((y) => {
    const r = receiptFor(y, pool, rand, firstYear, latestYear, taken);
    r.items.forEach((i) => taken.add(i.id));
    return r;
  });
  return { number: idx + 1, date, firstYear, latestYear, receipts };
}

export function roundScore(guess: number, year: number): number {
  return Math.round(ROUND_MAX * Math.max(0, 1 - Math.abs(guess - year) / ZERO_AT));
}

export function totalScore(p: YearPuzzle, guesses: number[]): number {
  return guesses.reduce((s, g, i) => s + (i < ROUNDS ? roundScore(g, p.receipts[i].year) : 0), 0);
}

export function missEmoji(miss: number): string {
  if (miss <= 1) return "🟩";
  if (miss <= 3) return "🟨";
  if (miss <= 7) return "🟧";
  return "⬛";
}

export function basketMinutes(
  items: ThenNowItem[],
  year: number,
  wage: Record<number, number>
): number | null {
  const hourly = wage[year];
  if (!hourly) return null;
  return (items.reduce((s, i) => s + i.prices[year], 0) / hourly) * 60;
}

export interface YearState {
  date: string;
  guesses: number[];
}

export function isOver(state: YearState): boolean {
  return state.guesses.length >= ROUNDS;
}

export function result(p: YearPuzzle, state: YearState): string {
  return `${totalScore(p, state.guesses)}/${ROUNDS * ROUND_MAX}`;
}

export function averageMiss(p: YearPuzzle, guesses: number[]): number {
  if (guesses.length === 0) return 0;
  return guesses.reduce((s, g, i) => s + Math.abs(g - p.receipts[i].year), 0) / guesses.length;
}

export function shareText(p: YearPuzzle, state: YearState, url: string): string {
  const row = state.guesses.map((g, i) => missEmoji(Math.abs(g - p.receipts[i].year))).join("");
  return [
    `Price Year #${p.number} ${result(p, state)}`,
    row,
    `Avg miss ${averageMiss(p, state.guesses).toFixed(1)} yrs`,
    url,
  ].join("\n");
}

export const KEY = "pricele:price-year";

export function loadState(date: string, key: string = KEY): YearState {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const s = JSON.parse(raw) as YearState;
      if (s.date === date && Array.isArray(s.guesses)) return s;
    }
  } catch {
    return { date, guesses: [] };
  }
  return { date, guesses: [] };
}

export function saveState(state: YearState, key: string = KEY): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    return;
  }
}
