"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GAMES, dailySetShare, readStatuses, syncHub, type GameStatus } from "@/lib/games";
import { SITE_URL } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

const LABEL: Record<GameStatus["phase"], string> = {
  not_started: "Not played",
  in_progress: "In progress",
  done: "Done",
};

export default function TodayHub() {
  const [st, setSt] = useState<Record<string, GameStatus> | null>(null);
  const [streak, setStreak] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStreak(syncHub());
    setSt(readStatuses());
  }, []);

  if (!st) return <p className="text-ink-muted">Loading today&apos;s set…</p>;

  const doneCount = GAMES.filter((g) => st[g.slug]?.phase === "done").length;

  async function share() {
    const text = dailySetShare(st!, streak, `${SITE_URL}/today`);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackEvent("today_share", { channel: "copy", done: doneCount, streak });
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
        <p data-testid="today-progress" className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted">
          {doneCount}/{GAMES.length} done today
        </p>
        <p data-testid="hub-streak" className="font-mono text-[12px] uppercase tracking-[0.14em] text-streak">
          {streak > 0 ? `🔥 ${streak}-day streak` : "No streak yet"}
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {GAMES.map((g) => {
          const s = st[g.slug] ?? { phase: "not_started" as const };
          const cta = s.phase === "done" ? "View" : s.phase === "in_progress" ? "Continue" : "Play";
          return (
            <li
              key={g.slug}
              data-testid={`today-${g.slug}`}
              className="flex items-center justify-between gap-4 border border-rule border-t-2 border-t-ink bg-paper-raised px-4 py-4"
            >
              <div className="min-w-0">
                <p className="display text-[1.4rem] text-ink">{g.name}</p>
                <p className="text-[14px] text-ink-body">{g.blurb}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  {s.phase === "done" ? "✅ " : "⬜ "}
                  {LABEL[s.phase]}
                  {s.result ? ` · ${s.result}` : ""}
                </p>
              </div>
              <Link
                href={g.href}
                className={`shrink-0 px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] ${
                  s.phase === "done" ? "border border-ink text-ink" : "bg-ink text-paper-raised"
                }`}
              >
                {cta}
              </Link>
            </li>
          );
        })}
      </ul>
      <button
        onClick={share}
        className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised"
      >
        {copied ? "Copied" : "Share today's set"}
      </button>
      <p className="text-[13px] text-ink-muted">
        Your streak counts every local day you finish at least one game. New puzzles at your local midnight.
      </p>
    </div>
  );
}
