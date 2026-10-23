"use client";

import { useEffect } from "react";

/**
 * Hands a shared-day visitor on to the game, query string and all.
 *
 * /d/[n] exists for the unfurl, not for reading: the game itself lives at /,
 * so the page forwards there at once, keeping the share tag (for analytics) and
 * the challenge (for the banner). `replace`, so Back leaves the site rather
 * than bouncing off this page again.
 */
export default function DayRedirect() {
  useEffect(() => {
    window.location.replace(`/${window.location.search}`);
  }, []);
  return null;
}
