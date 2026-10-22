"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HISTORY_ITEMS, HOURLY_WAGE } from "@/data/price-history";
import {
  ROUNDS,
  ROUND_MAX,
  basketMinutes,
  isOver,
  loadState,
  missEmoji,
  puzzleFor,
  result,
  roundScore,
  saveState,
  shareText,
  type Receipt,
  type YearState,
} from "@/lib/priceyear";
import { isoDate } from "@/lib/puzzle";
import { trackEvent } from "@/lib/analytics";
import NextUp from "./NextUp";
import ShareButton from "./ShareButton";

const usd = (n: number) => `$${n.toFixed(2)}`;
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function ReceiptCard({ receipt, year }: { receipt: Receipt; year: number | null }) {
  const total = receipt.items.reduce((s, i) => s + i.prices[receipt.year], 0);
  return (
    <div className="mx-auto w-full max-w-sm border border-rule border-t-2 border-t-ink bg-paper-raised px-5 py-4 font-mono text-[14px] text-ink">
      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-ink-muted">
        U.S. average prices · {year ?? "????"}
      </p>
      <ul className="mt-3 flex flex-col gap-2 border-b border-dashed border-rule pb-3">
        {receipt.items.map((i) => (
          <li key={i.id} className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 font-sans text-[15px]">{i.name}</span>
            <span className="shrink-0">{usd(i.prices[receipt.year])}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex justify-between text-[13px] uppercase tracking-[0.14em]">
        <span>Total</span>
        <span>{usd(total)}</span>
      </p>
    </div>
  );
}

function WorkTime({ receipt, latestYear }: { receipt: Receipt; latestYear: number }) {
  const then = basketMinutes(receipt.items, receipt.year, HOURLY_WAGE);
  const now = basketMinutes(receipt.items, latestYear, HOURLY_WAGE);
  if (then === null || now === null || receipt.year === latestYear) return null;
  return (
    <p className="text-[14px] text-ink-muted">
      At the average U.S. hourly wage, this basket took {Math.round(then)} minutes of work in{" "}
      {receipt.year}. In {latestYear} it took {Math.round(now)}.
    </p>
  );
}

export default function PriceYear() {
  const [date, setDate] = useState<string | null>(null);
  const [state, setState] = useState<YearState | null>(null);
  const [year, setYear] = useState(2003);
  const [reviewing, setReviewing] = useState(false);
  const acted = useRef(false);

  useEffect(() => {
    if (!acted.current) return;
    document
      .querySelector<HTMLElement>(reviewing ? "[data-focus=next]" : "[data-focus=after]")
      ?.focus();
  }, [reviewing]);

  useEffect(() => {
    const d = isoDate();
    setDate(d);
    setState(loadState(d));
  }, []);

  if (!date || !state) return <p className="text-ink-muted">Loading today&apos;s receipts…</p>;

  const p = puzzleFor(date, HISTORY_ITEMS);
  const over = isOver(state);
  const round = state.guesses.length;
  const mid = Math.round((p.firstYear + p.latestYear) / 2);
  const showing = reviewing ? round - 1 : round;
  const lastGuess = state.guesses[round - 1];

  function lockIn() {
    if (!state || over) return;
    const next = { ...state, guesses: [...state.guesses, year] };
    setState(next);
    saveState(next);
    acted.current = true;
    setReviewing(true);
    if (isOver(next)) trackEvent("year_complete", { score: result(p, next) });
  }

  function nextReceipt() {
    acted.current = true;
    setReviewing(false);
    setYear(mid);
  }

  const nudge = (d: number) => setYear((y) => Math.min(p.latestYear, Math.max(p.firstYear, y + d)));

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <p className="label text-center">
        Price Year #{p.number} ·{" "}
        {over && !reviewing ? "Final score" : `Receipt ${showing + 1} of ${ROUNDS}`}
      </p>

      {!over || reviewing ? (
        <>
          <ReceiptCard
            receipt={p.receipts[showing]}
            year={reviewing ? p.receipts[showing].year : null}
          />
          {reviewing ? (
            <div className="flex flex-col gap-3" aria-live="polite">
              <p className="display text-center text-[1.5rem] leading-tight text-ink">
                {missEmoji(Math.abs(lastGuess - p.receipts[showing].year))} It was{" "}
                {p.receipts[showing].year}. You said {lastGuess}.
              </p>
              <p className="text-center font-mono text-[13px] uppercase tracking-[0.14em] text-ink-muted">
                +{roundScore(lastGuess, p.receipts[showing].year)} of {ROUND_MAX}
              </p>
              <WorkTime receipt={p.receipts[showing]} latestYear={p.latestYear} />
              <button
                data-focus="next"
                onClick={nextReceipt}
                className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
              >
                {over ? "See your score" : "Next receipt"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="display text-center text-[1.4rem] leading-tight text-ink">
                What year is this receipt from?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  aria-label="One year earlier"
                  onClick={() => nudge(-1)}
                  className="h-11 w-11 border border-rule font-mono text-ink"
                >
                  −
                </button>
                <output
                  htmlFor="year-slider"
                  data-testid="year-value"
                  className="w-24 text-center font-mono text-[2rem] text-ink"
                >
                  {year}
                </output>
                <button
                  aria-label="One year later"
                  onClick={() => nudge(1)}
                  className="h-11 w-11 border border-rule font-mono text-ink"
                >
                  +
                </button>
              </div>
              <input
                id="year-slider"
                data-focus="after"
                type="range"
                min={p.firstYear}
                max={p.latestYear}
                step={1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                aria-label="Year"
                className="w-full accent-accent"
              />
              <div className="flex justify-between font-mono text-[12px] text-ink-muted">
                <span>{p.firstYear}</span>
                <span>{p.latestYear}</span>
              </div>
              <button
                onClick={lockIn}
                className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
              >
                Lock in {year}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <p
            className="display text-center text-[2.4rem] leading-none text-ink"
            data-testid="year-total"
            data-focus="after"
            tabIndex={-1}
          >
            {result(p, state)}
          </p>
          <ol className="flex flex-col gap-1.5" aria-label="Your receipts">
            {p.receipts.map((r, i) => (
              <li
                key={i}
                className="flex justify-between border-b border-rule-soft py-1.5 text-[14px]"
              >
                <span>
                  {missEmoji(Math.abs(state.guesses[i] - r.year))}{" "}
                  {r.items.map((x) => lowerFirst(x.name.replace(/^An? /, ""))).join(", ")}
                </span>
                <span className="shrink-0 pl-3 font-mono text-ink-muted">
                  You {state.guesses[i]} · Real{" "}
                  <Link
                    href={`/years/${r.year}`}
                    className="underline underline-offset-2 hover:text-ink"
                  >
                    {r.year}
                  </Link>
                </span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] text-ink-muted">
            🟩 within 1 year · 🟨 within 3 · 🟧 within 7 · ⬛ 8 or more off
          </p>
          <ShareButton
            score={result(p, state)}
            text={(url) => shareText(p, state, url)}
            path="/games/price-year"
            campaign="game-price-year"
            event="year_share"
          />
          <p className="text-[13px] text-ink-muted">
            Five new receipts at your local midnight. Tap a year to see everything it cost.
          </p>
          <NextUp current="price-year" />
        </div>
      )}

      <p className="text-[13px] leading-relaxed text-ink-muted">
        Source: U.S. Bureau of Labor Statistics, Average Price Data (U.S. city average) and average
        hourly earnings of production and nonsupervisory employees. Each year&apos;s figure is the
        mean of its monthly values. Prices are not adjusted for inflation.
      </p>
    </div>
  );
}
