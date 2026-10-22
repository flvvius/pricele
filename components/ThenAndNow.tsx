"use client";

import { useEffect, useState } from "react";
import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import {
  isOver,
  judge,
  loadState,
  saveState,
  puzzleFor,
  shareText,
  MAX_GUESSES,
  type ThenNowState,
} from "@/lib/thenandnow";
import { isoDate } from "@/lib/puzzle";
import { SITE_URL } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

const usd = (n: number) => `$${n.toFixed(2)}`;

export default function ThenAndNow() {
  // Date is read after mount so the puzzle follows the player's local midnight.
  const [date, setDate] = useState<string | null>(null);
  const [state, setState] = useState<ThenNowState | null>(null);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = isoDate();
    setDate(d);
    setState(loadState(d));
  }, []);

  if (!date || !state) return <p className="text-ink-muted">Loading today&apos;s puzzle…</p>;

  const p = puzzleFor(date, THEN_NOW_ITEMS);
  const over = isOver(state, p.answer);
  const won = state.guesses.some((g) => judge(g, p.answer) === "win");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(input.replace(/[$,\s]/g, ""));
    if (!state || over || !Number.isFinite(n) || n <= 0) return;
    const next = { ...state, guesses: [...state.guesses, Math.round(n * 100) / 100] };
    setState(next);
    saveState(next);
    setInput("");
    if (isOver(next, p.answer)) {
      trackEvent("thenandnow_complete", {
        won: next.guesses.some((g) => judge(g, p.answer) === "win"),
        guesses: next.guesses.length,
      });
    }
  }

  async function share() {
    const text = shareText(p, state!.guesses, `${SITE_URL}/games/then-and-now`);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackEvent("thenandnow_share", { channel: "copy" });
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
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

      <ol className="flex flex-col gap-1.5">
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
          <button
            onClick={share}
            className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised"
          >
            {copied ? "Copied" : "Share result"}
          </button>
          <p className="text-[13px] text-ink-muted">A new item at your local midnight.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input
            inputMode="decimal"
            aria-label={`Price in ${p.year}, in US dollars`}
            placeholder="$0.00"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-w-0 flex-1 border border-rule bg-paper-raised px-3 py-2.5 font-mono text-ink"
          />
          <button type="submit" className="bg-ink px-5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised">
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
