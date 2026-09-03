// Player state lives in localStorage. Four separate keys:
//   - today's game, keyed by the player's local date, so it resets each day.
//   - lifetime stats (streak, win rate, guess distribution), which persist.
//   - the play history, one entry per finished day, for the passport and wrapped.
//   - opt-in mode flags.
// All access is guarded for the server render, where window is undefined.
//
// NOTHING IN THIS FILE MAY EVER RESET A STORED STREAK. Spotify wiped Heardle's
// streaks during a migration and the traffic was down 85% eight months later.
// There are no accounts here, so a player's entire relationship with the game is
// these keys. Every read merges forward onto EMPTY_STATS, so a stats object
// written by an older build keeps every value it had and picks up defaults for
// whatever is new. Adding a field is safe. Renaming or repurposing one is not.

import type { Band } from "./scoring";
import { isoDate } from "./puzzle";
import { MAX_GUESSES } from "./share";
import type { ItemCategory } from "@/data/items";

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

/**
 * Running totals for one item category, in log space.
 *
 * `logSum` is the sum of ln(guess / actual) across opening bids, so it keeps its
 * sign: a player who is consistently high accumulates a positive sum and one who
 * is consistently low a negative one. That is what makes "you overestimate food
 * by 22% and underestimate energy by 15%" answerable, which a sum of absolute
 * errors could never be, because the direction is the interesting half.
 */
export interface CategoryBias {
  logSum: number;
  /** Sum of |ln(guess / actual)|, for the size of the error regardless of side. */
  absLogSum: number;
  n: number;
}

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[i] = games won using (i + 1) guesses. */
  distribution: number[];
  lastCompletedDate: string;

  /** Unspent streak passes, capped at MAX_GRACE_DAYS. */
  graceDays: number;
  /** The last date a pass was spent, so the reveal can say so once. */
  graceUsedOn: string;

  /** Lifetime points, and the best single round. */
  points: number;
  bestScore: number;

  /** Opening-bid bias per item category. See CategoryBias. */
  bias: Partial<Record<ItemCategory, CategoryBias>>;

  /** Rounds where the player's best bid beat the baseline model. */
  botWins: number;
  botRounds: number;
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
  graceDays: 0,
  graceUsedOn: "",
  points: 0,
  bestScore: 0,
  bias: {},
  botWins: 0,
  botRounds: 0,
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

/**
 * Merge a stored stats object forward onto the current shape.
 *
 * Exported and pure so the migration itself is testable: this is the function
 * that has to be correct forever, because it is the only thing standing between
 * a schema change and a player's streak.
 */
export function migrateStats(stored: Partial<Stats> | null): Stats {
  if (!stored) {
    return { ...EMPTY_STATS, distribution: [...EMPTY_STATS.distribution], bias: {} };
  }

  const merged: Stats = {
    ...EMPTY_STATS,
    ...stored,
    distribution:
      Array.isArray(stored.distribution) &&
      stored.distribution.length === MAX_GUESSES
        ? stored.distribution
        : [...EMPTY_STATS.distribution],
    bias:
      stored.bias && typeof stored.bias === "object" ? { ...stored.bias } : {},
  };

  // A player arriving from a build with no passes has already earned some. They
  // put the streak together under the old rules and it would be a strange first
  // impression to introduce the mechanic by starting them at nothing, so the
  // ledger is settled once, on the read where the field is first missing.
  if (stored.graceDays === undefined) {
    merged.graceDays = Math.min(
      MAX_GRACE_DAYS,
      Math.floor((stored.currentStreak ?? 0) / GRACE_EVERY)
    );
  }

  return merged;
}

export function loadStats(): Stats {
  return migrateStats(read<Partial<Stats>>(STATS_KEY));
}

function isoYesterday(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return isoDate(new Date(y, m - 1, d - 1));
}

