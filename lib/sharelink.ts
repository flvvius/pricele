// The links that leave the site inside a share, and the challenge they carry.
//
// Two jobs, both measured in group chats. First, a shared link has to say it
// was shared: one short tag, `s=n` (native share sheet) or `s=c` (copied),
// marks it so the landing can be counted (docs/growth.md, week 1). It used to
// be the full utm set, which tripled the link's length; a long query reads as
// a tracking or phishing link in a chat and people don't tap it. The campaign
// never needed to ride along: it is a function of the path (campaignForPath). Second, a link to a *day*
// rather than to the home page lets the unfurl show that day's item and
// country (app/d/[n]/opengraph-image.tsx) and lets the landing page put the
// sharer's result up as a score to beat.
//
// WHAT A LINK MUST NEVER CARRY: a guess, or the price. Same rule as the
// Receipt. The challenge is bids used and the round score, neither of which can
// be worked back into a price.
//
// Old utm-tagged links still in chats keep working: lib/analytics.ts reads both.
//
// Canonical URLs are untouched by any of this. The tags ride only on links
// handed to other people; every page still declares its own clean canonical,
// and /d/[n] declares the home page's.

import { SITE_URL } from "./seo";

export type ShareChannel = "native" | "copy";
export type ShareCampaign = "daily" | "weekly" | "today" | "years" | `game-${string}`;

/** The one query param that marks a shared link, and its channel codes. */
export const SHARE_PARAM = "s";
const CHANNEL_CODE: Record<ShareChannel, string> = { native: "n", copy: "c" };

export function channelFromCode(code: string | null): ShareChannel | null {
  if (code === "n") return "native";
  if (code === "c") return "copy";
  return null;
}

/**
 * `s=c&c=X/6`. Built by hand rather than with URLSearchParams, which would
 * write the slash in a game score as %2F. A slash is legal in a query and
 * reads as a score; %2F reads as noise. Callers only pass validated tokens.
 */
function shareQuery(channel: ShareChannel, challenge?: string): string {
  const q = `${SHARE_PARAM}=${CHANNEL_CODE[channel]}`;
  return challenge ? `${q}&c=${encodeURIComponent(challenge).replace(/%2F/g, "/")}` : q;
}

/** The campaign a shared link counts toward, worked out from where it lands. */
export function campaignForPath(pathname: string): ShareCampaign | "" {
  if (pathname === "/" || pathname.startsWith("/d/")) return "daily";
  if (pathname === "/week") return "weekly";
  if (pathname === "/today") return "today";
  if (pathname === "/years" || pathname.startsWith("/years/")) return "years";
  const game = /^\/games\/([a-z0-9-]+)$/.exec(pathname);
  return game ? `game-${game[1]}` : "";
}

/** What a challenge link remembers about the sharer's round. */
export interface Challenge {
  puzzleNumber: number;
  /** Bids used to solve it, or 0 when they did not. */
  bids: number;
  /** Round score, 0..1000. */
  score: number;
}

/**
 * `214-3-870`: puzzle, bids, score. Readable on purpose: there is nothing in
 * it to hide, and a short plain token survives every chat app's link parser.
 */
export function encodeChallenge({ puzzleNumber, bids, score }: Challenge): string {
  return `${puzzleNumber}-${bids}-${Math.round(score)}`;
}

/** Parse a `c` value back, or null for anything that isn't one. */
export function decodeChallenge(raw: string | null | undefined): Challenge | null {
  if (!raw) return null;
  const m = /^(\d{1,5})-([0-5])-(\d{1,4})$/.exec(raw);
  if (!m) return null;
  const puzzleNumber = Number(m[1]);
  const bids = Number(m[2]);
  const score = Number(m[3]);
  if (puzzleNumber < 1 || score > 1000) return null;
  return { puzzleNumber, bids, score };
}

/** The link to one day's puzzle, tagged, with the sharer's challenge. */
export function dayShareUrl(
  puzzleNumber: number,
  channel: ShareChannel,
  challenge?: Omit<Challenge, "puzzleNumber">
): string {
  const c = challenge ? encodeChallenge({ puzzleNumber, ...challenge }) : undefined;
  return `${SITE_URL}/d/${puzzleNumber}?${shareQuery(channel, c)}`;
}

/** The Weekly Wrapped link. The week itself stays in the fragment. */
export function weekShareUrl(fragment: string, channel: ShareChannel = "copy"): string {
  return `${SITE_URL}/week?${shareQuery(channel)}#${fragment}`;
}

/** The landing banner. Never names a price, only the sharer's numbers. */
export function challengeLine({ bids, score }: Challenge): string {
  return bids > 0
    ? `A friend got it in ${bids} (score ${score}). Can you beat them?`
    : `A friend didn't crack this one (score ${score}). Can you beat them?`;
}

/** The line once the visitor has played the same day: who won the challenge. */
export function challengeVerdict(
  them: Challenge,
  you: { bids: number; score: number }
): string {
  const diff = you.score - them.score;
  if (diff > 0) return `You beat your friend by ${diff} points (${you.score} to ${them.score}).`;
  if (diff < 0) return `Your friend wins this one, ${them.score} to ${you.score}.`;
  return `Dead heat: ${you.score} each.`;
}

export function gameShareUrl(path: string, channel: ShareChannel, score?: string): string {
  return `${SITE_URL}${path}?${shareQuery(channel, decodeGameScore(score) ?? undefined)}`;
}

export function decodeGameScore(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const m = /^(\d{1,4}|X)\/(\d{1,4})$/.exec(raw);
  if (!m) return null;
  if (m[1] !== "X" && Number(m[1]) > Number(m[2])) return null;
  return raw;
}
