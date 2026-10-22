"use client";

import { useEffect, useState } from "react";
import { RENT_AREAS } from "@/data/rent-ratio";
import {
  isCorrect,
  isOver,
  loadState,
  saveState,
  puzzleFor,
  score,
  shareText,
  twoBed,
  FY,
  ROUNDS,
  type RentArea,
  type RentState,
} from "@/lib/rentratio";
import { isoDate } from "@/lib/puzzle";
import { SITE_URL } from "@/lib/seo";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function Citation({ area }: { area: RentArea }) {
  return (
    <>
      {area.hudArea} ({area.code})
    </>
  );
}

export default function RentRatio() {
  // Date is read after mount so the puzzle follows the player's local midnight.
  const [date, setDate] = useState<string | null>(null);
  const [state, setState] = useState<RentState | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = isoDate();
    setDate(d);
    setState(loadState(d));
  }, []);

  if (!date || !state) return <p className="text-ink-muted">Loading today&apos;s puzzle…</p>;

  const p = puzzleFor(date, RENT_AREAS);
  const over = isOver(state);
  const current = p.rounds[state.picks.length];

  function pick(k: "a" | "b") {
    if (!state || over) return;
    const next = { ...state, picks: [...state.picks, k] };
    setState(next);
    saveState(next);
  }

  async function share() {
    const text = shareText(p, state!.picks, `${SITE_URL}/games/rent-ratio`);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* clipboard blocked */
    }
  }

  const btn =
    "flex-1 border border-rule border-t-2 border-t-ink bg-paper-raised px-4 py-5 text-center transition-colors hover:bg-paper";

  return (
    <div className="flex max-w-xl flex-col gap-5">
      {!over && current && (
        <figure className="flex flex-col gap-3">
          <figcaption className="label text-center">
            Rent Ratio #{p.number} · Round {state.picks.length + 1} of {ROUNDS}
          </figcaption>
          <p className="display text-center text-[1.5rem] leading-tight text-ink">
            Which has the higher HUD fair market rent for a two-bedroom?
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button className={btn} onClick={() => pick("a")}>
              <span className="display text-[1.35rem] text-ink">{current.a.name}</span>
            </button>
            <span className="self-center font-mono text-[12px] uppercase text-ink-muted">or</span>
            <button className={btn} onClick={() => pick("b")}>
              <span className="display text-[1.35rem] text-ink">{current.b.name}</span>
            </button>
          </div>
        </figure>
      )}

      <ol className="flex flex-col gap-2">
        {state.picks.map((k, i) => {
          const r = p.rounds[i];
          const ok = isCorrect(r, k);
          const chosen = k === "a" ? r.a : r.b;
          return (
            <li key={i} className="border-b border-rule-soft py-2 text-[14px]">
              <div className="flex justify-between gap-3 font-mono">
                <span>
                  {ok ? "🟩" : "🟥"} {r.a.name} {usd(twoBed(r.a))}
                </span>
                <span className="text-right">
                  {r.b.name} {usd(twoBed(r.b))}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-ink-muted">
                You picked {chosen.name}. Source: HUD {FY} fair market rent, 2-bedroom, monthly;{" "}
                <Citation area={r.a} />; <Citation area={r.b} />.
              </p>
            </li>
          );
        })}
      </ol>

      {over && (
        <div className="flex flex-col gap-3">
          <p className="text-[16px] text-ink-body">
            You got <strong>{score(p, state.picks)} of {ROUNDS}</strong>.
          </p>
          <button
            onClick={share}
            className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised"
          >
            {copied ? "Copied" : "Share result"}
          </button>
          <p className="text-[13px] text-ink-muted">New matchups at your local midnight.</p>
        </div>
      )}

      <p className="text-[13px] leading-relaxed text-ink-muted">
        Source: U.S. Department of Housing and Urban Development,{" "}
        <a className="underline" href="https://www.huduser.gov/portal/datasets/fmr.html" rel="noopener">
          {FY} Fair Market Rents
        </a>
        . A fair market rent is HUD&apos;s benchmark for housing vouchers: gross rent (rent plus
        essential utilities) for a modest unit, set near the 40th percentile of what recent movers
        paid. It is not the median or asking rent. Names are short labels for HUD&apos;s FMR areas.
      </p>
    </div>
  );
}
