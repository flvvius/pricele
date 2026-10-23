"use client";

import { useEffect, type RefObject } from "react";

/**
 * Scrolls just enough to bring `ref`'s box above the on-screen keyboard,
 * whenever `key` changes.
 *
 * The country pickers list their matches *under* the field, and on a phone the
 * field sits near the bottom of the first screen. Tapping it lets the browser
 * scroll the field itself into view and no further, so the matches rendered
 * straight under the keyboard: the player typed "ger", saw nothing happen, and
 * had no way to know a Germany button was waiting below. Measuring against
 * visualViewport is what makes this keyboard-aware: on iOS the layout viewport
 * keeps its full height while the keyboard is up, so innerHeight would say
 * everything already fits.
 *
 * It never scrolls the top of the box past the top of the visible area: if
 * the matches are taller than the space left, the field the player is typing
 * into stays in sight and the rest can be scrolled to by hand.
 */
export function useKeepInView(ref: RefObject<HTMLElement>, key: unknown) {
  useEffect(() => {
    const el = ref.current;
    const vv = window.visualViewport;
    if (!el || !vv) return;
    // After the paint that rendered the new matches, and again once a keyboard
    // that is still animating in has settled.
    const timers = [0, 350].map((ms) =>
      window.setTimeout(() => {
        const box = el.getBoundingClientRect();
        const top = vv.offsetTop + 8;
        const bottom = vv.offsetTop + vv.height - 8;
        const by = Math.min(box.bottom - bottom, box.top - top);
        if (by > 0) window.scrollBy({ top: by, behavior: "smooth" });
      }, ms)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [ref, key]);
}
