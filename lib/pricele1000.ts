import { pricesForItem } from "./catalog";
import {
  dayIndex,
  dealQuestions,
  puzzleFor as openRangePuzzle,
  type RangeQuestion,
} from "./openrange";

export interface ScoredRound extends RangeQuestion {
  weight: number;
  min: number;
  max: number;
}

export interface ScoredPuzzle {
  number: number;
  date: string;
  rounds: ScoredRound[];
}

export const WEIGHTS = [1, 1, 2, 3, 3];
export const ROUNDS = WEIGHTS.length;
export const ROUND_MAX = 100;
export const MAX_SCORE = ROUND_MAX * WEIGHTS.reduce((a, b) => a + b, 0);
export const ZERO_RATIO = 1.75;
const SLIDER_PAD = 1.5;

export function puzzleFor(date: string): ScoredPuzzle {
  const openRange = new Set(
    openRangePuzzle(date).questions.map((q) => `${q.price.itemId}:${q.price.countryCode}`)
  );
  const rounds = dealQuestions(date, ROUNDS, 1000, openRange).map((q, i) => {
    const all = pricesForItem(q.price.itemId).map((p) => p.priceUSD);
    return {
      ...q,
      weight: WEIGHTS[i],
      min: Math.min(...all) / SLIDER_PAD,
      max: Math.max(...all) * SLIDER_PAD,
    };
  });
  return { number: dayIndex(date) + 1, date, rounds };
}

export function offBy(guess: number, answer: number): number {
  return Math.abs(Math.log(guess / answer));
}

export function baseScore(guess: number, answer: number): number {
  if (!(guess > 0)) return 0;
  return Math.round(ROUND_MAX * Math.max(0, 1 - offBy(guess, answer) / Math.log(ZERO_RATIO)));
}

export function roundScore(round: ScoredRound, guess: number): number {
  return baseScore(guess, round.price.priceUSD) * round.weight;
}

export function totalScore(p: ScoredPuzzle, guesses: number[]): number {
  return guesses.reduce((s, g, i) => s + (i < ROUNDS ? roundScore(p.rounds[i], g) : 0), 0);
}

export function percentOff(guess: number, answer: number): number {
  return Math.abs(guess - answer) / answer;
}

export function bandEmoji(guess: number, answer: number): string {
  const off = percentOff(guess, answer);
  if (off <= 0.1) return "🟩";
  if (off <= 0.25) return "🟨";
  if (off <= 0.5) return "🟧";
  return "⬛";
}

export function sliderToPrice(t: number, min: number, max: number): number {
  return Math.exp(Math.log(min) + t * (Math.log(max) - Math.log(min)));
}

export function priceToSlider(price: number, min: number, max: number): number {
  return (Math.log(price) - Math.log(min)) / (Math.log(max) - Math.log(min));
}

export function roundPrice(n: number): number {
  if (n >= 100) return Math.round(n);
  if (n >= 10) return Math.round(n * 10) / 10;
  return Math.round(n * 100) / 100;
}

export interface ScoredState {
  date: string;
  guesses: number[];
}

export function isOver(state: ScoredState): boolean {
  return state.guesses.length >= ROUNDS;
}

export function result(p: ScoredPuzzle, state: ScoredState): string {
  return `${totalScore(p, state.guesses)}/${MAX_SCORE}`;
}

export function shareText(p: ScoredPuzzle, state: ScoredState, url: string): string {
  const row = state.guesses.map((g, i) => bandEmoji(g, p.rounds[i].price.priceUSD)).join("");
  return [`Pricele 1000 #${p.number} ${result(p, state)}`, row, url].join("\n");
}

export const KEY = "pricele:1000";

export function loadState(date: string): ScoredState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as ScoredState;
      if (s.date === date && Array.isArray(s.guesses)) return s;
    }
  } catch {
    return { date, guesses: [] };
  }
  return { date, guesses: [] };
}

export function saveState(state: ScoredState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    return;
  }
}
