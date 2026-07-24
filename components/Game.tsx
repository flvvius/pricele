"use client";

import { useEffect, useState } from "react";
import { getDailyPuzzle, isoDate } from "@/lib/puzzle";
import { ACTIVE_ITEM } from "@/data/item";
import { evaluate } from "@/lib/scoring";
import {
  loadDayState,
  saveDayState,
  loadStats,
  recordCompletion,
  EMPTY_STATS,
  type DayState,
  type Stats,
} from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";
import GuessInput from "./GuessInput";
import GuessHistory from "./GuessHistory";
import Reveal from "./Reveal";
import HowToPlay from "./HowToPlay";
import StatsPanel from "./StatsPanel";

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
  const [state, setState] = useState<DayState>({
    date: "",
    guesses: [],
    done: false,
    won: false,
  });
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const day = isoDate(new Date());
    const dayState = loadDayState(day);
    setToday(day);
    setState(dayState);
    setStats(loadStats());
    setMounted(true);

    // First-time players get the rules once.
    if (!window.localStorage.getItem(INTRO_KEY) && dayState.guesses.length === 0) {
      setShowHowTo(true);
      window.localStorage.setItem(INTRO_KEY, "1");
    }
  }, []);

  const puzzle = mounted ? getDailyPuzzle(new Date()) : null;

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

    const next: DayState = { date: today, guesses, done, won };
    setState(next);
    saveDayState(next);
    vibrate(won ? [30, 40, 90] : 20);

    if (done) {
      setStats(recordCompletion(today, won, guesses.length));
    }
  }

  const highlightGuess = state.won ? state.guesses.length : undefined;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <IconButton label="How to play" onClick={() => setShowHowTo(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </IconButton>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">Pricele</h1>
          <p className="text-xs text-neutral-500">Guess the price. New country daily.</p>
        </div>
        <IconButton label="Statistics" onClick={() => setShowStats(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="6" y1="20" x2="6" y2="12" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="18" y1="20" x2="18" y2="14" />
          </svg>
        </IconButton>
      </header>

      <div className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ACTIVE_ITEM.imageUrl}
          alt={ACTIVE_ITEM.name}
          width={56}
          height={56}
          className="h-14 w-14 rounded-lg bg-white object-contain p-1"
        />
        <div>
          <p className="text-xs text-neutral-400">Guess the price of</p>
          <h2 className="text-lg font-bold leading-tight">{ACTIVE_ITEM.name}</h2>
          <p className="text-base">
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
        <>
          {!state.done && (
            <p className="text-center text-xs text-neutral-500">
              Guess in USD. Win by landing within 10% of the real price.
            </p>
          )}
          <GuessHistory guesses={state.guesses} />
          {state.done ? (
            <Reveal
              puzzleNumber={puzzle.puzzleNumber}
              itemName={ACTIVE_ITEM.name}
              price={puzzle.price}
              guesses={state.guesses}
              won={state.won}
              stats={stats}
              onShowStats={() => setShowStats(true)}
            />
          ) : (
            <GuessInput
              disabled={state.done}
              remaining={MAX_GUESSES - state.guesses.length}
              onGuess={handleGuess}
            />
          )}
        </>
      ) : (
        <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>
      )}

      <HowToPlay open={showHowTo} onClose={() => setShowHowTo(false)} />
      <StatsPanel
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        highlightGuess={highlightGuess}
      />
    </div>
  );
}
