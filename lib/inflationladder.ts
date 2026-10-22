import type { ThenNowItem } from "./thenandnow";

export interface Rung {
  item: ThenNowItem;
  from: number;
  to: number;
  change: number;
}

export interface LadderPuzzle {
  number: number;
  date: string;
  baseYear: number;
  latestYear: number;
  rungs: Rung[];
  answer: string[];
}

export const RUNGS = 4;
export const MAX_TRIES = 3;
export const MIN_SPREAD = 0.15;
export const EPOCH = "2026-10-22";
const BASE_YEARS = [1995, 1998, 2000, 2002, 2005, 2008, 2010];

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

function latestYearOf(items: ThenNowItem[]): number {
  return Math.min(...items.map((i) => Math.max(...Object.keys(i.prices).map(Number))));
}

function rungFor(item: ThenNowItem, from: number, to: number): Rung | null {
  const a = item.prices[from];
  const b = item.prices[to];
  if (!a || !b) return null;
  return { item, from: a, to: b, change: b / a - 1 };
}

function wellSpread(rungs: Rung[]): boolean {
  const sorted = rungs.map((r) => r.change).sort((x, y) => x - y);
  return sorted.every((c, i) => i === 0 || c - sorted[i - 1] >= MIN_SPREAD);
}

export function puzzleFor(date: string, items: ThenNowItem[]): LadderPuzzle {
  const idx = dayIndex(date);
  const rand = rng(idx * 2246822519 + 97);
  const latestYear = latestYearOf(items);
  const years = BASE_YEARS.filter((y) => y < latestYear - 10);
  const baseYear = years[Math.floor(rand() * years.length)];
  const pool = items
    .map((i) => rungFor(i, baseYear, latestYear))
    .filter((r): r is Rung => r !== null);

  let rungs: Rung[] = [];
  for (let attempt = 0; attempt < 500; attempt++) {
    const picked = new Set<number>();
    while (picked.size < RUNGS) picked.add(Math.floor(rand() * pool.length));
    rungs = [...picked].map((i) => pool[i]);
    if (wellSpread(rungs)) break;
  }

  const answer = [...rungs].sort((a, b) => b.change - a.change).map((r) => r.item.id);
  return { number: idx + 1, date, baseYear, latestYear, rungs, answer };
}

export type Mark = "right" | "wrong";

export function markOrder(order: string[], answer: string[]): Mark[] {
  return order.map((id, i) => (answer[i] === id ? "right" : "wrong"));
}

export function isSolved(order: string[], answer: string[]): boolean {
  return markOrder(order, answer).every((m) => m === "right");
}

export interface LadderState {
  date: string;
  tries: string[][];
}

export function isOver(state: LadderState, answer: string[]): boolean {
  return state.tries.some((t) => isSolved(t, answer)) || state.tries.length >= MAX_TRIES;
}

export function result(state: LadderState, answer: string[]): string {
  const solvedAt = state.tries.findIndex((t) => isSolved(t, answer));
  return `${solvedAt >= 0 ? solvedAt + 1 : "X"}/${MAX_TRIES}`;
}

export function moveRung(order: string[], from: number, to: number): string[] {
  if (to < 0 || to >= order.length || from === to) return order;
  const next = [...order];
  const [id] = next.splice(from, 1);
  next.splice(to, 0, id);
  return next;
}

export function shareText(p: LadderPuzzle, state: LadderState, url: string): string {
  const rows = state.tries.map((t) =>
    markOrder(t, p.answer)
      .map((m) => (m === "right" ? "🟩" : "⬜"))
      .join("")
  );
  return [
    `Inflation Ladder #${p.number} ${result(state, p.answer)}`,
    `Since ${p.baseYear}`,
    ...rows,
    url,
  ].join("\n");
}

export function percent(change: number): string {
  const n = Math.round(change * 100);
  return `${n >= 0 ? "+" : ""}${n}%`;
}

export const KEY = "pricele:inflation-ladder";

export function loadState(date: string): LadderState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as LadderState;
      if (s.date === date && Array.isArray(s.tries)) return s;
    }
  } catch {
    return { date, tries: [] };
  }
  return { date, tries: [] };
}

export function saveState(state: LadderState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    return;
  }
}