function isoDaysBefore(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return isoDate(new Date(y, m - 1, d - days));
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

// Streak passes. One per ten days of streak, never more than two banked.
//
// The cap is the part that matters and the part that is easy to get wrong.
// Duolingo caps free users at two freezes for a reason: a player sitting on ten
// passes has no streak, they have a number that cannot go down, and a number
// that cannot go down is worth nothing to look at. Two is enough to cover a
// weekend away and not enough to cover losing interest.
//
// Passes are earned *before* the miss and spent automatically. A lapsed player
// is by definition not on the site to buy, enable or claim anything, so any
// design that needs them to act at the moment of the miss protects nobody.
export const MAX_GRACE_DAYS = 2;
export const GRACE_EVERY = 10;

/** The on-brand name for a pass, used everywhere it is shown to a player. */
export const GRACE_NAME = "rain check";

// Streak milestones. Most players who quit do so in the first week, so the early
// markers are close together and the late ones are far apart. Names, not
// numbers: 30 is an arbitrary integer, "Frequent Flyer" is a thing to be.
export const STREAK_MILESTONES: { days: number; name: string }[] = [
  { days: 3, name: "Window Shopper" },
  { days: 7, name: "Regular Customer" },
  { days: 14, name: "Loyalty Card" },
  { days: 30, name: "Frequent Flyer" },
  { days: 60, name: "Duty Free" },
  { days: 100, name: "Bureau de Change" },
  { days: 365, name: "Central Banker" },
];

/** The milestone this streak just hit, or null if it isn't on one. */
export function milestoneFor(streak: number) {
  return STREAK_MILESTONES.find((m) => m.days === streak) ?? null;
}

/** The next milestone to aim for, or null once they're all passed. */
export function nextMilestone(streak: number) {
  return STREAK_MILESTONES.find((m) => m.days > streak) ?? null;
}

/** Every milestone the player has reached, for the stats panel ladder. */
export function earnedMilestones(maxStreak: number) {
  return STREAK_MILESTONES.filter((m) => m.days <= maxStreak);
}

/** True when the player has never lost a game (and has played at least a few). */
export function isPerfect(stats: Stats): boolean {
  return stats.played >= 3 && stats.wins === stats.played;
}

/** Below this many rounds in a category, its bias is not worth publishing. */
export const MIN_BIAS_ROUNDS = 4;

export interface CategoryReading {
  category: ItemCategory;
  /** Mean signed error as a percentage. Positive means the player bids high. */
  biasPct: number;
  /** Mean absolute error as a percentage, regardless of direction. */
  spreadPct: number;
  rounds: number;
}

/**
 * The calibration profile: how the player reads each kind of price.
 *
 * Immaculate Grid added a rarity score because being correct stopped separating
 * players once most of them were hitting nine out of nine. This is the same
 * move. A streak says how often you turn up; this says what you are actually
 * bad at, which is both more useful and more interesting to argue with.
 *
 * The mean is taken in log space and converted back, so a player who is twice
 * too high half the time and half too low the other half reads as unbiased,
 * which is correct, rather than as 25% high, which is what averaging raw
 * percentages would produce.
 */
export function calibrationProfile(stats: Stats): CategoryReading[] {
  const out: CategoryReading[] = [];
  for (const [category, b] of Object.entries(stats.bias)) {
    if (!b || b.n < MIN_BIAS_ROUNDS) continue;
    out.push({
      category: category as ItemCategory,
      biasPct: Math.round((Math.exp(b.logSum / b.n) - 1) * 100),
      spreadPct: Math.round((Math.exp(b.absLogSum / b.n) - 1) * 100),
      rounds: b.n,
    });
  }
  // Worst read first: that is the line the player wants to argue with.
  return out.sort((a, b) => b.spreadPct - a.spreadPct);
}

export interface Completion {
  date: string;
  won: boolean;
  numGuesses: number;
  /** ln(opening bid / real price). Signed, for the calibration profile. */
  openingLogError: number;
  category: ItemCategory;
  /** This round's points. */
  score: number;
  /** Whether the player's best bid beat the baseline model, when one was shown. */
  beatBot?: boolean;
}

/**
 * Fold a finished game into lifetime stats, idempotently for a given day.
 *
 * A loss still counts as played and breaks the streak; only a win extends it and
 * lands in the guess distribution. A single missed day between two wins is
 * covered by a pass if one is banked, and the streak carries as though the day
 * had been played.
 */
export function recordCompletion(date: string, c: Completion): Stats {
  const stats = loadStats();
  if (stats.lastCompletedDate === date) return stats;
  const next = applyCompletion(stats, date, c);
  write(STATS_KEY, next);
  return next;
}

/**
 * The pure half of recordCompletion: stats in, stats out, no storage.
 *
 * Split out so the streak rules can be tested directly. Everything that decides
 * whether a streak lives or dies happens here.
 */
export function applyCompletion(
  stats: Stats,
  date: string,
  c: Completion
): Stats {
  const playedYesterday = stats.lastCompletedDate === isoYesterday(date);
  // Exactly one day missed. Two or more is not a slip, it is a break, and no
  // number of banked passes should paper over it.
  const missedOneDay =
    !playedYesterday && stats.lastCompletedDate === isoDaysBefore(date, 2);

  const spendPass = c.won && missedOneDay && stats.graceDays > 0;
  const continues = playedYesterday || spendPass;
  const currentStreak = c.won ? (continues ? stats.currentStreak : 0) + 1 : 0;

  const distribution = [...stats.distribution];
  if (c.won && c.numGuesses >= 1 && c.numGuesses <= MAX_GUESSES) {
    distribution[c.numGuesses - 1] += 1;
  }

  // Earned on the way past every tenth day, and only on the day the streak
  // actually lands on the multiple, so a streak of 23 cannot keep paying out.
  const earnedPass =
    currentStreak > 0 && currentStreak % GRACE_EVERY === 0 ? 1 : 0;
  const graceDays = Math.min(
    MAX_GRACE_DAYS,
    stats.graceDays - (spendPass ? 1 : 0) + earnedPass
  );

  const previous = stats.bias[c.category] ?? { logSum: 0, absLogSum: 0, n: 0 };
  const bias = {
    ...stats.bias,
    [c.category]: {
      logSum: previous.logSum + c.openingLogError,
      absLogSum: previous.absLogSum + Math.abs(c.openingLogError),
      n: previous.n + 1,
    },
  };

  return {
    played: stats.played + 1,
    wins: stats.wins + (c.won ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    distribution,
    lastCompletedDate: date,
    graceDays,
    graceUsedOn: spendPass ? date : stats.graceUsedOn,
    points: stats.points + c.score,
    bestScore: Math.max(stats.bestScore, c.score),
    bias,
    botWins: stats.botWins + (c.beatBot === true ? 1 : 0),
    botRounds: stats.botRounds + (c.beatBot === undefined ? 0 : 1),
  };
}
