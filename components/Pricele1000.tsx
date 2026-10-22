"use client";

import { useEffect, useRef, useState } from "react";
import {
  MAX_SCORE,
  ROUNDS,
  ROUND_MAX,
  bandEmoji,
  baseScore,
  isOver,
  loadState,
  percentOff,
  priceToSlider,
  puzzleFor,
  result,
  roundPrice,
  roundScore,
  saveState,
  shareText,
  sliderToPrice,
  type ScoredRound,
  type ScoredState,
  KEY,
} from "@/lib/pricele1000";
import { EPOCH } from "@/lib/openrange";
import { formatLocal, formatUSD } from "@/lib/format";
import { isoDate } from "@/lib/puzzle";
import { archiveDate, archiveKey } from "@/lib/gamedate";
import ArchiveNote from "./ArchiveNote";
import { trackEvent } from "@/lib/analytics";
import NextUp from "./NextUp";
import ShareButton from "./ShareButton";

const STEPS = 400;
const WEIGHT_LABEL: Record<number, string> = { 2: " · counts double", 3: " · counts triple" };

function startAt(r: ScoredRound): number {
  return Math.round(priceToSlider(r.median, r.min, r.max) * STEPS);
}

export default function Pricele1000() {
  const [date, setDate] = useState<string | null>(null);
  const [state, setState] = useState<ScoredState | null>(null);
  const [archived, setArchived] = useState(false);
  const [step, setStep] = useState<number | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const acted = useRef(false);

  useEffect(() => {
    if (!acted.current) return;
    document
      .querySelector<HTMLElement>(reviewing ? "[data-focus=next]" : "[data-focus=after]")
      ?.focus();
  }, [reviewing]);

  useEffect(() => {
    const past = archiveDate(window.location.search, EPOCH);
    const d = past ?? isoDate();
    setArchived(past !== null);
    setDate(d);
    setState(loadState(d, past ? archiveKey(KEY) : KEY));
  }, []);

  if (!date || !state) return <p className="text-ink-muted">Loading today&apos;s rounds…</p>;

  const p = puzzleFor(date);
  const over = isOver(state);
  const i = state.guesses.length;
  const showing = reviewing ? i - 1 : i;
  const round = p.rounds[Math.min(showing, ROUNDS - 1)];
  const position = step ?? startAt(round);
  const guess = roundPrice(sliderToPrice(position / STEPS, round.min, round.max));

  function lockIn() {
    if (!state || over) return;
    const next = { ...state, guesses: [...state.guesses, guess] };
    setState(next);
    saveState(next, archived ? archiveKey(KEY) : KEY);
    acted.current = true;
    setReviewing(true);
    if (isOver(next)) trackEvent("p1000_complete", { score: result(p, next) });
  }

  function nextRound() {
    acted.current = true;
    setReviewing(false);
    setStep(null);
  }

  const nudge = (d: number) => setStep(Math.min(STEPS, Math.max(0, position + d)));
  const button =
    "bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]";

  return (
    <div className="flex max-w-xl flex-col gap-5">
      {archived && <ArchiveNote date={date} href="/games/pricele-1000" />}
      <p className="label text-center">
        Pricele 1000 #{p.number} ·{" "}
        {over && !reviewing
          ? "Final score"
          : `Round ${showing + 1} of ${ROUNDS}${WEIGHT_LABEL[round.weight] ?? ""}`}
      </p>

      {!over || reviewing ? (
        <>
          <div className="flex flex-col items-center gap-1 border border-rule border-t-2 border-t-ink bg-paper-raised px-4 py-5 text-center">
            <span className="display text-[1.6rem] leading-tight text-ink">{round.label}</span>
            <span className="text-[16px] text-ink-body">
              in {round.price.countryName} {round.price.flag}
            </span>
            <span className="mt-2 text-[13px] text-ink-muted">
              Typical across all countries: {formatUSD(round.median)}
            </span>
          </div>

          {reviewing ? (
            <div className="flex flex-col gap-3 text-center" aria-live="polite">
              <p className="display text-[1.5rem] leading-tight text-ink">
                {bandEmoji(state.guesses[showing], round.price.priceUSD)} It&apos;s{" "}
                {formatUSD(round.price.priceUSD)}
                {formatLocal(round.price) ? (
                  <span className="text-ink-muted"> ({formatLocal(round.price)})</span>
                ) : null}
                .
              </p>
              <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-ink-muted">
                You said {formatUSD(state.guesses[showing])} ·{" "}
                {Math.round(percentOff(state.guesses[showing], round.price.priceUSD) * 100)}% off ·
                +{roundScore(round, state.guesses[showing])}
                {round.weight > 1
                  ? ` (${baseScore(state.guesses[showing], round.price.priceUSD)} × ${round.weight})`
                  : ""}
              </p>
              <p className="text-[13px] text-ink-muted">Source: {round.price.source}</p>
              <button data-focus="next" onClick={nextRound} className={button}>
                {over ? "See your score" : "Next round"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-3">
                <button
                  aria-label="Lower"
                  onClick={() => nudge(-2)}
                  className="h-11 w-11 border border-rule font-mono text-ink"
                >
                  −
                </button>
                <output
                  htmlFor="p1000-slider"
                  data-testid="p1000-value"
                  className="min-w-[7rem] text-center font-mono text-[2rem] text-ink"
                >
                  {formatUSD(guess)}
                </output>
                <button
                  aria-label="Higher"
                  onClick={() => nudge(2)}
                  className="h-11 w-11 border border-rule font-mono text-ink"
                >
                  +
                </button>
              </div>
              <input
                id="p1000-slider"
                data-focus="after"
                type="range"
                min={0}
                max={STEPS}
                step={1}
                value={position}
                onChange={(e) => setStep(Number(e.target.value))}
                aria-label="Your price"
                aria-valuetext={formatUSD(guess)}
                className="w-full accent-accent"
              />
              <div className="flex justify-between font-mono text-[12px] text-ink-muted">
                <span>{formatUSD(roundPrice(round.min))}</span>
                <span>{formatUSD(roundPrice(round.max))}</span>
              </div>
              <button onClick={lockIn} className={button}>
                Lock in {formatUSD(guess)}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <p
            className="display text-center text-[2.4rem] leading-none text-ink"
            data-testid="p1000-total"
            data-focus="after"
            tabIndex={-1}
          >
            {result(p, state)}
          </p>
          <ol className="flex flex-col gap-1.5" aria-label="Your rounds">
            {p.rounds.map((r, k) => (
              <li
                key={k}
                className="flex justify-between gap-3 border-b border-rule-soft py-1.5 text-[14px]"
              >
                <span className="min-w-0">
                  {bandEmoji(state.guesses[k], r.price.priceUSD)} {r.label}, {r.price.countryName}
                </span>
                <span className="shrink-0 font-mono text-ink-muted">
                  You {formatUSD(state.guesses[k])} · Real {formatUSD(r.price.priceUSD)}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] text-ink-muted">
            🟩 within 10% · 🟨 within 25% · 🟧 within 50% · ⬛ further off
          </p>
          <ShareButton
            score={result(p, state)}
            text={(url) => shareText(p, state, url)}
            path="/games/pricele-1000"
            campaign="game-pricele-1000"
            event="p1000_share"
          />
          <p className="text-[13px] text-ink-muted">Five new rounds at your local midnight.</p>
          <NextUp current="pricele" />
        </div>
      )}

      <p className="text-[13px] leading-relaxed text-ink-muted">
        Each round scores up to {ROUND_MAX}, less the further off you are. A guess 1.75 times too
        high or too low scores nothing. Round three counts double and rounds four and five triple,
        so the total is out of {MAX_SCORE}. Prices are the same sourced figures as the daily Pricele
        puzzle, in U.S. dollars.
      </p>
    </div>
  );
}
