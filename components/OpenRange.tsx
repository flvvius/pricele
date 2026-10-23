"use client";

import { useEffect, useRef, useState } from "react";
import {
  MAX_WIDTH,
  QUESTIONS,
  QUESTION_MAX,
  isHit,
  isOver,
  isValidRange,
  loadState,
  missDirection,
  missedBy,
  puzzleFor,
  questionScore,
  result,
  saveState,
  shareText,
  width,
  type Range,
  type RangeQuestion,
  type RangeState,
  KEY,
  EPOCH,
} from "@/lib/openrange";
import { formatLocal, formatUSD } from "@/lib/format";
import { isoDate } from "@/lib/puzzle";
import { archiveDate, archiveKey } from "@/lib/gamedate";
import ArchiveNote from "./ArchiveNote";
import { trackEvent } from "@/lib/analytics";
import NextUp from "./NextUp";
import ScoreRank from "./ScoreRank";
import ShareButton from "./ShareButton";

function Verdict({ q, r }: { q: RangeQuestion; r: Range }) {
  const answer = q.price.priceUSD;
  const local = formatLocal(q.price);
  return (
    <div className="flex flex-col gap-1 text-center" aria-live="polite">
      <p className="display text-[1.5rem] leading-tight text-ink">
        {isHit(r, answer) ? "🎯" : "❌"} It&apos;s {formatUSD(answer)}
        {local ? <span className="text-ink-muted"> ({local})</span> : null}.
      </p>
      <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-ink-muted">
        {isHit(r, answer)
          ? `+${questionScore(r, answer)} of ${QUESTION_MAX} · width ${width(r).toFixed(1)}x`
          : `${missDirection(r, answer) === "above" ? "Above" : "Below"} your range by ${Math.max(
              1,
              Math.round(missedBy(r, answer) * 100)
            )}%`}
      </p>
      <p className="text-[13px] text-ink-muted">Source: {q.price.source}</p>
    </div>
  );
}

const clean = (v: string) => v.replace(/[$,\s]/g, "");
const PRICE_INPUT = /^\d{0,6}(\.\d{0,2})?$/;

function parse(v: string): number {
  const n = Number(v);
  return v !== "" && Number.isFinite(n) ? n : NaN;
}

function hint(r: Range, empty: boolean): string {
  if (empty) return "Enter a low and a high price.";
  if (!(r.low > 0) || !(r.high > 0)) return "Prices have to be above $0.";
  if (r.high <= r.low) return "The high has to be above the low.";
  if (width(r) > MAX_WIDTH) return `Too wide. Keep the high within ${MAX_WIDTH}x the low.`;
  return `Width ${width(r).toFixed(1)}x. Worth ${questionScore(r, r.low)} points if it lands.`;
}

