"use client";

import { useEffect } from "react";
import { keyboardIsOpen, viewportIsCramped } from "@/lib/viewport";

/**
 * Keeps the game sized to the *visible* viewport while the on-screen keyboard
 * is up.
 *
 * Android/Chromium honours viewport interactive-widget=resizes-content: the
 * layout viewport (and so 100dvh) shrinks on its own and everything already
 * fits. iOS Safari, and iOS Chrome, which is also WebKit, ignores that hint.
 * There the layout viewport keeps its full height and the browser scrolls the
 * page instead to reveal the focused field, which pushes the item card and the
 * earlier guesses off the top of the screen.
 *
 * So we mirror visualViewport.height into a --vvh custom property (the game
 * container sizes off it) and, while the keyboard is up, hold the document at
 * the top, which cancels that scroll.
 *
 * Sizing the column correctly is only half of it: on a short enough viewport the
 * column is correct and still has no room left for the board, because the board
 * is the one thing in it that flexes. So we also mark the document `cramped`
 * whenever the visible height drops under what the full furniture needs, and the
 * stylesheet spends that height on the guesses instead of on the masthead. See
 * lib/viewport.ts for where the threshold comes from — the short version is that
 * iOS's AutoFill bar comes out of the visual viewport on top of the keyboard,
 * which is what took the board to a hairline.
 *
 * Detection deliberately keys off visualViewport rather than focus events: the
 * guess input is autofocused on load, and iOS does not open the keyboard for an
 * autofocus, so the user's tap lands on an already-focused field and fires no
 * focusin at all. The viewport resize always fires.
 *
 * Browsers without visualViewport keep the plain 100dvh fallback.
 */
export function useKeyboardViewport() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const root = document.documentElement;

    const apply = () => {
      root.style.setProperty("--vvh", `${Math.round(vv.height)}px`);
      root.classList.toggle("cramped", viewportIsCramped(vv.height));
      if (
        keyboardIsOpen(window.innerHeight, vv.height) &&
        (window.scrollY !== 0 || vv.offsetTop !== 0)
      ) {
        window.scrollTo(0, 0);
      }
    };

    // A tap can open the keyboard without any resize having happened yet, so
    // re-check across the keyboard animation too.
    const onPointerUp = () => {
      [0, 150, 350, 600].forEach((d) => setTimeout(apply, d));
    };

    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    document.addEventListener("pointerup", onPointerUp);

    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
      document.removeEventListener("pointerup", onPointerUp);
      root.style.removeProperty("--vvh");
      root.classList.remove("cramped");
    };
  }, []);
}
