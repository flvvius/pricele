// Custom analytics events (docs/growth.md, "Measurement").
//
// Vercel Analytics `track()`: cookieless, no personal data. Every call goes
// through `trackEvent`, which never throws: a blocked script or a missing
// window must never cost a player their round. Event properties are flat
// strings/numbers/booleans only, and never a guess or a price.

import { track } from "@vercel/analytics";
import { campaignForPath, channelFromCode, SHARE_PARAM } from "./sharelink";

export type EventName =
  | "puzzle_complete"
  | "share"
  | "share_landing"
  | "thenandnow_complete"
  | "thenandnow_share"
  | "rentratio_complete"
  | "rentratio_share"
  | "ladder_complete"
  | "ladder_share"
  | "atlas_complete"
  | "atlas_share"
  | "chain_complete"
  | "chain_share"
  | "year_complete"
  | "year_share"
  | "range_complete"
  | "range_share"
  | "years_share"
  | "p1000_complete"
  | "p1000_share"
  | "years_pick"
  | "embed_copy"
  | "today_share"
  | "reminder_add";

type Props = Record<string, string | number | boolean>;

export function trackEvent(name: EventName, props?: Props): void {
  try {
    if (typeof window === "undefined") return;
    track(name, props);
  } catch {
    /* analytics is best-effort */
  }
}

/** Query params that mark an arrival from a share. Stripped after landing. */
export const LANDING_TAGS = [
  SHARE_PARAM,
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

export interface Landing {
  source: string;
  medium: string;
  campaign: string;
  challenge: boolean;
}

/**
 * What a URL's query says about how the visitor arrived, or null when it is
 * not a share landing. Counts our own shares (?s=, or utm_source=share on
 * links shared before ?s= replaced it), the sister game (utm_source=dickle)
 * and any challenge link (?c=). A ?s= link carries no campaign; it comes from
 * the path, so the reports keep the same `game-<slug>` split as before.
 */
export function detectLanding(search: string, pathname = "/"): Landing | null {
  const q = new URLSearchParams(search);
  const challenge = q.has("c");
  const channel = channelFromCode(q.get(SHARE_PARAM));
  if (channel) {
    return { source: "share", medium: channel, campaign: campaignForPath(pathname), challenge };
  }
  const source = q.get("utm_source") ?? "";
  if (source !== "share" && source !== "dickle" && !challenge) return null;
  return {
    source: source || "challenge",
    medium: q.get("utm_medium") ?? "",
    campaign: q.get("utm_campaign") ?? "",
    challenge,
  };
}

/**
 * The address-bar URL with the share and utm tags removed. `c` stays: the challenge
 * banner reads it, and a reload should keep showing the score to beat.
 */
export function stripLandingTags(href: string): string {
  const url = new URL(href);
  for (const k of LANDING_TAGS) url.searchParams.delete(k);
  // Same as the share link: a score's slash stays a slash, not %2F.
  const qs = url.searchParams.toString().replace(/%2F/g, "/");
  return `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`;
}
