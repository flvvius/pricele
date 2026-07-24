// Player state lives in localStorage. Two separate keys:
//   - today's game, keyed by UTC date, so it resets each day.
//   - streak, which persists across days.
// All access is guarded for the server render, where window is undefined.

import type { Band } from "./scoring";
import { isoDateUTC } from "./puzzle";

export interface GuessRecord {
  value: number;
  band: Band;
  direction: "too_high" | "too_low" | "exact";
}

export interface DayState {
  date: string; // UTC ISO date this state belongs to
  guesses: GuessRecord[];
  done: boolean;
  won: boolean;
}

export interface Streak {
  count: number;
  lastCompletedDate: string; // UTC ISO date
}

const dayKey = (date: string) => `pricele:day:${date}`;
const STREAK_KEY = "pricele:streak";

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

export function loadStreak(): Streak {
  return read<Streak>(STREAK_KEY) ?? { count: 0, lastCompletedDate: "" };
}

/**
 * Record a completed game against the streak, idempotently for a given day.
 * - Same day already counted → unchanged.
 * - Completed the day immediately after lastCompletedDate → +1.
 * - Any gap (or first ever) → reset to 1.
 * A loss still "completes" the day for rollover, but only a win extends the streak.
 */
export function recordCompletion(date: string, won: boolean): Streak {
  const streak = loadStreak();
  if (streak.lastCompletedDate === date) return streak;

  let next: Streak;
  if (!won) {
    next = { count: 0, lastCompletedDate: date };
  } else {
    const prev = new Date(Date.parse(date + "T00:00:00Z") - 86400000);
    const wasYesterday = isoDateUTC(prev) === streak.lastCompletedDate;
    next = {
      count: wasYesterday ? streak.count + 1 : 1,
      lastCompletedDate: date,
    };
  }
  write(STREAK_KEY, next);
  return next;
}
