import { CAPITALS } from "@/data/capitals";
import { dealtInGames, getItem } from "@/data/items";
import { pairForDate } from "./catalog";
import { PRICES, dateFromISO, type PriceEntry } from "./puzzle";

export const MAX_GUESSES = 6;
export const START_CLUES = 3;
/**
 * Misses before the compass arrow shows. With an arrow from the first guess the
 * basket stopped mattering: two guesses and a map solved it, so players walked
 * the arrow instead of reading prices. Distance and the price comparison still
 * come back on every miss; direction is the late lifeline.
 */
export const ARROW_AFTER = 3;
export const EPOCH = "2026-10-22";

const FIRST_CLUES = ["big-mac", "cappuccino", "gasoline-1l", "beer-330ml", "milk-1l", "eggs-12"];
const DAY_MS = 86_400_000;
const EARTH_KM = 6371;

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface Clue {
  itemId: string;
  label: string;
  priceUSD: number;
}

export interface AtlasPuzzle {
  number: number;
  date: string;
  answer: Country;
  clues: Clue[];
}

export const COUNTRIES: Country[] = [
  ...new Map(
    PRICES.map((p) => [p.countryCode, { code: p.countryCode, name: p.countryName, flag: p.flag }])
  ).values(),
]
  .filter((c) => CAPITALS[c.code])
  .sort((a, b) => a.name.localeCompare(b.name));

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

function shuffled<T>(list: T[], rand: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const CYCLE = shuffled(
  COUNTRIES.map((c) => c.code),
  rng(0x5eed)
);

function rowsFor(code: string): PriceEntry[] {
  return PRICES.filter((p) => p.countryCode === code && p.priceUSD > 0);
}

export function puzzleFor(date: string): AtlasPuzzle {
  const avoid = pairForDate(dateFromISO(date));
  const idx = dayIndex(date);
  const lap = Math.floor(idx / CYCLE.length);
  let pos = ((idx % CYCLE.length) + CYCLE.length) % CYCLE.length;
  if (CYCLE[pos] === avoid?.countryCode) pos = (pos + Math.floor(CYCLE.length / 2)) % CYCLE.length;
  const code = CYCLE[pos];
  const answer = COUNTRIES.find((c) => c.code === code)!;

  const rand = rng(idx * 2654435761 + lap);
  const rows = rowsFor(code).filter((r) => dealtInGames(r.itemId, date));
  const lead = shuffled(
    rows.filter((r) => FIRST_CLUES.includes(r.itemId)),
    rand
  );
  const rest = shuffled(
    rows.filter((r) => !FIRST_CLUES.includes(r.itemId)),
    rand
  );
  const clues = [...lead.slice(0, START_CLUES), ...shuffled([...lead.slice(START_CLUES), ...rest], rand)]
    .map((r) => {
      const item = getItem(r.itemId);
      return item ? { itemId: r.itemId, label: item.name, priceUSD: r.priceUSD } : null;
    })
    .filter((c): c is Clue => c !== null);

  return { number: idx + 1, date, answer, clues };
}

export function visibleClues(p: AtlasPuzzle, misses: number): Clue[] {
  return p.clues.slice(0, START_CLUES + misses);
}

const rad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(from: string, to: string): number {
  const a = CAPITALS[from];
  const b = CAPITALS[to];
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * EARTH_KM * Math.asin(Math.sqrt(h)));
}

export function bearing(from: string, to: string): number {
  const a = CAPITALS[from];
  const b = CAPITALS[to];
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const ARROWS = ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️"];

export function arrow(deg: number): string {
  return ARROWS[Math.round(deg / 45) % 8];
}

export function proximity(km: number): string {
  if (km === 0) return "🟩";
  if (km < 1500) return "🟨";
  if (km < 5000) return "🟧";
  return "🟥";
}

export function priceLevel(answer: string, guess: string): number | null {
  const theirs = new Map(rowsFor(guess).map((r) => [r.itemId, r.priceUSD]));
  const logs = rowsFor(answer)
    .filter((r) => theirs.has(r.itemId))
    .map((r) => Math.log(r.priceUSD / theirs.get(r.itemId)!));
  if (logs.length < 3) return null;
  return Math.exp(logs.reduce((s, x) => s + x, 0) / logs.length) - 1;
}

export interface Feedback {
  code: string;
  km: number;
  arrow: string;
  level: number | null;
}

/** Feedback for a guess; `index` is its position in the round, from 0. */
export function feedback(p: AtlasPuzzle, guess: string, index: number): Feedback {
  const km = distanceKm(guess, p.answer.code);
  return {
    code: guess,
    km,
    arrow: km === 0 ? "🎯" : index >= ARROW_AFTER ? arrow(bearing(guess, p.answer.code)) : "",
    level: km === 0 ? null : priceLevel(p.answer.code, guess),
  };
}

export interface AtlasState {
  date: string;
  guesses: string[];
}

export function isWon(p: AtlasPuzzle, state: AtlasState): boolean {
  return state.guesses.includes(p.answer.code);
}

export function isOver(p: AtlasPuzzle, state: AtlasState): boolean {
  return isWon(p, state) || state.guesses.length >= MAX_GUESSES;
}

export function result(p: AtlasPuzzle, state: AtlasState): string {
  return `${isWon(p, state) ? state.guesses.length : "X"}/${MAX_GUESSES}`;
}

export function shareText(p: AtlasPuzzle, state: AtlasState, url: string): string {
  const rows = state.guesses.map((g, i) => {
    const f = feedback(p, g, i);
    return `${proximity(f.km)}${f.arrow}`;
  });
  return [`Price Atlas #${p.number} ${result(p, state)}`, rows.join(" "), url].join("\n");
}

export function matchCountries(query: string, exclude: string[] = []): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return COUNTRIES.filter(
    (c) => !exclude.includes(c.code) && c.name.toLowerCase().includes(q)
  ).sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts || a.name.localeCompare(b.name);
  });
}

export const KEY = "pricele:price-atlas";

export function loadState(date: string, key: string = KEY): AtlasState {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const s = JSON.parse(raw) as AtlasState;
      if (s.date === date && Array.isArray(s.guesses)) return s;
    }
  } catch {
    return { date, guesses: [] };
  }
  return { date, guesses: [] };
}

export function saveState(state: AtlasState, key: string = KEY): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    return;
  }
}
