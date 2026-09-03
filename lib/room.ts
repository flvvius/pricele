// Classroom rooms: the board rules, and the client half of joining one.
//
// This is the feature that changes distribution rather than retention. A teacher
// is not one player, they are thirty players and a reason to come back every
// term, and the thing standing between a daily game and a classroom is almost
// never the game. It is that joining requires an account. So a room here is a
// four-character code and nothing else: no sign-up, no email, no roster, no
// password. The teacher reads the code out; that is the access control.
//
// The board is scored on The Price Is Right's One Bid rule, which is the right
// rule for a room full of people rather than a leaderboard. Closest wins,
// *without going over*. It is fifty years old, everybody's parents know it, and
// it turns a spread of guesses into a moment: the winner is not whoever was
// nearest in absolute terms, it is whoever was boldest while staying under, and
// a room where everyone overbid has no winner at all, which is funnier and more
// instructive than a consolation prize.

import type { RoomEntry } from "./db";

/**
 * Codes a teacher can read off a whiteboard.
 *
 * No vowels, so the generator cannot produce a word anybody has to read out to a
 * classroom. No I, O, 0 or 1, because a code is going to be copied off a
 * projector at the back of a room. What is left is 28 symbols; four of them is
 * 614,656 combinations, which is far more than enough for a table that is swept
 * every 30 days.
 */
export const CODE_ALPHABET = "BCDFGHJKLMNPQRSTVWXYZ23456789";
export const CODE_LENGTH = 4;

export function isRoomCode(code: string): boolean {
  return (
    code.length === CODE_LENGTH &&
    [...code].every((c) => CODE_ALPHABET.includes(c))
  );
}


const NAME_KEY = "pricele:room-name";
const ROOM_KEY = "pricele:room-code";

/** Names are shown to a room full of other people, so they are kept short. */
export const MAX_NAME_LENGTH = 24;

/**
 * Clean a display name.
 *
 * This is the only user-typed text on the site that another person ever sees, so
 * it is stripped rather than trusted: control characters out, whitespace
 * collapsed, length capped. It is deliberately not a profanity filter. A
 * classroom has a teacher in it who can see the board and clear the room, and a
 * word list that tries to police thirty teenagers in every language the site is
 * read in would fail at that while breaking real names.
 */
export function cleanName(raw: string): string {
  return raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

export interface BoardRow extends RoomEntry {
  /** 1-based placing under the One Bid rule. Null when the bid went over. */
  place: number | null;
  /** True for the single winner, if there is one. */
  winner: boolean;
  /** True when this bid came in above the real price. */
  over: boolean;
}

export interface Board {
  rows: BoardRow[];
  /** The winning entry, or null when everyone overbid. */
  winner: BoardRow | null;
  /** True when not one bid came in at or under the price. */
  allOver: boolean;
}

/**
 * Rank a room's entries against the real price.
 *
 * Pure and exported so the rule is testable without a database, which matters
 * more here than anywhere else in the codebase: this is the only screen in the
 * game where being wrong is visible to thirty other people at once.
 *
 * Ties on the same bid share a place and neither wins, because two people who
 * bid identically have an identical claim and picking one on insertion order
 * would be arbitrary in front of a room.
 */
export function board(entries: RoomEntry[], actualUSD: number): Board {
  const rows: BoardRow[] = entries.map((e) => ({
    ...e,
    place: null,
    winner: false,
    over: e.bid_usd > actualUSD,
  }));

  const under = rows
    .filter((r) => !r.over)
    .sort((a, b) => b.bid_usd - a.bid_usd);

  // Place only the valid bids. An overbid is out of the round, so numbering it
  // "7th" would suggest it did better than an unplaced bid rather than being
  // disqualified.
  let place = 0;
  let previousBid: number | null = null;
  for (const row of under) {
    if (previousBid === null || row.bid_usd !== previousBid) place += 1;
    row.place = place;
    previousBid = row.bid_usd;
  }

  const topBid = under[0]?.bid_usd;
  const leaders = under.filter((r) => r.bid_usd === topBid);
  const winner = leaders.length === 1 ? leaders[0] : null;
  if (winner) winner.winner = true;

  // Sorted for display: valid bids by place, then everyone who went over,
  // nearest-over first, so the near misses read above the wild ones.
  const over = rows
    .filter((r) => r.over)
    .sort((a, b) => a.bid_usd - b.bid_usd);

  return { rows: [...under, ...over], winner, allOver: under.length === 0 };
}

// ---------------------------------------------------------------------------
// Client state
// ---------------------------------------------------------------------------

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadRoomName(): string {
  if (!hasStorage()) return "";
  try {
    return window.localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveRoomName(name: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(NAME_KEY, cleanName(name));
  } catch {
    /* private mode: they will be asked for a name again */
  }
}

/** The room this browser is currently playing in, or "". */
export function loadRoomCode(): string {
  if (!hasStorage()) return "";
  try {
    return window.localStorage.getItem(ROOM_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveRoomCode(code: string): void {
  if (!hasStorage()) return;
  try {
    if (code) window.localStorage.setItem(ROOM_KEY, code);
    else window.localStorage.removeItem(ROOM_KEY);
  } catch {
    /* nothing to do */
  }
}
