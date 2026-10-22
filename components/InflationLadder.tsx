"use client";

import { useEffect, useState } from "react";
import { THEN_NOW_ITEMS } from "@/data/then-and-now";
import {
  isOver,
  isSolved,
  loadState,
  markOrder,
  moveRung,
  percent,
  puzzleFor,
  result,
  saveState,
  shareText,
  MAX_TRIES,
  type LadderState,
} from "@/lib/inflationladder";
import { isoDate } from "@/lib/puzzle";
import { trackEvent } from "@/lib/analytics";
import NextUp from "./NextUp";
import ShareButton from "./ShareButton";

const usd = (n: number) => `$${n.toFixed(2)}`;

function startingOrder(ids: string[], answer: string[]): string[] {
  return ids.join() === answer.join() ? [...ids].reverse() : ids;
}

export default function InflationLadder() {
  const [date, setDate] = useState<string | null>(null);
  const [state, setState] = useState<LadderState | null>(null);
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    const d = isoDate();
    const s = loadState(d);
    const p = puzzleFor(d, THEN_NOW_ITEMS);
    setDate(d);
    setState(s);
    setOrder(s.tries.at(-1) ?? startingOrder(p.rungs.map((r) => r.item.id), p.answer));
  }, []);

  if (!date || !state) return <p className="text-ink-muted">Loading today&apos;s puzzle…</p>;

  const p = puzzleFor(date, THEN_NOW_ITEMS);
  const over = isOver(state, p.answer);
  const solved = state.tries.some((t) => isSolved(t, p.answer));
  const byId = new Map(p.rungs.map((r) => [r.item.id, r]));
  const lastMarks = state.tries.length ? markOrder(state.tries.at(-1)!, p.answer) : null;
  const shown = over ? p.answer : order;

  function submit() {
    if (!state || over) return;
    const next = { ...state, tries: [...state.tries, order] };
    setState(next);
    saveState(next);
    if (isOver(next, p.answer)) {
      setOrder(p.answer);
      trackEvent("ladder_complete", { result: result(next, p.answer) });
    }
  }

  const unchangedSinceLastTry = state.tries.at(-1)?.join() === order.join();

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <p className="label text-center">
        Inflation Ladder #{p.number} · {p.baseYear} → {p.latestYear}
      </p>
      <p className="display text-center text-[1.5rem] leading-tight text-ink">
        Biggest price rise at the top, smallest at the bottom.
      </p>

      <ol className="flex flex-col gap-2" aria-label="Your order">
        {shown.map((id, i) => {
          const r = byId.get(id)!;
          const mark = !over && lastMarks && unchangedSinceLastTry ? lastMarks[i] : null;
          return (
            <li
              key={id}
              data-testid={`rung-${i}`}
              className={`flex items-center gap-3 border border-t-2 bg-paper-raised px-3 py-3 ${
                over || mark === "right" ? "border-rule border-t-accent" : "border-rule border-t-ink"
              }`}
            >
              <span className="w-5 shrink-0 font-mono text-[13px] text-ink-muted">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] text-ink">{r.item.name}</p>
                {over && (
                  <p className="font-mono text-[12px] text-ink-muted">
                    {usd(r.from)} → {usd(r.to)} · <strong className="text-ink">{percent(r.change)}</strong>
                  </p>
                )}
                {mark && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                    {mark === "right" ? "🟩 Right rung" : "⬜ Wrong rung"}
                  </p>
                )}
              </div>
              {!over && (
                <div className="flex shrink-0 gap-1">
                  <button
                    aria-label={`Move ${r.item.name} up`}
                    disabled={i === 0}
                    onClick={() => setOrder(moveRung(order, i, i - 1))}
                    className="h-10 w-10 border border-rule font-mono text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    aria-label={`Move ${r.item.name} down`}
                    disabled={i === shown.length - 1}
                    onClick={() => setOrder(moveRung(order, i, i + 1))}
                    className="h-10 w-10 border border-rule font-mono text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {over ? (
        <div className="flex flex-col gap-3">
          <p className="text-[16px] text-ink-body">
            {solved
              ? `Solved in ${result(state, p.answer).split("/")[0]}.`
              : "Out of tries. That's the real order above."}{" "}
            Prices are U.S. city averages in nominal dollars.
          </p>
          <ShareButton
            score={result(state, p.answer)}
            text={(url) => shareText(p, state, url)}
            path="/games/inflation-ladder"
            campaign="game-inflation-ladder"
            event="ladder_share"
          />
          <p className="text-[13px] text-ink-muted">A new ladder at your local midnight.</p>
          <NextUp current="inflation-ladder" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={submit}
            disabled={unchangedSinceLastTry}
            className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised disabled:opacity-40"
          >
            Lock in order
          </button>
          <p className="text-center text-[13px] text-ink-muted">
            {MAX_TRIES - state.tries.length} {MAX_TRIES - state.tries.length === 1 ? "try" : "tries"} left.
            {unchangedSinceLastTry ? " Move something before trying again." : ""}
          </p>
        </div>
      )}

      <p className="text-[13px] leading-relaxed text-ink-muted">
        Source: U.S. Bureau of Labor Statistics, Average Price Data, U.S. city average. Each year&apos;s
        figure is the mean of its monthly averages. Not adjusted for inflation.
      </p>
    </div>
  );
}
