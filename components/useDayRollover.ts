"use client";

import { useEffect, useRef } from "react";
import { isoDate } from "@/lib/puzzle";

/**
 * Reloads the page when the player's local date has moved on since the game
 * read it, so a tab left open overnight shows today's puzzle when they come
 * back to it.
 *
 * Every game reads the date once, on mount. Phones keep tabs alive for days,
 * so a player who opened the game last night and switched back to it this
 * morning was shown yesterday's finished board, with "a new one at your local
 * midnight" printed under it and nothing to do but guess that a reload would
 * help. Worse, a fresh round started in that tab was played and saved against
 * yesterday's date.
 *
 * It checks when the tab becomes visible again, and once a minute while it is
 * open (the case of someone watching the clock tick over). It never reloads
 * an archive replay, which is pinned to its date on purpose, or a round the
 * player is in the middle of: callers set the returned ref's `current` to
 * true while moves have been made and the round is not over, and a half-played
 * board is left alone until it is finished.
 */
export function useDayRollover(date: string | null, archived: boolean) {
  const busy = useRef(false);

  useEffect(() => {
    if (!date || archived) return;
    const check = () => {
      if (document.visibilityState !== "visible" || busy.current) return;
      if (isoDate() !== date) window.location.reload();
    };
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    const timer = window.setInterval(check, 60_000);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
      window.clearInterval(timer);
    };
  }, [date, archived]);

  return busy;
}
