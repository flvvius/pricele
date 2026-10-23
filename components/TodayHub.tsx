"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ShareButton from "./ShareButton";
import ReminderLink from "./ReminderLink";
import Countdown from "./Countdown";
import HubWeek from "./HubWeek";
import { isoDate } from "@/lib/puzzle";
import {
  GAMES,
  dailySetShare,
  minutesLeft,
  readResults,
  readStatuses,
  type ResultLog,
  syncHubStreaks,
  type GameStatus,
} from "@/lib/games";

const LABEL: Record<GameStatus["phase"], string> = {
  not_started: "Not played",
  in_progress: "In progress",
  done: "Done",
};

export default function TodayHub() {
  const [st, setSt] = useState<Record<string, GameStatus> | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [log, setLog] = useState<ResultLog>({});

  useEffect(() => {
    const streaks = syncHubStreaks();
    setStreak(streaks.current);
    setBest(streaks.best);
    setLog(readResults());
    setSt(readStatuses());
  }, []);

  if (!st) return <p className="min-h-[100svh] text-ink-muted">Loading today&apos;s set…</p>;

  const doneCount = GAMES.filter((g) => st[g.slug]?.phase === "done").length;
  const next =
    GAMES.find((g) => st[g.slug]?.phase === "in_progress") ??
    GAMES.find((g) => st[g.slug]?.phase !== "done");
  const left = minutesLeft(st);

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
        <p data-testid="today-progress" className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted">
          {doneCount}/{GAMES.length} done today
        </p>
        <p data-testid="hub-streak" className="font-mono text-[12px] uppercase tracking-[0.14em] text-streak">
          {streak > 0 ? `🔥 ${streak}-day streak` : "No streak yet"}
          {best > streak ? ` · best ${best}` : ""}
        </p>
      </div>
      <div
        className="flex h-1.5 gap-1"
        role="progressbar"
        aria-label="Games finished today"
        aria-valuemin={0}
        aria-valuemax={GAMES.length}
        aria-valuenow={doneCount}
      >
        {GAMES.map((g) => (
          <span
            key={g.slug}
            className={`flex-1 ${st[g.slug]?.phase === "done" ? "bg-accent" : "bg-rule"}`}
          />
        ))}
      </div>
      {next ? (
        <Link
          href={next.href}
          data-testid="today-next"
          className="flex items-center justify-between gap-3 bg-ink px-5 py-4 text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
        >
          <span className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-70">
              {st[next.slug]?.phase === "in_progress" ? "Pick up where you left off" : "Play next"}
            </span>
            <span className="display text-[1.5rem] leading-tight">{next.name}</span>
          </span>
          <span className="shrink-0 font-mono text-[12px] uppercase tracking-[0.14em]">
            ~{left} min left →
          </span>
        </Link>
      ) : (
        <div className="flex flex-col items-center gap-1 border border-rule bg-paper-raised px-5 py-4 text-center">
          <span className="display text-[1.5rem] text-ink">Set complete</span>
          <span className="text-[14px] text-ink-muted">New puzzles in</span>
          <Countdown />
        </div>
      )}
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
      <HubWeek log={log} today={isoDate()} />
      <ShareButton
        text={(url) => dailySetShare(st, streak, url)}
        path="/today"
        campaign="today"
        event="today_share"
        label="Share today's set"
        props={{ done: doneCount, streak }}
      />
      <p className="text-[13px] text-ink-muted">
        Your streak counts every local day you finish at least one game. New puzzles at your local midnight.
        Missed a day? Replay it from the{" "}
        <Link href="/games/archive" className="underline underline-offset-2">
          games archive
        </Link>
        . Easy to forget?{" "}
        <ReminderLink />
        .
      </p>
    </div>
  );
}
