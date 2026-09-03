"use client";

import { useEffect, useState } from "react";
import { loadHistory, summariseWeek, weekOf, type PlayRecord } from "@/lib/history";
import { encodeWeek, roastWeek, toSharedWeek } from "@/lib/weekshare";
import { copyToClipboard, SHARE_URL } from "@/lib/share";

/**
 * The Sunday card: the same seven days the player already has, cut so there is
 * something to react to.
 *
 * Nothing new is stored to produce this. Wrapped works because a year of
 * listening history was already sitting there and somebody thought to arrange
 * it, and a week of bids is the same trick at a hundredth of the scale.
 *
 * The link it copies puts the week in a URL fragment, so the data never reaches
 * a server and the recipient learns none of the prices. See lib/weekshare.ts.
 */
export default function WeekCard({ today }: { today: string }) {
  const [records, setRecords] = useState<PlayRecord[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRecords(weekOf(loadHistory(), today));
  }, [today]);

  // One day is not a week. Below three there is no shape to show and the card
  // would be four lines of "you played once".
  if (records.length < 3) return null;

  const summary = summariseWeek(records);
  const roast = roastWeek(toSharedWeek(records));

  async function onCopy() {
    const link = `${SHARE_URL}/week#${encodeWeek(records)}`;
    const ok = await copyToClipboard(
      ["My Pricele week:", ...roast, link].join("\n")
    );
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="border border-rule border-t-2 border-t-ink bg-paper-raised p-4">
      <p className="label">Your week</p>

      <div className="mt-3 grid grid-cols-3 divide-x divide-rule border-y border-rule py-3 text-center">
        <div className="flex flex-col gap-1">
          <span className="display text-2xl tabular-nums text-ink">
            {summary.wins}/{summary.played}
          </span>
          <span className="label !text-[10px]">Solved</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="display text-2xl tabular-nums text-ink">
            {summary.points.toLocaleString("en-US")}
          </span>
          <span className="label !text-[10px]">Points</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="display text-2xl tabular-nums text-ink">
            {summary.openingErrorPct === null
              ? "—"
              : `${summary.openingErrorPct}%`}
          </span>
          <span className="label !text-[10px]">Opening error</span>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-1.5 text-[14px] leading-relaxed text-ink-body">
        {roast.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <button
        onClick={onCopy}
        className="mt-4 w-full border border-rule px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-body transition-[border-color,background-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-raised active:scale-[0.97]"
      >
        {copied ? "Link copied" : "Copy roast link"}
      </button>
    </section>
  );
}
