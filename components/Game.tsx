"use client";

import { useEffect, useState } from "react";
import { getDailyPuzzle, isoDate, dateFromISO } from "@/lib/puzzle";
import { ACTIVE_ITEM } from "@/data/item";
import { evaluate } from "@/lib/scoring";
import {
  loadDayState,
  saveDayState,
  loadStats,
  recordCompletion,
  streakAtRisk,
  EMPTY_STATS,
  type DayState,
  type Stats,
} from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";
import { anchorPriceUSD, formatMoney } from "@/lib/format";
import { initPwa } from "@/lib/pwa";
import GuessInput from "./GuessInput";
import GuessHistory from "./GuessHistory";
import Reveal from "./Reveal";
import HowToPlay from "./HowToPlay";
import StatsPanel from "./StatsPanel";
import ArchiveModal from "./ArchiveModal";

const INTRO_KEY = "pricele:seen-intro";

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
    >
      {children}
    </button>
  );
}

export default function Game() {
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState("");
  const [activeDate, setActiveDate] = useState("");
  const [state, setState] = useState<DayState>({
    date: "",
    guesses: [],
    done: false,
    won: false,
  });
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    const day = isoDate(new Date());
    setToday(day);
    setActiveDate(day);
    setState(loadDayState(day));
    setStats(loadStats());
    setMounted(true);
    initPwa();

    const dayState = loadDayState(day);
    if (!window.localStorage.getItem(INTRO_KEY) && dayState.guesses.length === 0) {
      setShowHowTo(true);
      window.localStorage.setItem(INTRO_KEY, "1");
    }
  }, []);

  const isArchive = mounted && activeDate !== today;
  const puzzle = mounted ? getDailyPuzzle(dateFromISO(activeDate)) : null;

  function selectDate(date: string) {
    setActiveDate(date);
    setState(loadDayState(date));
  }

  function handleGuess(value: number) {
    if (!puzzle || state.done) return;
    const result = evaluate(value, puzzle.price.priceUSD);
    const guesses = [
      ...state.guesses,
      {
        value,
        band: result.band,
        direction: result.direction,
        closeness: result.closeness,
      },
    ];
    const won = result.win;
    const done = won || guesses.length >= MAX_GUESSES;

    const next: DayState = { date: activeDate, guesses, done, won };
    setState(next);
    saveDayState(next);
    vibrate(won ? [30, 40, 90] : 20);

    // Archive replays are practice: they save your result but never touch the streak.
    if (done && !isArchive) {
      setStats(recordCompletion(today, won, guesses.length));
    }
  }

  const highlightGuess =
    state.won && !isArchive ? state.guesses.length : undefined;
  const atRisk = mounted && !isArchive && !state.done && streakAtRisk(stats, today);

  return (
    // One self-contained screen: the header and item bar are fixed height, the
    // board flexes to fill whatever is left, and the input sits at the bottom.
    // With interactive-widget=resizes-content, the keyboard shrinks the viewport
    // and this whole column reflows, so typing and results stay on one screen.
    <div className="flex h-[100dvh] flex-col gap-3 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <header className="flex shrink-0 items-center justify-between">
        <IconButton label="How to play" onClick={() => setShowHowTo(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </IconButton>
        <div className="text-center">
          <h1 className="text-xl font-black leading-tight tracking-tight">Pricele</h1>
          <p className="text-[10px] text-neutral-500">New country daily</p>
        </div>
        <div className="flex items-center">
          <IconButton label="Archive" onClick={() => setShowArchive(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 3v5h5" />
              <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
              <path d="M12 7v5l3 2" />
            </svg>
          </IconButton>
          <IconButton label="Statistics" onClick={() => setShowStats(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="6" y1="20" x2="6" y2="12" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="18" y1="20" x2="18" y2="14" />
            </svg>
          </IconButton>
        </div>
      </header>

      {isArchive && puzzle && (
        <div className="flex shrink-0 items-center justify-between rounded-lg border border-amber-800/60 bg-amber-950/30 px-3 py-1.5 text-xs">
          <span className="text-amber-300">
            Archive · Pricele #{puzzle.puzzleNumber}
          </span>
          <button
            onClick={() => selectDate(today)}
            className="font-medium text-amber-200 underline underline-offset-2"
          >
            Back to today
          </button>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ACTIVE_ITEM.imageUrl}
          alt={ACTIVE_ITEM.name}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain p-1"
        />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold leading-tight">
            {ACTIVE_ITEM.name}
          </h2>
          <p className="truncate text-sm text-neutral-300">
            {puzzle ? (
              <>
                in {puzzle.price.countryName}{" "}
                <span aria-hidden>{puzzle.price.flag}</span>
              </>
            ) : (
              <span className="text-neutral-500">Loading today&apos;s country</span>
            )}
          </p>
        </div>
      </div>

      {mounted && puzzle ? (
        state.done ? (
          // Finished: the reveal is longer than a screen, so it scrolls inside
          // the game area instead of pushing the page.
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Reveal
              puzzleNumber={puzzle.puzzleNumber}
              itemName={ACTIVE_ITEM.name}
              price={puzzle.price}
              guesses={state.guesses}
              won={state.won}
              stats={stats}
              onShowStats={() => setShowStats(true)}
              isArchive={isArchive}
            />
          </div>
        ) : (
          <>
            {atRisk && (
              <p className="animate-pop shrink-0 rounded-lg border border-orange-800/60 bg-orange-950/30 px-3 py-1.5 text-center text-xs font-medium text-orange-300">
                🔥 {stats.currentStreak}-day streak on the line
              </p>
            )}
            <GuessHistory guesses={state.guesses} />
            <div className="shrink-0">
              {state.guesses.length === 0 && (
                <p className="mb-2 text-center text-xs text-neutral-500">
                  For scale, the median across all countries is{" "}
                  <span className="font-semibold text-neutral-300">
                    {formatMoney(anchorPriceUSD(), "USD")}
                  </span>
                  .
                </p>
              )}
              <GuessInput
                disabled={state.done}
                remaining={MAX_GUESSES - state.guesses.length}
                onGuess={handleGuess}
              />
            </div>
          </>
        )
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-sm text-neutral-500">Loading…</p>
        </div>
      )}

      <HowToPlay open={showHowTo} onClose={() => setShowHowTo(false)} />
      <StatsPanel
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        highlightGuess={highlightGuess}
      />
      <ArchiveModal
        open={showArchive}
        onClose={() => setShowArchive(false)}
        today={today}
        onPlay={selectDate}
      />
    </div>
  );
}
