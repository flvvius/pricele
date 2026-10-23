import { GAMES, type KV } from "./games";
import { isOver as p1000Over, result as p1000Result, puzzleFor as p1000Puzzle } from "./pricele1000";

export const MIN_RANKED = 25;

const FEWEST_TRIES_WINS = new Set(["price-atlas", "then-and-now", "inflation-ladder"]);

export const RANKED_GAMES = [
  ...GAMES.filter((g) => g.slug !== "pricele").map((g) => g.slug),
  "pricele-1000",
];

export function isRankedGame(slug: string): boolean {
  return RANKED_GAMES.includes(slug);
}

function finishedResult(slug: string, date: string, state: unknown): string | null {
  if (!state || typeof state !== "object") return null;
  const s = { ...(state as Record<string, unknown>), date };
  if (slug === "pricele-1000") {
    const st = s as { date: string; guesses: number[] };
    if (!Array.isArray(st.guesses) || !st.guesses.every((g) => typeof g === "number")) {
      return null;
    }
    return p1000Over(st) ? p1000Result(p1000Puzzle(date), st) : null;
  }
  const game = GAMES.find((g) => g.slug === slug);
  if (!game) return null;
  const raw = JSON.stringify(s);
  const kv: KV = { getItem: () => raw };
  try {
    const st = game.status(date, kv);
    return st.phase === "done" && st.result ? st.result : null;
  } catch {
    return null;
  }
}

export function scoreFromResult(slug: string, result: string): number | null {
  const m = /^(X|\d+)\/(\d+)$/.exec(result);
  if (!m) return null;
  const max = Number(m[2]);
  if (FEWEST_TRIES_WINS.has(slug)) return m[1] === "X" ? 0 : max + 1 - Number(m[1]);
  return m[1] === "X" ? 0 : Number(m[1]);
}

export function rankedScore(slug: string, date: string, state: unknown): number | null {
  if (!isRankedGame(slug)) return null;
  const r = finishedResult(slug, date, state);
  return r === null ? null : scoreFromResult(slug, r);
}

export interface ScoreCount {
  score: number;
  n: number;
}

export interface Standing {
  plays: number;
  beaten: number;
  tied: number;
}

export function standing(counts: ScoreCount[], mine: number): Standing {
  let plays = 0;
  let beaten = 0;
  let tied = 0;
  for (const { score, n } of counts) {
    plays += n;
    if (score < mine) beaten += n;
    else if (score === mine) tied += n;
  }
  return { plays, beaten, tied };
}

export function standingLine(s: Standing | null, gameName: string): string | null {
  if (!s || s.plays < 1) return null;
  if (s.plays < MIN_RANKED) {
    const others = s.plays - 1;
    if (others < 1) return `You're the first to finish today's ${gameName}.`;
    return `${s.plays} players have finished today's ${gameName} so far.`;
  }
  const others = s.plays - 1;
  const pct = Math.floor((100 * s.beaten) / others);
  if (s.beaten === others) return `Top score today: you beat all ${others} other players.`;
  if (s.beaten === 0) {
    return s.tied > 1
      ? `${s.tied - 1} other players scored the same. Nobody scored lower today.`
      : `A rough one. Every other player today scored higher.`;
  }
  return `You beat ${pct}% of today's ${s.plays.toLocaleString("en-US")} players.`;
}
