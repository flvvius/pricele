"use client";

import { useEffect, useState } from "react";
import { msUntilNextUTCDay, formatCountdown } from "@/lib/time";

/** Live ticking countdown to the next daily puzzle. */
export default function Countdown() {
  const [ms, setMs] = useState(() => msUntilNextUTCDay());

  useEffect(() => {
    const id = setInterval(() => setMs(msUntilNextUTCDay()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums font-semibold text-white">
      {formatCountdown(ms)}
    </span>
  );
}