export default function OpenRange() {
  const [date, setDate] = useState<string | null>(null);
  const [state, setState] = useState<RangeState | null>(null);
  const [archived, setArchived] = useState(false);
  const [low, setLow] = useState("");
  const [high, setHigh] = useState("");
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

  if (!date || !state) return <p className="min-h-[100svh] text-ink-muted">Loading today&apos;s questions…</p>;

  const p = puzzleFor(date);
  const over = isOver(state);
  const i = state.ranges.length;
  const showing = reviewing ? i - 1 : i;
  const q = p.questions[Math.min(showing, QUESTIONS - 1)];
  const draft = { low: parse(low), high: parse(high) };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!state || over || !isValidRange(draft)) return;
    const next = { ...state, ranges: [...state.ranges, draft] };
    setState(next);
    saveState(next, archived ? archiveKey(KEY) : KEY);
    acted.current = true;
    setReviewing(true);
    if (isOver(next)) trackEvent("range_complete", { score: result(p, next) });
  }

  function nextQuestion() {
    acted.current = true;
    setReviewing(false);
    setLow("");
    setHigh("");
  }

  const input =
    "w-full border border-rule bg-paper-raised py-3 pl-7 pr-3 font-mono text-[1.25rem] text-ink focus:border-ink focus:outline-none";

  return (
    <div className="flex max-w-xl flex-col gap-5">
      {archived && <ArchiveNote date={date} href="/games/open-range" />}
      <p className="label text-center">
        Open Range #{p.number} ·{" "}
        {over && !reviewing ? "Final score" : `Question ${showing + 1} of ${QUESTIONS}`}
      </p>

      {!over || reviewing ? (
        <>
          <div className="flex flex-col items-center gap-1 border border-rule border-t-2 border-t-ink bg-paper-raised px-4 py-5 text-center">
            <span className="display text-[1.6rem] leading-tight text-ink">{q.label}</span>
            <span className="text-[16px] text-ink-body">
              in {q.price.countryName} {q.price.flag}
            </span>
            <span className="mt-2 text-[13px] text-ink-muted">
              Typical across all countries: {formatUSD(q.median)}
            </span>
          </div>

          {reviewing ? (
            <div className="flex flex-col gap-3">
              <Verdict q={q} r={state.ranges[showing]} />
              <p className="text-center font-mono text-[13px] text-ink-muted">
                Your range: {formatUSD(state.ranges[showing].low)} to{" "}
                {formatUSD(state.ranges[showing].high)}
              </p>
              <button
                data-focus="next"
                onClick={nextQuestion}
                className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
              >
                {over ? "See your score" : "Next question"}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <p className="display text-center text-[1.4rem] leading-tight text-ink">
                Give a range in U.S. dollars. Narrow scores more, but it has to land.
              </p>
              <div className="flex items-center gap-2">
                <label className="relative flex-1">
                  <span className="sr-only">Low</span>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-ink-muted">
                    $
                  </span>
                  <input
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="low"
                    value={low}
                    onChange={(e) =>
                      PRICE_INPUT.test(clean(e.target.value)) && setLow(clean(e.target.value))
                    }
                    data-testid="range-low"
                    data-focus="after"
                    className={input}
                  />
                </label>
                <span className="font-mono text-ink-muted">to</span>
                <label className="relative flex-1">
                  <span className="sr-only">High</span>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-ink-muted">
                    $
                  </span>
                  <input
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="high"
                    value={high}
                    onChange={(e) =>
                      PRICE_INPUT.test(clean(e.target.value)) && setHigh(clean(e.target.value))
                    }
                    data-testid="range-high"
                    className={input}
                  />
                </label>
              </div>
              <p className="text-center text-[13px] text-ink-muted" aria-live="polite">
                {hint(draft, low === "" || high === "")}
              </p>
              <button
                type="submit"
                disabled={!isValidRange(draft)}
                className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98] disabled:opacity-40"
              >
                Lock in range
              </button>
            </form>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <p
            className="display text-center text-[2.4rem] leading-none text-ink"
            data-testid="range-total"
            data-focus="after"
            tabIndex={-1}
          >
            {result(p, state)}
          </p>
          <ol className="flex flex-col gap-1.5" aria-label="Your ranges">
            {p.questions.map((qq, k) => {
              const r = state.ranges[k];
              return (
                <li
                  key={k}
                  className="flex flex-col gap-0.5 border-b border-rule-soft py-2 text-[14px]"
                >
                  <span className="flex justify-between gap-3">
                    <span className="min-w-0">
                      {isHit(r, qq.price.priceUSD) ? "🎯" : "❌"} {qq.label}, {qq.price.countryName}
                    </span>
                    <span className="shrink-0 font-mono text-ink">
                      +{questionScore(r, qq.price.priceUSD)}
                    </span>
                  </span>
                  <span className="font-mono text-[12px] text-ink-muted">
                    You: {formatUSD(r.low)}–{formatUSD(r.high)} · Real:{" "}
                    {formatUSD(qq.price.priceUSD)}
                  </span>
                </li>
              );
            })}
          </ol>
          <ShareButton
            score={result(p, state)}
            text={(url) => shareText(p, state, url)}
            path="/games/open-range"
            campaign="game-open-range"
            event="range_share"
          />
          <p className="text-[13px] text-ink-muted">Five new questions at your local midnight.</p>
          <ScoreRank game="open-range" name="Open Range" date={date} state={state} archived={archived} />
          <NextUp current="open-range" />
        </div>
      )}

      <p className="text-[13px] leading-relaxed text-ink-muted">
        Prices are the same sourced figures as the daily Pricele puzzle, converted to U.S. dollars.
        A hit scores up to {QUESTION_MAX} points, less the wider the range; a miss scores nothing.
        The &quot;typical&quot; figure is the median across every country we have the item for.
      </p>
    </div>
  );
}
