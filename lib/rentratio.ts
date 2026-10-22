// Rent Ratio: a daily game on HUD Fair Market Rents. Each day has five
// head-to-head rounds: two U.S. metro areas, pick the one whose FY2026 HUD
// fair market rent for a two-bedroom is higher. Numbers come only from
// data/rent-ratio.ts (generated from HUD's published FMRs); nothing here is
// estimated. An FMR is HUD's payment-standard benchmark (roughly the 40th
// percentile of recent movers' gross rent), not a market median, so copy must
// say "fair market rent".

export interface RentArea {
  id: string;
  name: string;
  /** The HUD FMR area name exactly as HUD publishes it. */
  hudArea: string;
  /** HUD FMR area code. */
  code: string;
  /** Monthly FMR in USD for 0-4 bedrooms. */
  fmr: [number, number, number, number, number];
}

export interface RentRound {
  a: RentArea;
  b: RentArea;
}

export interface RentPuzzle {
  number: number;
  date: string;
  rounds: RentRound[];
}

export const ROUNDS = 5;
/** Pairs closer than this many dollars are skipped so every round has a clear answer. */
export const MIN_GAP = 40;
/** Puzzle #1. */
export const EPOCH = "2026-10-22";
export const FY = "FY2026";

const DAY_MS = 86_400_000;

export function dayIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [ey, em, ed] = EPOCH.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / DAY_MS);
}

/** mulberry32 PRNG, seeded per day. */
function rng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const twoBed = (a: RentArea) => a.fmr[2];

export function puzzleFor(date: string, areas: RentArea[]): RentPuzzle {
  const idx = dayIndex(date);
  const rand = rng(idx * 2654435761 + 12345);
  const used = new Set<string>();
  const rounds: RentRound[] = [];
  let tries = 0;
  while (rounds.length < ROUNDS && tries < 10_000) {
    tries++;
    const a = areas[Math.floor(rand() * areas.length)];
    const b = areas[Math.floor(rand() * areas.length)];
    if (a.id === b.id || used.has(a.id) || used.has(b.id)) continue;
    if (Math.abs(twoBed(a) - twoBed(b)) < MIN_GAP) continue;
    used.add(a.id);
    used.add(b.id);
    rounds.push({ a, b });
  }
  return { number: idx + 1, date, rounds };
}

/** Pick is "a" or "b"; true if it has the higher two-bedroom FMR. */
export function isCorrect(round: RentRound, pick: "a" | "b"): boolean {
  const hi = twoBed(round.a) > twoBed(round.b) ? "a" : "b";
  return pick === hi;
}

export interface RentState {
  date: string;
  picks: ("a" | "b")[];
}

export function isOver(state: RentState): boolean {
  return state.picks.length >= ROUNDS;
}

export function score(p: RentPuzzle, picks: ("a" | "b")[]): number {
  return picks.filter((k, i) => p.rounds[i] && isCorrect(p.rounds[i], k)).length;
}

export function shareText(p: RentPuzzle, picks: ("a" | "b")[], url: string): string {
  const row = picks.map((k, i) => (isCorrect(p.rounds[i], k) ? "🟩" : "🟥")).join("");
  return `Rent Ratio #${p.number} ${score(p, picks)}/${ROUNDS}\n${row}\n${url}`;
}

const KEY = "pricele:rent-ratio";

export function loadState(date: string): RentState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as RentState;
      if (s.date === date && Array.isArray(s.picks)) return s;
    }
  } catch {
    /* storage blocked or corrupt: start fresh */
  }
  return { date, picks: [] };
}

export function saveState(state: RentState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
