"use client";

import { useEffect } from "react";
import { detectLanding, stripLandingTags, trackEvent } from "@/lib/analytics";

const SEEN_KEY = "pricele:landing";

/**
 * Fires `share_landing` once per arrival from a shared link, then tidies the
 * share and utm tags out of the address bar so a re-share or bookmark doesn't carry
 * them. /d/[n] is skipped: it forwards to / with the query intact, and the
 * landing is counted there. `c` is left in place for the challenge banner.
 * Mounted in the root layout.
 */
export default function LandingTracker() {
  useEffect(() => {
    try {
      if (window.location.pathname.startsWith("/d/")) return;
      const landing = detectLanding(window.location.search, window.location.pathname);
      if (!landing) return;
      // A reload keeps ?c; don't count the same landing twice in a session.
      const key = window.location.search;
      let seen = false;
      try {
        seen = window.sessionStorage.getItem(SEEN_KEY) === key;
        window.sessionStorage.setItem(SEEN_KEY, key);
      } catch {
        /* storage blocked: count it */
      }
      if (!seen) {
        trackEvent("share_landing", { ...landing, path: window.location.pathname });
      }
      const clean = stripLandingTags(window.location.href);
      const now = window.location.pathname + window.location.search + window.location.hash;
      if (clean !== now) window.history.replaceState(window.history.state, "", clean);
    } catch {
      /* never break the page */
    }
  }, []);
  return null;
}
