"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, adsEnabled } from "@/lib/ads";

interface Props {
  /** Numeric AdSense ad-unit slot id. Empty string → nothing renders. */
  slot: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
  /** AdSense format hint; "auto" gives a responsive display unit. */
  format?: string;
}

// A single, clearly-labeled AdSense unit. Renders nothing unless a publisher
// ID and a slot id are both configured, so the ad-free build has zero markup
// and zero layout shift. Space is reserved via min-height so a slow-loading ad
// doesn't push content around (good for Core Web Vitals and UX alike).
export default function AdSlot({ slot, className, format = "auto" }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsEnabled() || !slot || pushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* AdSense not loaded (e.g. blocked) — fail silently. */
    }
  }, [slot]);

  if (!adsEnabled() || !slot) return null;

  return (
    <aside
      className={`overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 ${className ?? ""}`}
      aria-label="Advertisement"
    >
      <p className="px-3 pt-2 text-[10px] uppercase tracking-wider text-neutral-600">
        Advertisement
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 100 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
