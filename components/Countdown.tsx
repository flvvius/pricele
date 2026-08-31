"use client";

import { useEffect, useState } from "react";
import { msUntilNextDay, formatCountdown } from "@/lib/time";

/** Live ticking countdown to the next daily puzzle (local midnight). */
export default function Countdown() {
  const [ms, setMs] = useState(() => msUntilNextDay());

  useEffect(() => {
    const id = setInterval(() => setMs(msUntilNextDay()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-lg tabular-nums text-ink">
      {formatCountdown(ms)}
    </span>
  );
}
