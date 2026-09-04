"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRICES } from "@/lib/puzzle";
import { getItem, itemLabel } from "@/data/items";
import { decodeWeek, roastWeek, type SharedWeek } from "@/lib/weekshare";

/** Country name and flag for a code. Public data; nothing withheld is used. */
function countryOf(code: string): { name: string; flag: string } {
  const row = PRICES.find((p) => p.countryCode === code);
  return row
    ? { name: row.countryName, flag: row.flag }
    : { name: code, flag: "" };
}

/**
 * Reads the week out of `location.hash`, which is why this is a client component
 * and why the page around it is static. The fragment never leaves the browser,
 * so the server has nothing to render and nothing to log.
 */
export default function SharedWeekView() {
  const [week, setWeek] = useState<SharedWeek | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, "");
    setWeek(raw ? decodeWeek(raw) : null);
    setReady(true);
  }, []);

  if (!ready) return <p className="label">Reading the card</p>;

  if (!week || week.d.length === 0) {
    return (
      <div className="flex max-w-prose flex-col gap-4">
        <p className="text-[16px] leading-relaxed text-ink-body">
          There is no week in this link. Either it was truncated on the way here,
          which happens when a chat app decides the part after the # is not worth
          keeping, or you have arrived at this page on your own.
        </p>
        <Link
          href="/"
          className="self-start border border-rule px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-body transition-[border-color,background-color] duration-fast ease-out hover:border-ink hover:bg-paper-raised"
        >
          Play today&apos;s puzzle
        </Link>
      </div>
    );
  }

  const roast = roastWeek(week);

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col border-t border-rule">
        {week.d.map((day, i) => {
          const { name, flag } = countryOf(day.c);
          const item = getItem(day.i);
          return (
            <li
              key={`${day.i}-${day.c}-${i}`}
              className="flex items-center gap-3 border-b border-rule-soft py-3"
            >
              <span className="font-mono text-[11px] tabular-nums text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate text-[15px] text-ink-body">
                {item ? itemLabel(item) : day.i} in {flag} {name}
              </span>
              <span className="font-mono text-[13px] tabular-nums text-ink-muted">
                {day.b}% off
              </span>
              <span
                className="w-16 shrink-0 text-right font-mono text-[11px] uppercase tracking-[0.12em]"
                style={{
                  color: day.w ? "rgb(var(--win))" : "rgb(var(--ink-faint))",
                }}
              >
                {day.w ? "Solved" : "Lost"}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="border border-rule border-t-2 border-t-ink bg-paper-raised p-5">
        <p className="label">The verdict on their week</p>
        <ul className="mt-3 flex flex-col gap-2 text-[16px] leading-relaxed text-ink-body">
          {roast.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <Link
        href="/"
        className="self-start bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
      >
        Beat their week
      </Link>
    </div>
  );
}
