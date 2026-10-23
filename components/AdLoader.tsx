"use client";

import { useEffect } from "react";
import { ADSENSE_LOADER_SRC } from "@/lib/ads";

const EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

export default function AdLoader() {
  useEffect(() => {
    let loaded = false;
    function load() {
      if (loaded) return;
      loaded = true;
      EVENTS.forEach((e) => window.removeEventListener(e, load));
      const s = document.createElement("script");
      s.async = true;
      s.src = ADSENSE_LOADER_SRC;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }
    EVENTS.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    return () => EVENTS.forEach((e) => window.removeEventListener(e, load));
  }, []);
  return null;
}
