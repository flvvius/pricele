// Custom analytics events (docs/growth.md, "Measurement").
//
// Vercel Analytics `track()`: cookieless, no personal data. Every call goes
// through `trackEvent`, which never throws: a blocked script or a missing
// window must never cost a player their round. Event properties are flat
// strings/numbers/booleans only, and never a guess or a price.

import { track } from "@vercel/analytics";

export type EventName =
  | "puzzle_complete"
  | "share"
  | "share_landing"
  | "thenandnow_complete"
  | "thenandnow_share"
  | "rentratio_complete"
  | "rentratio_share"
  | "today_share";

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
 * not a share landing. Counts our own shares (utm_source=share), the sister
 * game (utm_source=dickle) and any challenge link (?c=).
 */
export function detectLanding(search: string): Landing | null {
  const q = new URLSearchParams(search);
  const source = q.get("utm_source") ?? "";
  const challenge = q.has("c");
  if (source !== "share" && source !== "dickle" && !challenge) return null;
  return {
    source: source || "challenge",
    medium: q.get("utm_medium") ?? "",
    campaign: q.get("utm_campaign") ?? "",
    challenge,
  };
}

/**
 * The address-bar URL with the utm tags removed. `c` stays: the challenge
 * banner reads it, and a reload should keep showing the score to beat.
 */
export function stripLandingTags(href: string): string {
  const url = new URL(href);
  for (const k of LANDING_TAGS) url.searchParams.delete(k);
  const qs = url.searchParams.toString();
  return `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`;
}
