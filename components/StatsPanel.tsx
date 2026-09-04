"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import Countdown from "./Countdown";
import {
  calibrationProfile,
  earnedMilestones,
  nextMilestone,
  GRACE_NAME,
  MAX_GRACE_DAYS,
  STREAK_MILESTONES,
  type Stats,
} from "@/lib/storage";
import { loadHistory, passport, type Stamp } from "@/lib/history";
import { CATEGORY_LABEL, getItem, itemLabel } from "@/data/items";

/** An item id as a reader-facing label, falling back to the raw id. */
function label(id: string): string {
  const item = getItem(id);
  return item ? itemLabel(item) : id;
}
import { PRICES } from "@/lib/puzzle";
import type { Currency } from "@/lib/currency";

interface Props {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  /** If the player won today, the guess count of that win, to highlight its bar. */
  highlightGuess?: number;
  currency: Currency;
}

/** How many countries and items the book has pages for. Read from the table,
    never written down: the catalogue has grown once already and a literal here
    would have started lying on the day it did. */
const TOTAL_COUNTRIES = new Set(PRICES.map((p) => p.countryCode)).size;

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-1">
      <span className="display text-4xl tabular-nums text-ink">{value}</span>
      <span className="text-center font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-ink-meta">
        {label}
      </span>
    </div>
  );
}

/**
 * The passport: one page per country, one visa stamp per item bought there.
 *
 * The retention object a streak cannot be. The table is 49 countries by 16
 * items and a pair only recurs every 784 days, so the collection has a real long
 * tail: a player two years in still has stamps they have never seen. A streak is
 * one number that stops being interesting the moment it is large.
 */
