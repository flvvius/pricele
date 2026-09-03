"use client";

import { useEffect, useRef, useState } from "react";
import { getDailyPuzzle, isoDate, dateFromISO } from "@/lib/puzzle";
import { evaluate, roundScore } from "@/lib/scoring";
import {
  loadDayState,
  saveDayState,
  loadStats,
  recordCompletion,
  streakAtRisk,
  EMPTY_STATS,
  GRACE_NAME,
  type DayState,
  type Stats,
} from "@/lib/storage";
import { recordPlay } from "@/lib/history";
import { submitRound, fetchCrowd } from "@/lib/crowd";
import type { CrowdStats } from "@/lib/db";
import { loadHome, submittableHome } from "@/lib/home";
import { loadRoomCode, loadRoomName } from "@/lib/room";
import { hintFor } from "@/lib/hints";
import { beatTheBot } from "@/lib/bot";
import { personaFor } from "@/lib/verdict";
import { itemCategory } from "@/data/items";
import { MAX_GUESSES } from "@/lib/share";
import {
  anchorPriceUSD,
  bestPctOff,
  formatPrice,
  headlineSize,
} from "@/lib/format";
import { loadCurrency, saveCurrency, type Currency } from "@/lib/currency";
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
  // Dollars until the client tells us otherwise. The saved choice and the locale
  // sniff both need `window`, so they can only be read after mount, starting on
  // USD keeps the first paint identical to the server's.
  const [currency, setCurrency] = useState<Currency>("USD");
  const [crowd, setCrowd] = useState<CrowdStats | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [showHowTo, setShowHowTo] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  // True only for a round that ended in this session, which is the only time the
  // reveal is staged. See the comment on Reveal's `staged` prop.
  const [justFinished, setJustFinished] = useState(false);
  // One submission per day per mount, whatever React decides to do with effects.
  const submitted = useRef("");

  useKeyboardViewport();

  useEffect(() => {
    const day = isoDate(new Date());
    setToday(day);
    setActiveDate(day);
    setState(loadDayState(day));
    setStats(loadStats());
    setCurrency(loadCurrency());
    setRoomCode(loadRoomCode());
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

  // The round score, recomputed rather than stored on the day state: it is a
  // pure function of the guesses and the price, and a stored copy would go stale
  // the moment the curve in lib/scoring is retuned.
  const score = puzzle ? roundScore(state.guesses, puzzle.price.priceUSD) : 0;

  // A finished day that was already finished when the page loaded still wants
  // its crowd numbers, so this covers both the fresh completion and the reload.
  useEffect(() => {
    if (!mounted || isArchive || !puzzle || !state.done) return;
    const key = `${activeDate}:${puzzle.item.id}:${puzzle.price.countryCode}`;
    if (submitted.current === key) return;
    submitted.current = key;

    const first = state.guesses[0];
    if (!first) return;
    const best = bestPctOff(state.guesses, puzzle.price.priceUSD);

    // A round finished in this session contributes; a reload only reads.
    // Without that split, refreshing the page would be a way to inflate the day.
    const request = justFinished
      ? submitRound({
          date: activeDate,
          itemId: puzzle.item.id,
          country: puzzle.price.countryCode,
          playerCountry: submittableHome(loadHome()),
          won: state.won,
          firstGuessUSD: first.value,
          bestPctOff: best,
          roomCode: loadRoomCode(),
          roomName: loadRoomName(),
          numGuesses: state.guesses.length,
          score: roundScore(state.guesses, puzzle.price.priceUSD),
        })
      : fetchCrowd(activeDate, puzzle.item.id, puzzle.price.countryCode, best);

    request.then(setCrowd);
  }, [mounted, isArchive, puzzle, state, activeDate, justFinished]);

  function selectDate(date: string) {
    setActiveDate(date);
    setState(loadDayState(date));
    setJustFinished(false);
    setCrowd(null);
  }

  function changeCurrency(next: Currency) {
    setCurrency(next);
    saveCurrency(next);
  }

  // Always in USD. GuessInput converts before it gets here, so guesses stay
  // comparable across a mid-round currency switch and in the saved day state.
  function handleGuess(usd: number) {
    if (!puzzle || state.done) return;
    const result = evaluate(usd, puzzle.price.priceUSD);
    const guesses = [
      ...state.guesses,
      {
        value: usd,
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

    if (!done) return;
    setJustFinished(true);

    // Archive replays are practice: they save your result but never touch the
    // streak, the lifetime record or the crowd counters.
    if (isArchive) return;

    const actual = puzzle.price.priceUSD;
    const roundPoints = roundScore(guesses, actual);
    const best = guesses.reduce((a, g) =>
      Math.abs(Math.log(g.value / actual)) < Math.abs(Math.log(a.value / actual))
        ? g
        : a
    );

    setStats(
      recordCompletion(today, {
        date: today,
        won,
        numGuesses: guesses.length,
        openingLogError: Math.log(guesses[0].value / actual),
        category: itemCategory(puzzle.item.id),
        score: roundPoints,
        beatBot: beatTheBot(best.value, puzzle.price)?.playerWon,
      })
    );

    recordPlay({
      date: today,
      itemId: puzzle.item.id,
      itemName: puzzle.item.shortName,
      countryCode: puzzle.price.countryCode,
      countryName: puzzle.price.countryName,
      flag: puzzle.price.flag,
      won,
      numGuesses: guesses.length,
      firstGuessUSD: guesses[0].value,
      bestPctOff: bestPctOff(guesses, actual),
      actualUSD: actual,
      score: roundPoints,
      persona: personaFor(guesses, actual, won).title,
    });
  }

  const highlightGuess =
    state.won && !isArchive ? state.guesses.length : undefined;
  const atRisk = mounted && !isArchive && !state.done && streakAtRisk(stats, today);
  const hint = puzzle
    ? hintFor(puzzle.price, state.guesses.length, puzzle.puzzleNumber)
    : null;

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

          {/* The masthead is the h1, and for a long time the h1 was the single
              word "Pricele". That is the strongest on-page signal a document
              has, and spending all of it on the brand name is why this site
              ranked first for "pricele" and nowhere at all for "guess the price
              game": the home page never once said, in a heading, what it is.
              Every other page on the site has a descriptive h1 through
              ContentPage; only the page that most needs one went without.

              The masthead stays a masthead — this screen is sized to fit
              exactly one viewport and a visible subtitle would push the input
              off a short phone. So the heading continues past the brand word in
              text that is available to screen readers and to anything parsing
              the document, and is not painted. The continuation is the same
              claim the prose below the fold and the meta description already
              make, worded the way a person searching for this kind of game
              would put it. It is description, not a keyword list; keep it that
              way if it is ever edited. */}
          <h1 className="display text-masthead text-ink">
            Pricele
            <span className="sr-only">
              {" "}
              — guess the price of everyday things around the world. A free
              daily price guessing game.
            </span>
          </h1>

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
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent underline underline-offset-[3px] transition-transform duration-press ease-out active:scale-[0.97]"
          >
            Today&apos;s edition
          </button>
        </div>
      )}

      {/* Both the item and the country change daily, so this band is the only
          place that states what the player is actually pricing today.

          The headline wraps to a second line and steps down a size rather than
          truncating: an item and a country together run past a phone's measure
          often enough ("Coca-Cola (330ml can) in United Arab Emirates") that
          cutting the line lost the country, which is the half of the sentence
          the puzzle turns on. Two lines is the ceiling; nothing in the table
          reaches it at the smallest step, and the clamp is there so a future
          long name cannot push the input off a short screen. */}
      <div className="flex shrink-0 items-start gap-3.5 border-y border-rule py-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={puzzle?.item.imageUrl ?? "/items/placeholder.svg"}
          alt=""
          width={44}
          height={44}
          className="mt-0.5 h-11 w-11 shrink-0 border border-rule bg-paper-raised object-contain p-1.5"
        />
        <div className="min-w-0 flex-1">
          <p className="label">Today&apos;s lot</p>
          <h2
            // No `text-balance` here: line-clamp renders the box as a
            // -webkit-box, which ignores text-wrap, so the class would sit in
            // the markup doing nothing. The clamp is worth more than the
            // prettier break — it is what stops a future long name pushing the
            // guess box off a short screen.
            className={`display mt-1 line-clamp-2 leading-[1.15] text-ink ${headlineSize(
              puzzle ? `${puzzle.item.name} in ${puzzle.price.countryName}` : ""
            )}`}
          >
            {puzzle ? (
              <>
                {puzzle.item.name}{" "}
                <span className="text-ink-muted">in</span>{" "}
                {puzzle.price.countryName}
                {/* A non-breaking space, so the flag stays on the last word of
                    the country rather than orphaning onto a line of its own.
                    Only that pair is held together: making the whole country
                    name unbreakable would just move the overflow. */}
                {"\u00a0"}
                <span aria-hidden className="text-[0.75em]">
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
              currency={currency}
              isArchive={isArchive}
              score={score}
              crowd={crowd}
              staged={justFinished}
              today={today}
              roomCode={roomCode}
            />
          </div>
        ) : (
          <>
            {atRisk && (
              <p className="animate-set-in shrink-0 border-l-2 border-streak bg-streak/[0.08] py-1.5 pl-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-streak">
                {stats.currentStreak}-day streak on the line
                {stats.graceDays > 0 &&
                  ` · ${stats.graceDays} ${GRACE_NAME}${stats.graceDays > 1 ? "s" : ""} banked`}
              </p>
            )}

            <GuessHistory guesses={state.guesses} currency={currency} />

            <div className="shrink-0">
              {/* The clue before the last bid. About the study and the policy
                  behind the price, never the figure. See lib/hints.ts. */}
              {hint && (
                <p className="animate-set-in mb-2.5 border-l-2 border-accent bg-accent/[0.06] py-1.5 pl-2.5 pr-2 text-[12px] leading-relaxed text-ink-body">
                  <span className="label !text-accent">Clue</span>{" "}
                  <span className="ml-1">{hint}</span>
                </p>
              )}

              {state.guesses.length === 0 && (
                <p className="mb-2.5 text-center text-[12px] leading-relaxed text-ink-meta">
                  For scale, the median{" "}
                  {puzzle.item.shortName.toLowerCase()} across all countries is{" "}
                  <span className="font-mono tabular-nums text-ink-body">
                    {formatPrice(anchorPriceUSD(puzzle.item.id), currency)}
                  </span>
                  .
                </p>
              )}
              <GuessInput
                disabled={state.done}
                remaining={MAX_GUESSES - state.guesses.length}
                currency={currency}
                onCurrencyChange={changeCurrency}
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
        currency={currency}
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
