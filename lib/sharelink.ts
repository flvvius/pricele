// The links that leave the site inside a share, and the challenge they carry.
//
// Two jobs, both measured in group chats. First, a shared link has to say it
// was shared: the utm set marks it so Vercel Analytics can tell share traffic
// from everything else (docs/growth.md, week 1). Second, a link to a *day*
// rather than to the home page lets the unfurl show that day's item and
// country (app/d/[n]/opengraph-image.tsx) and lets the landing page put the
// sharer's result up as a score to beat.
//
// WHAT A LINK MUST NEVER CARRY: a guess, or the price. Same rule as the
// Receipt. The challenge is bids used and the round score, neither of which can
// be worked back into a price.
//
// Canonical URLs are untouched by any of this. The tags ride only on links
// handed to other people; every page still declares its own clean canonical,
// and /d/[n] declares the home page's.

import { SITE_URL } from "./seo";

export type ShareChannel = "native" | "copy";
export type ShareCampaign = "daily" | "weekly" | "today" | `game-${string}`;

/** The utm set for a shared link, in a fixed order so links are stable. */
export function utmParams(
  channel: ShareChannel,
  campaign: ShareCampaign = "daily"
): URLSearchParams {
  return new URLSearchParams({
    utm_source: "share",
    utm_medium: channel,
    utm_campaign: campaign,
  });
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
  const params = utmParams(channel, "daily");
  if (challenge) {
    params.set("c", encodeChallenge({ puzzleNumber, ...challenge }));
  }
  return `${SITE_URL}/d/${puzzleNumber}?${params.toString()}`;
}

/** The Weekly Wrapped link. The week itself stays in the fragment. */
export function weekShareUrl(fragment: string, channel: ShareChannel = "copy"): string {
  return `${SITE_URL}/week?${utmParams(channel, "weekly").toString()}#${fragment}`;
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

export function gameShareUrl(path: string, channel: ShareChannel, campaign: ShareCampaign): string {
  return `${SITE_URL}${path}?${utmParams(channel, campaign).toString()}`;
}
