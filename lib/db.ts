// The one place that talks to Postgres.
//
// Neon over the HTTP driver rather than a pooled TCP client. Every request to
// this site is a serverless invocation that lives for a few hundred
// milliseconds, and a connection pool in that shape is a liability: the pool
// outlives nothing, so you spend the request opening a socket you then throw
// away, and enough concurrent invocations exhaust the database's connection
// slots. The HTTP driver has no sockets and no pool. A query is a fetch.
//
// WITHOUT DATABASE_URL, EVERY FUNCTION HERE RETURNS NULL AND THE SITE IS EXACTLY
// WHAT IT WAS BEFORE. That is not a fallback bolted on afterwards, it is the
// contract. Pricele worked with no backend at all and the daily game still has
// to: a database outage, an unset variable on a preview deployment, or someone
// forking the repo should cost the crowd figures and the classroom, and nothing
// else. Callers check for null.

import { neon } from "@neondatabase/serverless";
import { CODE_ALPHABET, CODE_LENGTH } from "./room";

/** 5 percentage points per bucket, 40 buckets, so the histogram covers 0-200%. */
export const BUCKET_PCT = 5;
export const BUCKET_COUNT = 40;

/** The bucket a percentage error falls in, clamped into range. */
export function bucketFor(pctOff: number): number {
  const raw = Math.floor(Math.max(0, pctOff) / BUCKET_PCT);
  return Math.min(BUCKET_COUNT - 1, raw);
}

/** The everyone row. Player-country rows use an ISO code instead. */
export const ALL_PLAYERS = "";

type Sql = ReturnType<typeof neon>;

let cached: Sql | null = null;

/** True when the server features are configured. Safe to call anywhere. */
export function dbEnabled(): boolean {
  return !!process.env.DATABASE_URL;
}

/**
 * The SQL tag, or null when there is no database configured.
 *
 * Cached across invocations because a warm serverless container reuses the
 * module, and building the tag parses the connection string every time.
 */
export function db(): Sql | null {
  if (!dbEnabled()) return null;
  if (!cached) cached = neon(process.env.DATABASE_URL as string);
  return cached;
}

// ---------------------------------------------------------------------------
// Crowd statistics
// ---------------------------------------------------------------------------

export interface CrowdRow {
  plays: number;
  wins: number;
  first_log_sum: number;
  first_over: number;
  best_log_sum: number;
}

export interface CrowdStats {
  /** Everyone who played this pair on this date. */
  all: CrowdRow | null;
  /** The same, narrowed to players who said they are from the puzzle country. */
  locals: CrowdRow | null;
  /** How many players' closest bid was worse than the reader's. */
  worseThanReader: number | null;
}

/**
 * Read the day's aggregates.
 *
 * `readerBestPct` is optional and only affects `worseThanReader`, which powers
 * the "closer than 81% of players" line. Passing it here rather than doing the
 * arithmetic on the client keeps the histogram server-side, and the histogram is
 * the one part of this data that could be used to reverse out the answer while
 * the day is still live.
 */
export async function readCrowd(
  date: string,
  itemId: string,
  country: string,
  readerBestPct?: number
): Promise<CrowdStats | null> {
  const sql = db();
  if (!sql) return null;

  try {
    const rows = (await sql`
      select player_country, plays, wins, first_log_sum, first_over, best_log_sum
      from crowd_day
      where play_date = ${date} and item_id = ${itemId} and country = ${country}
        and player_country in (${ALL_PLAYERS}, ${country})
    `) as (CrowdRow & { player_country: string })[];

    const all = rows.find((r) => r.player_country === ALL_PLAYERS) ?? null;
    const locals = rows.find((r) => r.player_country === country) ?? null;

    let worseThanReader: number | null = null;
    if (readerBestPct !== undefined && all && all.plays > 0) {
      const bucket = bucketFor(readerBestPct);
      const [{ n }] = (await sql`
        select coalesce(sum(n), 0)::int as n
        from crowd_bucket
        where play_date = ${date} and item_id = ${itemId}
          and country = ${country} and bucket > ${bucket}
      `) as { n: number }[];
      worseThanReader = n;
    }

    return { all, locals, worseThanReader };
  } catch {
    // A database that is down must not take the reveal down with it. The caller
    // gets the same null it gets when there is no database at all.
    return null;
  }
}

export interface Submission {
  date: string;
  itemId: string;
  country: string;
  /** ISO code the player said they are from, or "" if they never said. */
  playerCountry: string;
  playerId: string;
  won: boolean;
  /** ln(opening bid / price). Signed. */
  firstLogError: number;
  /** How far the closest bid landed, as a percentage. */
  bestPctOff: number;
  /** True when the opening bid came in over. Computed on the server. */
  firstOver: boolean;
}

/**
 * Fold one finished round into the day's aggregates.
 *
 * Returns true when the round counted and false when it was a duplicate. Errors
 * are swallowed for the same reason as in readCrowd: a player finishing their
 * puzzle must never see a failure from a counter.
 */
