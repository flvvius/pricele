"use client";

import { useEffect, useState } from "react";
import { getDailyPuzzle, isoDateUTC } from "@/lib/puzzle";
import { ACTIVE_ITEM } from "@/data/item";
import { evaluate } from "@/lib/scoring";
import {
  loadDayState,
  saveDayState,
  loadStreak,
  recordCompletion,
  type DayState,
} from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";
import GuessInput from "./GuessInput";
import GuessHistory from "./GuessHistory";
import Reveal from "./Reveal";

// The item is fixed for the month, so its header can render in the static HTML.
// Anything that depends on the current day is computed after mount so the build-time
// HTML and the client agree.
function ItemHeader({ countryLine }: { countryLine: React.ReactNode }) {
  return (
    <header className="flex items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ACTIVE_ITEM.imageUrl}
        alt={ACTIVE_ITEM.name}
        width={64}
        height={64}
        className="h-16 w-16 rounded-lg bg-white object-contain p-1"
      />
      <div>
        <p className="text-sm text-neutral-400">Guess the price of</p>
        <h2 className="text-xl font-bold">{ACTIVE_ITEM.name}</h2>
        <p className="text-lg">{countryLine}</p>
      </div>
    </header>
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
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const day = isoDateUTC(new Date());
    setToday(day);
    setState(loadDayState(day));
    setStreak(loadStreak().count);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-6">
        <ItemHeader countryLine={<span className="text-neutral-500">Loading today&apos;s country</span>} />
      </div>
    );
  }

  const puzzle = getDailyPuzzle(new Date());
  if (!puzzle) {
    return (
      <p className="text-center text-neutral-400">
        No puzzle set for today. Check back soon.
      </p>
    );
  }

  const { price, puzzleNumber } = puzzle;
  const tomorrow = getDailyPuzzle(
    new Date(Date.parse(today + "T00:00:00Z") + 86400000)
  );

  function handleGuess(value: number) {
    if (state.done) return;
    const result = evaluate(value, price.priceUSD);
    const guesses = [
      ...state.guesses,
      { value, band: result.band, direction: result.direction },
    ];
    const won = result.win;
    const done = won || guesses.length >= MAX_GUESSES;

    const next: DayState = { date: today, guesses, done, won };
    setState(next);
    saveDayState(next);

    if (done) {
      setStreak(recordCompletion(today, won).count);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ItemHeader
        countryLine={
          <>
            in {price.countryName} <span aria-hidden>{price.flag}</span>
          </>
        }
      />

      <p className="text-center text-sm text-neutral-500">
        You&apos;re guessing in{" "}
        <span className="font-semibold text-neutral-300">USD</span>. Land within
        10% to win.
      </p>

      <GuessHistory guesses={state.guesses} />

      {state.done ? (
        <Reveal
          puzzleNumber={puzzleNumber}
          itemName={ACTIVE_ITEM.name}
          price={price}
          guesses={state.guesses}
          won={state.won}
          streak={streak}
          nextCountryName={tomorrow?.price.countryName ?? "a new country"}
        />
      ) : (
        <GuessInput
          disabled={state.done}
          remaining={MAX_GUESSES - state.guesses.length}
          onGuess={handleGuess}
        />
      )}
    </div>
  );
}
