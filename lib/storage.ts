// Player state lives in localStorage. Two separate keys:
//   - today's game, keyed by the player's local date, so it resets each day.
//   - lifetime stats (streak, win rate, guess distribution), which persist.
// All access is guarded for the server render, where window is undefined.

import type { Band } from "./scoring";
import { isoDate } from "./puzzle";
import { MAX_GUESSES } from "./share";

export interface GuessRecord {
  value: number;
  band: Band;
  direction: "too_high" | "too_low" | "exact";
  closeness: number;
}

export interface DayState {
  date: string; // local ISO date this state belongs to
  guesses: GuessRecord[];
  done: boolean;
  won: boolean;
}

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[i] = games won using (i + 1) guesses. */
  distribution: number[];
  lastCompletedDate: string;
}

const dayKey = (date: string) => `pricele:day:${date}`;
const STATS_KEY = "pricele:stats";

export const EMPTY_STATS: Stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array(MAX_GUESSES).fill(0),
  lastCompletedDate: "",
};

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function read<T>(key: string): T | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or privacy mode: game still works in memory for this session */
  }
}

export function loadDayState(date: string): DayState {
  const existing = read<DayState>(dayKey(date));
  if (existing && existing.date === date) return existing;
  return { date, guesses: [], done: false, won: false };
}

export function saveDayState(state: DayState): void {
  write(dayKey(state.date), state);
}

export function loadStats(): Stats {
  const s = read<Stats>(STATS_KEY);
  if (!s) return { ...EMPTY_STATS, distribution: [...EMPTY_STATS.distribution] };
  // Be tolerant of older/partial shapes.
  return {
    ...EMPTY_STATS,
    ...s,
    distribution:
      Array.isArray(s.distribution) && s.distribution.length === MAX_GUESSES
        ? s.distribution
        : [...EMPTY_STATS.distribution],
  };
}

function isoYesterday(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return isoDate(new Date(y, m - 1, d - 1));
}

/**
 * True when the player has a live streak they could lose today: they've won
 * before, their last completed day was *yesterday* (streak still valid), and
 * they haven't finished today's puzzle yet. Drives the "protect your streak"
 * nudge. If they last played earlier than yesterday the streak is already dead,
 * so there's nothing to protect and we stay quiet.
 */
export function streakAtRisk(stats: Stats, today: string): boolean {
  return (
    stats.currentStreak > 0 &&
    stats.lastCompletedDate !== today &&
    stats.lastCompletedDate === isoYesterday(today)
  );
}

// Streak milestones. Most players who quit do so in the first week, so the
// early markers matter more than the far ones.
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

/** The milestone this streak just hit, or null if it isn't on one. */
export function milestoneFor(streak: number): number | null {
  return STREAK_MILESTONES.find((m) => m === streak) ?? null;
}

/** The next milestone to aim for, or null once they're all passed. */
export function nextMilestone(streak: number): number | null {
  return STREAK_MILESTONES.find((m) => m > streak) ?? null;
}

/** True when the player has never lost a game (and has played at least a few). */
export function isPerfect(stats: Stats): boolean {
  return stats.played >= 3 && stats.wins === stats.played;
}

/**
 * Fold a finished game into lifetime stats, idempotently for a given day.
 * A loss still counts as played and breaks the streak; only a win extends it
 * and lands in the guess distribution.
 */
export function recordCompletion(
  date: string,
  won: boolean,
  numGuesses: number
): Stats {
  const stats = loadStats();
  if (stats.lastCompletedDate === date) return stats;

  const continues = stats.lastCompletedDate === isoYesterday(date);
  const currentStreak = won ? (continues ? stats.currentStreak : 0) + 1 : 0;

  const distribution = [...stats.distribution];
  if (won && numGuesses >= 1 && numGuesses <= MAX_GUESSES) {
    distribution[numGuesses - 1] += 1;
  }

  const next: Stats = {
    played: stats.played + 1,
    wins: stats.wins + (won ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    distribution,
    lastCompletedDate: date,
  };
  write(STATS_KEY, next);
  return next;
}