export async function writeCrowd(s: Submission): Promise<boolean> {
  const sql = db();
  if (!sql) return false;

  try {
    // The gate. One row per browser per day, and a conflict means this browser
    // has already been counted, so nothing below runs.
    const claimed = (await sql`
      insert into crowd_submission (play_date, player_id)
      values (${s.date}, ${s.playerId})
      on conflict do nothing
      returning play_date
    `) as unknown[];
    if (claimed.length === 0) return false;

    const over = s.firstOver ? 1 : 0;
    const win = s.won ? 1 : 0;
    const bestLog = Math.log(1 + Math.max(0, s.bestPctOff) / 100);
    const bucket = bucketFor(s.bestPctOff);

    // The everyone row, the player's-country row, and the histogram bucket. Not
    // a transaction: they are three independent counters and a partial write
    // costs one player's contribution to one of them, which is a smaller problem
    // than a transaction held open across three HTTP round trips.
    const audiences = [ALL_PLAYERS];
    if (s.playerCountry) audiences.push(s.playerCountry);

    for (const audience of audiences) {
      await sql`
        insert into crowd_day (
          play_date, item_id, country, player_country,
          plays, wins, first_log_sum, first_over, best_log_sum
        )
        values (
          ${s.date}, ${s.itemId}, ${s.country}, ${audience},
          1, ${win}, ${s.firstLogError}, ${over}, ${bestLog}
        )
        on conflict (play_date, item_id, country, player_country) do update set
          plays         = crowd_day.plays + 1,
          wins          = crowd_day.wins + ${win},
          first_log_sum = crowd_day.first_log_sum + ${s.firstLogError},
          first_over    = crowd_day.first_over + ${over},
          best_log_sum  = crowd_day.best_log_sum + ${bestLog},
          updated_at    = now()
      `;
    }

    await sql`
      insert into crowd_bucket (play_date, item_id, country, bucket, n)
      values (${s.date}, ${s.itemId}, ${s.country}, ${bucket}, 1)
      on conflict (play_date, item_id, country, bucket) do update set
        n = crowd_bucket.n + 1
    `;

    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Classroom rooms
// ---------------------------------------------------------------------------

export interface RoomEntry {
  name: string;
  bid_usd: number;
  best_pct: number;
  won: boolean;
  num_guesses: number;
  score: number;
}

export interface Room {
  code: string;
  label: string;
  playDate: string;
  entries: RoomEntry[];
}

export { isRoomCode } from "./room";

function mintCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/**
 * Create a room, retrying on the vanishingly unlikely collision.
 *
 * Six attempts rather than one: `on conflict do nothing` makes a taken code a
 * silent no-op rather than an error, so without the retry a collision would hand
 * the teacher somebody else's room.
 */
export async function createRoom(
  playDate: string,
  label: string
): Promise<string | null> {
  const sql = db();
  if (!sql) return null;

  try {
    for (let attempt = 0; attempt < 6; attempt++) {
      const code = mintCode();
      const rows = (await sql`
        insert into room (code, play_date, label)
        values (${code}, ${playDate}, ${label})
        on conflict do nothing
        returning code
      `) as { code: string }[];
      if (rows.length > 0) return rows[0].code;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Whether this browser has already posted to this room today.
 *
 * The gate on the whole board. A room's bids bracket the real price between the
 * highest under-bid and the lowest over-bid, and with a class of thirty that
 * bracket is tight enough to be the answer. So the board is not public: you see
 * it once you have bid, and not before. The teacher plays first and then
 * projects, which is what they were going to do anyway.
 */
export async function hasRoomEntry(
  code: string,
  playDate: string,
  playerId: string
): Promise<boolean> {
  const sql = db();
  if (!sql) return false;
  try {
    const rows = (await sql`
      select 1 from room_entry
      where code = ${code} and play_date = ${playDate} and player_id = ${playerId}
      limit 1
    `) as unknown[];
    return rows.length > 0;
  } catch {
    return false;
  }
}

/** Read a room and its board, or null when the code does not exist. */
export async function readRoom(code: string): Promise<Room | null> {
  const sql = db();
  if (!sql) return null;

  try {
    const rooms = (await sql`
      select code, label, to_char(play_date, 'YYYY-MM-DD') as play_date
      from room where code = ${code}
    `) as { code: string; label: string; play_date: string }[];
    if (rooms.length === 0) return null;

    const entries = (await sql`
      select name, bid_usd, best_pct, won, num_guesses, score
      from room_entry
      where code = ${code} and play_date = ${rooms[0].play_date}
      order by created_at asc
    `) as RoomEntry[];

    return {
      code: rooms[0].code,
      label: rooms[0].label,
      playDate: rooms[0].play_date,
      entries,
    };
  } catch {
    return null;
  }
}

export interface EntryInput {
  code: string;
  playerId: string;
  playDate: string;
  name: string;
  bidUSD: number;
  bestPct: number;
  won: boolean;
  numGuesses: number;
  score: number;
}

/**
 * Post a result to a room. Upserts, so a player who replays does not appear
 * twice, and their latest attempt is what the board shows.
 */
export async function writeRoomEntry(e: EntryInput): Promise<boolean> {
  const sql = db();
  if (!sql) return false;

  try {
    const rows = (await sql`
      insert into room_entry (
        code, player_id, play_date, name,
        bid_usd, best_pct, won, num_guesses, score
      )
      values (
        ${e.code}, ${e.playerId}, ${e.playDate}, ${e.name},
        ${e.bidUSD}, ${e.bestPct}, ${e.won}, ${e.numGuesses}, ${e.score}
      )
      on conflict (code, player_id, play_date) do update set
        name        = excluded.name,
        bid_usd     = excluded.bid_usd,
        best_pct    = excluded.best_pct,
        won         = excluded.won,
        num_guesses = excluded.num_guesses,
        score       = excluded.score
      returning code
    `) as unknown[];
    return rows.length > 0;
  } catch {
    return false;
  }
}
