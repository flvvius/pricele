// A week, packed small enough to live in a URL fragment.
//
// The point of the format is what it leaves out. A shared week carries the
// player's *errors* and nothing else: which item, which country, how far off
// they were, what the verdict said. It never carries a price and never carries a
// bid, because either one plus the other gives up an answer, and a pair recurs
// every 784 days. Someone opening a friend's week learns how badly the friend
// did and learns nothing that would spoil their own game.
//
// The payload rides in the fragment, after the #, which browsers do not send to
// the server. Nobody's week ends up in an access log, and the page that renders
// it is static.

import type { PlayRecord } from "./history";

/** One day, in the short field names the URL actually carries. */
export interface SharedDay {
  /** Item id. */
  i: string;
  /** Country code. */
  c: string;
  /** 1 when won. */
  w: 0 | 1;
  /** Closest bid, as a percentage off. */
  b: number;
  /** Round score. */
  s: number;
  /** The verdict title. */
  p: string;
}

export interface SharedWeek {
  /** Format version, so an old link keeps working when this changes. */
  v: 1;
  d: SharedDay[];
}

export function toSharedWeek(records: PlayRecord[]): SharedWeek {
  return {
    v: 1,
    d: records.map((r) => ({
      i: r.itemId,
      c: r.countryCode,
      w: r.won ? 1 : 0,
      b: Math.round(r.bestPctOff),
      s: Math.round(r.score),
      p: r.persona,
    })),
  };
}

/** base64url, so the payload survives a fragment without percent-encoding. */
function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(input, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(padded, "base64").toString("utf8");
}

export function encodeWeek(records: PlayRecord[]): string {
  return toBase64Url(JSON.stringify(toSharedWeek(records)));
}

/**
 * Decode a fragment back into a week, or null if it is not one.
 *
 * Anything can be typed after a #, so this validates shape and range rather than
 * trusting the parse. A malformed link renders the empty state, never a crash
 * and never a half-populated card.
 */
export function decodeWeek(encoded: string): SharedWeek | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;
    const week = parsed as SharedWeek;
    if (week.v !== 1 || !Array.isArray(week.d) || week.d.length > 7) return null;

    const ok = week.d.every(
      (d) =>
        typeof d.i === "string" &&
        /^[a-z0-9-]{1,32}$/.test(d.i) &&
        typeof d.c === "string" &&
        /^[A-Z]{2}$/.test(d.c) &&
        (d.w === 0 || d.w === 1) &&
        typeof d.b === "number" &&
        Number.isFinite(d.b) &&
        d.b >= 0 &&
        typeof d.s === "number" &&
        Number.isFinite(d.s) &&
        d.s >= 0 &&
        typeof d.p === "string" &&
        d.p.length <= 40
    );
    return ok ? week : null;
  } catch {
    return null;
  }
}

/**
 * The week written as a roast rather than a report.
 *
 * A friend forwarding your bad week travels further than you forwarding your
 * good one, which is the entire reason this is in the second person. Every line
 * is about a number, never about the person, the same rule as lib/verdict.ts.
 */
export function roastWeek(week: SharedWeek): string[] {
  const days = week.d;
  if (days.length === 0) return ["Nothing bought this week. Bold strategy."];

  const wins = days.filter((d) => d.w === 1).length;
  const worst = days.reduce((a, b) => (b.b > a.b ? b : a));
  const best = days.reduce((a, b) => (b.b < a.b ? b : a));
  const points = days.reduce((sum, d) => sum + d.s, 0);

  const lines: string[] = [];

  lines.push(
    wins === days.length
      ? `${wins} from ${days.length}. Nothing to work with here.`
      : wins === 0
        ? `${days.length} played, none solved. A clean sheet, of a kind.`
        : `${wins} from ${days.length}, for ${points.toLocaleString("en-US")} points.`
  );

  lines.push(`Worst day: ${worst.c}, ${worst.b}% out at the closest.`);
  if (best.b !== worst.b) {
    lines.push(`Best day: ${best.c}, ${best.b}% off.`);
  }

  const counts = new Map<string, number>();
  for (const d of days) counts.set(d.p, (counts.get(d.p) ?? 0) + 1);
  const [title, n] = [...counts.entries()].reduce((a, b) => (b[1] > a[1] ? b : a));
  lines.push(
    n > 1 ? `Verdict, ${n} days running: ${title}.` : `Verdict: ${title}.`
  );

  return lines;
}
