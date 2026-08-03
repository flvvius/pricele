"use client";

import { useEffect, useState } from "react";
import { THEME_KEY, applyThemeColor } from "./ThemeScript";
import IconButton from "./IconButton";
import { IconMoon, IconSun } from "./Icons";

type Edition = "paper" | "night";

/**
 * Switches between the two editions.
 *
 * Rendered as a placeholder until mounted: the server has no idea which edition
 * the reader is in, so committing to an icon during SSR would guarantee a wrong
 * one on half of all loads. The button keeps its footprint either way, so the
 * masthead never reflows when it resolves.
 *
 * There is no transition on the swap. This is a control someone will hit once
 * and then leave alone for months, but the colour change it causes covers the
 * entire viewport — cross-fading a whole page reads as a slow repaint, not as
 * polish.
 */
export default function ThemeToggle() {
  const [edition, setEdition] = useState<Edition | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "paper" || stored === "night") {
      setEdition(stored);
      return;
    }
    setEdition(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "night"
        : "paper"
    );
  }, []);

  function toggle() {
    const next: Edition = edition === "night" ? "paper" : "night";
    setEdition(next);
    document.documentElement.setAttribute("data-theme", next);
    // The status bar has to follow the page. Without this it kept answering the
    // OS preference, so switching to Night on a light phone left a strip of
    // newsprint above a black page.
    applyThemeColor(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode — the choice just won't survive a reload */
    }
  }

  if (!edition) return <span className="block h-9 w-9" aria-hidden />;

  return (
    <IconButton
      onClick={toggle}
      label={
        edition === "night" ? "Switch to paper edition" : "Switch to night edition"
      }
    >
      {edition === "night" ? <IconSun size={17} /> : <IconMoon size={17} />}
    </IconButton>
  );
}
