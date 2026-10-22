import { getItem } from "@/data/items";
import { pairForDate } from "./catalog";
import { isPlayablePair, toCard, type Card } from "./higherlower";
import { PRICES, dateFromISO } from "./puzzle";

export const CARDS = 10;
export const CALLS = CARDS - 1;
export const EPOCH = "2026-10-22";
const DAY_MS = 86_400_000;

export type Call = "higher" | "lower";

export interface ChainPuzzle {
  number: number;
  date: string;
  cards: Card[];
}

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

const cardKey = (c: Card) => `${c.itemId}:${c.countryName}`;

function deckFor(date: string): Card[] {
  const hidden = new Set<string>();
  const base = dateFromISO(date);
  for (const offset of [-1, 0, 1]) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
    const pair = pairForDate(d);
    if (pair) hidden.add(`${pair.itemId}:${pair.countryCode}`);
  }
  return PRICES.filter((p) => p.priceUSD > 0 && !hidden.has(`${p.itemId}:${p.countryCode}`))
    .map((p) => {
      const item = getItem(p.itemId);
      return item ? toCard(p, item.name) : null;
    })
    .filter((c): c is Card => c !== null);
}

export function puzzleFor(date: string): ChainPuzzle {
  const idx = dayIndex(date);
  const rand = rng(idx * 2654435761 + 4242);
  const deck = deckFor(date);

  for (let attempt = 0; attempt < 50; attempt++) {
    const cards = [deck[Math.floor(rand() * deck.length)]];
    const used = new Set([cardKey(cards[0])]);
    while (cards.length < CARDS) {
      const prev = cards[cards.length - 1];
      let next: Card | null = null;
      for (let i = 0; i < 400 && !next; i++) {
        const c = deck[Math.floor(rand() * deck.length)];
        if (!used.has(cardKey(c)) && c.itemId !== prev.itemId && isPlayablePair(prev, c)) next = c;
      }
      if (!next) break;
      cards.push(next);
      used.add(cardKey(next));
    }
    if (cards.length === CARDS) return { number: idx + 1, date, cards };
  }
  throw new Error(`No chain for ${date}`);
}

export function truth(p: ChainPuzzle, i: number): Call {
  return p.cards[i + 1].priceUSD > p.cards[i].priceUSD ? "higher" : "lower";
}

export function score(p: ChainPuzzle, calls: Call[]): number {
  return calls.filter((c, i) => i < CALLS && c === truth(p, i)).length;
}

export interface ChainState {
  date: string;
  calls: Call[];
}

export function isOver(state: ChainState): boolean {
  return state.calls.length >= CALLS;
}

export function result(p: ChainPuzzle, state: ChainState): string {
  return `${score(p, state.calls)}/${CALLS}`;
}

export function shareText(p: ChainPuzzle, state: ChainState, url: string): string {
  const row = state.calls.map((c, i) => (c === truth(p, i) ? "🟩" : "🟥")).join("");
  return [`Higher or Lower Daily #${p.number} ${result(p, state)}`, row, url].join("\n");
}

export const KEY = "pricele:price-chain";

export function loadState(date: string): ChainState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as ChainState;
      if (s.date === date && Array.isArray(s.calls)) return s;
    }
  } catch {
    return { date, calls: [] };
  }
  return { date, calls: [] };
}

export function saveState(state: ChainState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    return;
  }
}