function Passport({ stamps }: { stamps: Stamp[] }) {
  const solved = stamps.reduce((n, s) => n + s.solved.length, 0);
  const visited = stamps.reduce((n, s) => n + s.items.length, 0);

  return (
    <div>
      <h3 className="label rule-label mb-3">Passport</h3>
      <p className="mb-3 text-[13px] leading-relaxed text-ink-muted">
        {stamps.length} of {TOTAL_COUNTRIES} countries visited, {visited} prices
        bought, {solved} of them solved.
      </p>
      <ul className="flex flex-col">
        {stamps.map((s) => (
          <li
            key={s.countryCode}
            className="flex items-center gap-2.5 border-b border-rule-soft py-2 last:border-b-0"
          >
            <span aria-hidden className="shrink-0">
              {s.flag}
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] text-ink-body">
              {s.countryName}
            </span>
            <span className="flex shrink-0 gap-1">
              {s.items.map((id) => {
                const won = s.solved.includes(id);
                return (
                  <span
                    key={id}
                    title={`${label(id)}${won ? " · solved" : ""}`}
                    className="h-2.5 w-2.5 border"
                    style={{
                      borderColor: won
                        ? "rgb(var(--streak))"
                        : "rgb(var(--rule))",
                      backgroundColor: won
                        ? "rgb(var(--streak))"
                        : "transparent",
                    }}
                  />
                );
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StatsPanel({
  open,
  onClose,
  stats,
  highlightGuess,
}: Props) {
  const [stamps, setStamps] = useState<Stamp[]>([]);

  // Read on open rather than on mount: the history changes when a round ends,
  // and this panel is usually opened straight afterwards.
  useEffect(() => {
    if (open) setStamps(passport(loadHistory()));
  }, [open]);

  const winPct = stats.played
    ? Math.round((stats.wins / stats.played) * 100)
    : 0;
  const maxCount = Math.max(1, ...stats.distribution);
  const profile = calibrationProfile(stats);
  const earned = earnedMilestones(stats.maxStreak);
  const upcoming = nextMilestone(stats.currentStreak);
  const botPct = stats.botRounds
    ? Math.round((stats.botWins / stats.botRounds) * 100)
    : null;

  return (
    <Modal open={open} onClose={onClose} title="Statistics">
      <div className="flex flex-col gap-7">
        {/* Hairline gutters instead of gaps: four figures in a row are a table,
            and a table has rules between its columns. */}
        <div className="grid grid-cols-4 divide-x divide-rule border-y border-rule py-4">
          <Stat value={stats.played} label="Played" />
          <Stat value={`${winPct}%`} label="Win rate" />
          <Stat value={stats.currentStreak} label="Streak" />
          <Stat value={stats.maxStreak} label="Best" />
        </div>

        <div className="grid grid-cols-2 divide-x divide-rule border-b border-rule pb-4">
          <Stat value={stats.points.toLocaleString("en-US")} label="Points" />
          <Stat value={stats.bestScore} label="Best round" />
        </div>

        {/* The stat for the player who already wins most days. A win rate stops
            separating regulars from each other once they are all winning; what
            you are specifically bad at never does, and it is a great deal more
            interesting to argue with. */}
        {profile.length > 0 && (
          <div>
            <h3 className="label rule-label mb-3">Calibration</h3>
            <ul className="flex flex-col">
              {profile.map((r) => (
                <li
                  key={r.category}
                  className="flex items-baseline justify-between gap-3 border-b border-rule-soft py-2 last:border-b-0"
                >
                  <span className="text-[14px] text-ink-body">
                    {CATEGORY_LABEL[r.category]}
                  </span>
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-ink-muted">
                    {r.biasPct > 0 ? "+" : ""}
                    {r.biasPct}%{" "}
                    <span className="text-ink-faint">
                      · {r.rounds} {r.rounds === 1 ? "round" : "rounds"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              Your average opening bid against the real price. A plus means you
              read that kind of price as dearer than it is. It is the only number
              here that improves on a day you lose.
            </p>
          </div>
        )}

        <div>
          <h3 className="label rule-label mb-3">Guess distribution</h3>
          {stats.wins === 0 ? (
            <p className="text-[14px] text-ink-meta">
              Win a round to start your distribution.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.distribution.map((count, i) => {
                const isHighlight = highlightGuess === i + 1;
                const pct = count === 0 ? 0 : (count / maxCount) * 100;
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-3 font-mono text-[12px] tabular-nums text-ink-meta">
                      {i + 1}
                    </span>
                    {/* The track is always full width so the bars share a
                        baseline and can actually be compared to each other. */}
                    <div className="h-5 flex-1 bg-paper-sunk">
                      <div
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isHighlight
                            ? "rgb(var(--win))"
                            : "rgb(var(--ink-faint))",
                        }}
                      />
                    </div>
                    <span
                      className="w-5 text-right font-mono text-[12px] tabular-nums"
                      style={{
                        color: isHighlight
                          ? "rgb(var(--win))"
                          : "rgb(var(--ink-muted))",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="label rule-label mb-3">Standing</h3>
          <ul className="flex flex-col">
            {STREAK_MILESTONES.map((m) => {
              const has = earned.some((e) => e.days === m.days);
              return (
                <li
                  key={m.days}
                  className="flex items-baseline justify-between gap-3 border-b border-rule-soft py-2 last:border-b-0"
                >
                  <span
                    className={`text-[14px] ${has ? "text-ink" : "text-ink-faint"}`}
                  >
                    {m.name}
                  </span>
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
                      has ? "text-streak" : "text-ink-faint"
                    }`}
                  >
                    {has ? "Held" : `${m.days} days`}
                  </span>
                </li>
              );
            })}
          </ul>
          {upcoming && (
            <p className="mt-3 text-[13px] text-ink-muted">
              {upcoming.days - stats.currentStreak} more for {upcoming.name}.
            </p>
          )}
        </div>

        {/* Shown whether or not any are banked, because the mechanic only
            protects a player who knows it exists before they miss a day. */}
        <div className="border-l-2 border-streak pl-3.5">
          <h3 className="label mb-1.5">
            {GRACE_NAME}
            {stats.graceDays === 1 ? "" : "s"}
          </h3>
          <p className="display text-2xl tabular-nums text-streak">
            {stats.graceDays} of {MAX_GRACE_DAYS}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            Miss a single day and one of these covers it automatically, no action
            needed. You earn one every 10 days of streak and can hold two.
          </p>
        </div>

        {botPct !== null && (
          <div>
            <h3 className="label rule-label mb-3">Against the bot</h3>
            <p className="text-[14px] leading-relaxed text-ink-body">
              You have beaten the baseline model in {botPct}% of your rounds,{" "}
              {stats.botWins} from {stats.botRounds}.
            </p>
          </div>
        )}

        {stamps.length > 0 && <Passport stamps={stamps} />}

        <div className="flex items-center justify-between border-t border-rule pt-4">
          <span className="label">Next edition</span>
          <Countdown />
        </div>
      </div>
    </Modal>
  );
}
