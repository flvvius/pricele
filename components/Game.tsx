"use client";

import { useEffect, useState } from "react";
import { getDailyPuzzle, isoDate, dateFromISO } from "@/lib/puzzle";
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
import { useKeyboardViewport } from "./useKeyboardViewport";
import GuessInput from "./GuessInput";
import GuessHistory from "./GuessHistory";
import Reveal from "./Reveal";
import HowToPlay from "./HowToPlay";
import StatsPanel from "./StatsPanel";
import ArchiveModal from "./ArchiveModal";
import ThemeToggle from "./ThemeToggle";
import IconButton from "./IconButton";
import { IconArchive, IconHelp, IconStats } from "./Icons";

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

/** The dateline under the masthead, in the reader's own locale. */
function dateline(iso: string): string {
  if (!iso) return "";
  return dateFromISO(iso)
    .toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();
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

  useKeyboardViewport();

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
    // One self-contained screen: the masthead and lot bar are fixed height, the
    // board flexes to fill whatever is left, and the input sits at the bottom.
    // With interactive-widget=resizes-content, the keyboard shrinks the viewport
    // and this whole column reflows, so typing and results stay on one screen.
    //
    // The board keeps a column measure on a desk rather than stretching to the
    // page: five ledger rows spread across a full-width screen stop reading as
    // a stack. It widens by a third and then centres itself.
    <div
      className="flex flex-col gap-3 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:mx-auto lg:w-full lg:max-w-xl"
      style={{ height: "var(--vvh, 100dvh)" }}
    >
      <header className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <IconButton label="How to play" onClick={() => setShowHowTo(true)}>
              <IconHelp size={17} />
            </IconButton>
            <ThemeToggle />
          </div>

          <h1 className="display text-masthead text-ink">Pricele</h1>

          <div className="flex items-center">
            <IconButton label="Archive" onClick={() => setShowArchive(true)}>
              <IconArchive size={17} />
            </IconButton>
            <IconButton label="Statistics" onClick={() => setShowStats(true)}>
              <IconStats size={17} />
            </IconButton>
          </div>
        </div>

        {/* The double rule under a masthead: one heavy, one hair. It is the
            oldest signal in print that everything below is the paper proper,
            and it does the work five stacked bordered cards were doing. */}
        <div className="mt-2 h-[2px] bg-ink" />
        <div className="mt-[3px] h-px bg-ink" />

        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="label">
            {puzzle ? `No. ${puzzle.puzzleNumber}` : " "}
          </span>
          <span className="label">{dateline(activeDate)}</span>
        </div>
      </header>

      {isArchive && puzzle && (
        <div className="flex shrink-0 items-center justify-between border-l-2 border-accent bg-accent/[0.07] py-1.5 pl-2.5 pr-2">
          <span className="label !text-accent">Back number</span>
          <button
            onClick={() => selectDate(today)}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent underline underline-offset-[3px] transition-transform duration-press ease-out active:scale-[0.97]"
          >
            Today&apos;s edition
          </button>
        </div>
      )}

      {/* Both the item and the country change daily, so this band is the only
          place that states what the player is actually pricing today. */}
      <div className="flex shrink-0 items-center gap-3.5 border-y border-rule py-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={puzzle?.item.imageUrl ?? "/items/placeholder.svg"}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 border border-rule bg-paper-raised object-contain p-1.5"
        />
        <div className="min-w-0">
          <p className="label">Today&apos;s lot</p>
          <h2 className="display mt-1 truncate text-[1.5rem] text-ink">
            {puzzle ? (
              <>
                {puzzle.item.name}{" "}
                <span className="text-ink-muted">in</span>{" "}
                {puzzle.price.countryName}{" "}
                <span aria-hidden className="text-[1.1rem]">
                  {puzzle.price.flag}
                </span>
              </>
            ) : (
              <span className="text-ink-faint">Setting today&apos;s lot</span>
            )}
          </h2>
        </div>
      </div>

      {mounted && puzzle ? (
        state.done ? (
          // Finished: the reveal is longer than a screen, so it scrolls inside
          // the game area instead of pushing the page.
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Reveal
              puzzleNumber={puzzle.puzzleNumber}
              item={puzzle.item}
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
              <p className="animate-set-in shrink-0 border-l-2 border-streak bg-streak/[0.08] py-1.5 pl-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-streak">
                {stats.currentStreak}-day streak on the line
              </p>
            )}

            <GuessHistory guesses={state.guesses} />

            <div className="shrink-0">
              {state.guesses.length === 0 && (
                <p className="mb-2.5 text-center text-[11px] leading-relaxed text-ink-meta">
                  For scale, the median{" "}
                  {puzzle.item.shortName.toLowerCase()} across all countries is{" "}
                  <span className="font-mono tabular-nums text-ink-body">
                    {formatMoney(anchorPriceUSD(puzzle.item.id), "USD")}
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
          <p className="label">Setting today&apos;s page</p>
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
