// One record per finished day, kept alongside the lifetime totals in
// lib/storage.ts.
//
// The totals cannot answer "which stalls have you bought at" or "how was your
// week", because a running sum throws away everything except the sum. This is
// the tape those two features read from, and it is deliberately a separate key:
// if the history is ever lost or has to be trimmed, the streak and the win rate
// are untouched. Nothing here is allowed to be load-bearing for a streak.

import { isoDate, dateFromISO } from "./puzzle";

export interface PlayRecord {
  /** Local ISO date. Unique: one record per day, last write wins. */
  date: string;
  itemId: string;
  itemName: string;
  countryCode: string;
  countryName: string;
  flag: string;
  won: boolean;
  numGuesses: number;
  /** The opening bid, in USD. The purest read on the player's prejudice. */
  firstGuessUSD: number;
  /** How far the closest bid landed, as a percentage. */
  bestPctOff: number;
  /** The published price, in USD. Stored so the week can be recomputed. */
  actualUSD: number;
  /** The round score out of 1000. */
  score: number;
  /** The verdict title, stored rather than recomputed so old rounds keep theirs. */
  persona: string;
}

const HISTORY_KEY = "pricele:history";

// Roughly fourteen months. Long enough that a year-long player keeps a full
// passport, short enough that the key never approaches the 5 MB localStorage
// budget. Trimming drops the oldest records first.
const MAX_RECORDS = 430;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadHistory(): PlayRecord[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as PlayRecord[]) : [];
  } catch {
    return [];
  }
}

/**
 * Add or replace the record for a day and return the new history, newest last.
 *
 * Pure, so the ordering and trimming rules are testable without a browser.
 */
export function withRecord(
  history: PlayRecord[],
  record: PlayRecord
): PlayRecord[] {
  const rest = history.filter((r) => r.date !== record.date);
  const next = [...rest, record].sort((a, b) => a.date.localeCompare(b.date));
  return next.length > MAX_RECORDS ? next.slice(next.length - MAX_RECORDS) : next;
}

export function recordPlay(record: PlayRecord): PlayRecord[] {
  const next = withRecord(loadHistory(), record);
  if (!hasStorage()) return next;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* quota or privacy mode: the passport just won't remember this one */
  }
  return next;
}

export interface Stamp {
  countryCode: string;
  countryName: string;
  flag: string;
  /** Distinct items bought in this country. */
  items: string[];
  /** Items solved here. */
  solved: string[];
  lastPlayed: string;
}

/**
 * The passport: one page per country, one visa stamp per item bought there.
 *
 * This is the retention object a streak cannot be. The table is 49 countries by
 * 16 items and a given pair only recurs every 784 days, so the collection has a
 * genuine long tail: a player two years in still has stamps they have never
 * seen. A streak, by contrast, is one number that stops being interesting the
 * moment it is large.
 */
export function passport(history: PlayRecord[]): Stamp[] {
  const byCountry = new Map<string, Stamp>();
  for (const r of history) {
    const existing = byCountry.get(r.countryCode);
    if (existing) {
      if (!existing.items.includes(r.itemId)) existing.items.push(r.itemId);
      if (r.won && !existing.solved.includes(r.itemId)) {
        existing.solved.push(r.itemId);
      }
      if (r.date > existing.lastPlayed) existing.lastPlayed = r.date;
    } else {
      byCountry.set(r.countryCode, {
        countryCode: r.countryCode,
        countryName: r.countryName,
        flag: r.flag,
        items: [r.itemId],
        solved: r.won ? [r.itemId] : [],
        lastPlayed: r.date,
      });
    }
  }
  return [...byCountry.values()].sort((a, b) =>
    a.countryName.localeCompare(b.countryName)
  );
}

/** ISO date `days` before an ISO date, in local calendar terms. */
function daysBefore(iso: string, days: number): string {
  const d = dateFromISO(iso);
  return isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - days));
}

/** The last seven days of records, oldest first, ending on `today`. */
export function weekOf(history: PlayRecord[], today: string): PlayRecord[] {
  const from = daysBefore(today, 6);
  return history.filter((r) => r.date >= from && r.date <= today);
}

export interface WeekSummary {
  played: number;
  wins: number;
  points: number;
  /** Mean absolute opening error over the week, as a percentage. */
  openingErrorPct: number | null;
  worst: PlayRecord | null;
  best: PlayRecord | null;
  /** The verdict that came up most often. Ties break towards the recent one. */
  persona: string | null;
}

/**
 * A week, cut the way Wrapped cuts a year: the same records the player already
 * has, arranged so there is something to react to. Nothing new is stored for it,
 * which is the whole appeal of the format.
 */
export function summariseWeek(records: PlayRecord[]): WeekSummary {
  if (records.length === 0) {
    return {
      played: 0,
      wins: 0,
      points: 0,
      openingErrorPct: null,
      worst: null,
      best: null,
      persona: null,
    };
  }

  let worst = records[0];
  let best = records[0];
  let logSum = 0;
  let points = 0;
  const counts = new Map<string, number>();
  let persona = records[0].persona;
  let topCount = 0;

  for (const r of records) {
    if (r.firstGuessUSD > 0 && r.actualUSD > 0) {
      logSum += Math.abs(Math.log(r.firstGuessUSD / r.actualUSD));
    }
    points += r.score;
    if (r.bestPctOff > worst.bestPctOff) worst = r;
    if (r.bestPctOff < best.bestPctOff) best = r;
    const n = (counts.get(r.persona) ?? 0) + 1;
    counts.set(r.persona, n);
    // >= rather than >, so a tie resolves to the later record in the week.
    if (n >= topCount) {
      topCount = n;
      persona = r.persona;
    }
  }

  return {
    played: records.length,
    wins: records.filter((r) => r.won).length,
    points,
    openingErrorPct: Math.round((Math.exp(logSum / records.length) - 1) * 100),
    worst,
    best,
    persona,
  };
}
