"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import { HOURLY_WAGE } from "@/data/price-history";
import {
  isOver,
  judge,
  loadState,
  saveState,
  puzzleFor,
  shareText,
  MAX_GUESSES,
  type ThenNowState,
  KEY,
  EPOCH,
} from "@/lib/thenandnow";
import { isoDate } from "@/lib/puzzle";
import { parsePrice, sanitizePrice } from "@/lib/priceinput";
import { archiveDate, archiveKey } from "@/lib/gamedate";
import ArchiveNote from "./ArchiveNote";
import { trackEvent } from "@/lib/analytics";
import NextUp from "./NextUp";
import ScoreRank from "./ScoreRank";
import ShareButton from "./ShareButton";

const usd = (n: number) => `$${n.toFixed(2)}`;
const minutes = (m: number) => (m < 10 ? m.toFixed(1) : String(Math.round(m)));

export default function ThenAndNow() {
  // Date is read after mount so the puzzle follows the player's local midnight.
  const [date, setDate] = useState<string | null>(null);
  const [state, setState] = useState<ThenNowState | null>(null);
  const [archived, setArchived] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    const past = archiveDate(window.location.search, EPOCH);
    const d = past ?? isoDate();
    setArchived(past !== null);
    setDate(d);
    setState(loadState(d, past ? archiveKey(KEY) : KEY));
  }, []);

  if (!date || !state) return <p className="min-h-[100svh] text-ink-muted">Loading today&apos;s puzzle…</p>;

  const p = puzzleFor(date, THEN_NOW_ITEMS);
  const over = isOver(state, p.answer);
  const won = state.guesses.some((g) => judge(g, p.answer) === "win");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parsePrice(input);
    if (!state || over || !Number.isFinite(n) || n <= 0) return;
    const next = { ...state, guesses: [...state.guesses, Math.round(n * 100) / 100] };
    setState(next);
    saveState(next, archived ? archiveKey(KEY) : KEY);
    setInput("");
    if (isOver(next, p.answer)) {
      trackEvent("thenandnow_complete", {
        won: next.guesses.some((g) => judge(g, p.answer) === "win"),
        guesses: next.guesses.length,
      });
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      {archived && <ArchiveNote date={date} href="/games/then-and-now" />}
      <figure className="border border-rule border-t-2 border-t-ink bg-paper-raised px-5 py-5 text-center">
        <figcaption className="label">
          Then &amp; Now #{p.number} · {p.item.unit}
        </figcaption>
        <p className="display mt-3 text-[1.75rem] leading-tight text-ink">{p.item.name}</p>
        <p className="mt-3 text-[15px] text-ink-body">
          In {p.anchorYear} it averaged <strong>{usd(p.anchor)}</strong> in U.S. cities.
        </p>
        <p className="display mt-4 text-[2.25rem] leading-none text-ink">What about {p.year}?</p>
        <p className="mt-3 text-[14px] text-ink-muted">
          {over ? "" : `Within 10% wins. ${MAX_GUESSES - state.guesses.length} guesses left.`}
        </p>
      </figure>

      <ol className="flex flex-col gap-1.5" aria-live="polite">
        {state.guesses.map((g, i) => {
          const v = judge(g, p.answer);
          return (
            <li key={i} className="flex justify-between border-b border-rule-soft py-1.5 font-mono text-[14px]">
              <span>{usd(g)}</span>
              <span>{v === "win" ? "Got it" : v === "higher" ? "Higher ↑" : "Lower ↓"}</span>
            </li>
          );
        })}
      </ol>

      {over ? (
        <div className="flex flex-col gap-3">
          <p className="text-[16px] text-ink-body">
            {won ? "Nice. " : ""}In {p.year}, {p.item.name.toLowerCase()} averaged{" "}
            <strong>{usd(p.answer)}</strong>.
          </p>
          {HOURLY_WAGE[p.year] && HOURLY_WAGE[p.anchorYear] && (
            <p className="text-[14px] text-ink-muted">
              At the average hourly wage that was about{" "}
              {minutes((p.answer / HOURLY_WAGE[p.year]) * 60)} minutes of work. In {p.anchorYear} it
              was about {minutes((p.anchor / HOURLY_WAGE[p.anchorYear]) * 60)}.{" "}
              <Link
                href={`/years/${p.year}`}
                className="underline underline-offset-2 hover:text-ink"
              >
                Everything else from {p.year}
              </Link>
            </p>
          )}
          <ShareButton
            score={`${won ? state.guesses.length : "X"}/${MAX_GUESSES}`}
            text={(url) => shareText(p, state.guesses, url)}
            path="/games/then-and-now"
            event="thenandnow_share"
          />
          <p className="text-[13px] text-ink-muted">A new item at your local midnight.</p>
          <ScoreRank game="then-and-now" name="Then & Now" date={date} state={state} archived={archived} />
          <NextUp current="then-and-now" />
        </div>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="go"
            aria-label={`Price in ${p.year}, in US dollars`}
            placeholder="$0.00"
            value={input}
            onChange={(e) => setInput(sanitizePrice(e.target.value))}
            className="min-w-0 flex-1 border border-rule bg-paper-raised px-3 py-2.5 font-mono text-ink"
          />
          <button
            type="submit"
            // Disabled until there is a price to send: an empty or "0" guess
            // used to be swallowed without a word. And it never takes focus
            // from the field, so the keyboard stays up between guesses rather
            // than closing after every tap of Guess.
            disabled={!(parsePrice(input) > 0)}
            onMouseDown={(e) => e.preventDefault()}
            className="bg-ink px-5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised disabled:opacity-40"
          >
            Guess
          </button>
        </form>
      )}

      <p className="text-[13px] leading-relaxed text-ink-muted">
        Source: U.S. Bureau of Labor Statistics, Average Price Data, U.S. city average, series{" "}
        <a
          className="underline"
          href={`https://data.bls.gov/timeseries/${p.item.series}`}
          rel="noopener"
        >
          {p.item.series}
        </a>{" "}
        ({p.item.blsItem}). Annual figure is the mean of that year&apos;s monthly averages; not
        adjusted for inflation.
      </p>
    </div>
  );
}
