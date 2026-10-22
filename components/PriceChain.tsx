"use client";

import { useEffect, useState } from "react";
import {
  CALLS,
  isOver,
  loadState,
  puzzleFor,
  result,
  saveState,
  shareText,
  truth,
  type Call,
  type ChainState,
  KEY,
  EPOCH,
} from "@/lib/pricechain";
import type { Card } from "@/lib/higherlower";
import { isoDate } from "@/lib/puzzle";
import { archiveDate, archiveKey } from "@/lib/gamedate";
import ArchiveNote from "./ArchiveNote";
import { trackEvent } from "@/lib/analytics";
import NextUp from "./NextUp";
import ShareButton from "./ShareButton";

const usd = (n: number) => (n >= 100 ? `$${Math.round(n)}` : `$${n.toFixed(2)}`);

function CardFace({ card, price, label }: { card: Card; price: boolean; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 border border-rule border-t-2 border-t-ink bg-paper-raised px-3 py-4 text-center">
      <span className="label">{label}</span>
      <span className="display text-[1.35rem] leading-tight text-ink">{card.itemName}</span>
      <span className="text-[15px] text-ink-body">
        in {card.countryName} {card.flag}
      </span>
      <span className="mt-1 font-mono text-[1.5rem] text-ink">{price ? usd(card.priceUSD) : "?"}</span>
    </div>
  );
}

export default function PriceChain() {
  const [date, setDate] = useState<string | null>(null);
  const [state, setState] = useState<ChainState | null>(null);
  const [archived, setArchived] = useState(false);

  useEffect(() => {
    const past = archiveDate(window.location.search, EPOCH);
    const d = past ?? isoDate();
    setArchived(past !== null);
    setDate(d);
    setState(loadState(d, past ? archiveKey(KEY) : KEY));
  }, []);

  if (!date || !state) return <p className="text-ink-muted">Loading today&apos;s chain…</p>;

  const p = puzzleFor(date);
  const over = isOver(state);
  const i = state.calls.length;

  function call(c: Call) {
    if (!state || over) return;
    const next = { ...state, calls: [...state.calls, c] };
    setState(next);
    saveState(next, archived ? archiveKey(KEY) : KEY);
    if (isOver(next)) trackEvent("chain_complete", { score: result(p, next) });
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      {archived && <ArchiveNote date={date} href="/games/higher-or-lower" />}
      <p className="label text-center">
        Higher or Lower Daily #{p.number} · Call {Math.min(i + 1, CALLS)} of {CALLS}
      </p>

      {!over && (
        <>
          <div className="flex gap-2">
            <CardFace card={p.cards[i]} price label="This" />
            <CardFace card={p.cards[i + 1]} price={false} label="Next" />
          </div>
          <p className="display text-center text-[1.4rem] leading-tight text-ink">
            Is the next price higher or lower?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => call("higher")}
              className="flex-1 bg-ink px-4 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
            >
              Higher ↑
            </button>
            <button
              onClick={() => call("lower")}
              className="flex-1 bg-ink px-4 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
            >
              Lower ↓
            </button>
          </div>
        </>
      )}

      {i > 0 && (
        <ol className="flex flex-col gap-1.5" aria-label="Your calls" aria-live="polite">
          {state.calls.map((c, k) => {
            const ok = c === truth(p, k);
            const a = p.cards[k];
            const b = p.cards[k + 1];
            return (
              <li key={k} className="border-b border-rule-soft py-1.5 text-[13px]">
                <span className="mr-1.5">{ok ? "🟩" : "🟥"}</span>
                {a.itemName} {a.flag} <span className="font-mono">{usd(a.priceUSD)}</span> →{" "}
                {b.itemName} {b.flag} <span className="font-mono">{usd(b.priceUSD)}</span>
                <span className="text-ink-muted"> · you said {c}</span>
              </li>
            );
          })}
        </ol>
      )}

      {over && (
        <div className="flex flex-col gap-3">
          <p className="text-[16px] text-ink-body">
            You called <strong>{result(p, state)}</strong> right.
          </p>
          <ShareButton
            score={result(p, state)}
            text={(url) => shareText(p, state, url)}
            path="/games/higher-or-lower"
            campaign="game-higher-or-lower"
            event="chain_share"
          />
          <p className="text-[13px] text-ink-muted">
            A new chain at your local midnight. Want more now? Try the{" "}
            <a href="/higher-or-lower" className="underline">
              unlimited version
            </a>
            .
          </p>
          <NextUp current="higher-or-lower" />
        </div>
      )}

      <p className="text-[13px] leading-relaxed text-ink-muted">
        Prices are the same sourced figures as the daily Pricele puzzle, in U.S. dollars. Each pair
        is between 1.05 and 3 times apart, so every call can be reasoned out.
      </p>
    </div>
  );
}
