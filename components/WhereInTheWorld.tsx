"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  applyRound,
  clueFor,
  loadWhere,
  saveWhere,
  EMPTY_WHERE,
  MAX_ATTEMPTS,
  type Round,
  type WhereStats,
} from "@/lib/whereintheworld";
import { formatPrice } from "@/lib/format";
import { loadCurrency, type Currency } from "@/lib/currency";
import { IconCheck, IconClose } from "./Icons";

interface Props {
  /** Rounds drawn on the server, so the page renders with a real question. */
  rounds: Round[];
}

/**
 * The inverse mode: here is the price, name the country.
 *
 * This is the mode that decides what kind of game Pricele is. Guessing a number
 * is a shopping game. Being shown $1.40 for a litre of petrol and working out
 * where you could be is a geography game, and geography is the genre that
 * travels. It is the same table read backwards, so it costs no new data.
 */
export default function WhereInTheWorld({ rounds }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [stats, setStats] = useState<WhereStats>(EMPTY_WHERE);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [scored, setScored] = useState(false);

  useEffect(() => {
    setStats(loadWhere());
    setCurrency(loadCurrency());
  }, []);

  const round = rounds[index % rounds.length];
  const solved = picked.includes(round.answer);
  const out = picked.length >= MAX_ATTEMPTS && !solved;
  const over = solved || out;
  const clue = clueFor(round, solved ? 0 : picked.length);

  function pick(code: string) {
    if (over || picked.includes(code)) return;
    const next = [...picked, code];
    setPicked(next);

    const done = code === round.answer || next.length >= MAX_ATTEMPTS;
    if (done && !scored) {
      setScored(true);
      const updated = applyRound(stats, code === round.answer);
      setStats(updated);
      saveWhere(updated);
    }
  }

  function nextRound() {
    setIndex((i) => (i + 1) % rounds.length);
    setPicked([]);
    setScored(false);
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div className="flex items-baseline justify-between border-y border-rule py-2.5">
        <span className="label">
          Run · <span className="text-ink">{stats.current}</span>
        </span>
        <span className="label">
          Best · <span className="text-ink">{stats.best}</span>
        </span>
      </div>

      <figure className="border border-rule border-t-2 border-t-ink bg-paper-raised px-5 py-5 text-center">
        <figcaption className="label">
          {round.itemName} · {round.unit}
        </figcaption>
        <p className="display mt-3 text-[3rem] leading-none text-ink">
          {formatPrice(round.priceUSD, currency)}
        </p>
        <p className="mt-3 text-[14px] text-ink-muted">
          {over ? "" : `Where? ${MAX_ATTEMPTS - picked.length} guesses left.`}
        </p>
      </figure>

      {clue && !over && (
        <p className="border-l-2 border-accent bg-accent/[0.06] py-2 pl-3 pr-2 text-[14px] leading-relaxed text-ink-body">
          <span className="label !text-accent">Clue</span>{" "}
          <span className="ml-1">{clue}</span>
        </p>
      )}

      {over ? (
        <div className="animate-set-in flex flex-col gap-4">
          <p
            className="flex items-center justify-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em]"
            style={{
              color: solved ? "rgb(var(--win))" : "rgb(var(--accent))",
            }}
          >
            {solved ? <IconCheck size={14} /> : <IconClose size={14} />}
            {solved
              ? `${round.answerFlag} ${round.answerName}, in ${picked.length}`
              : `It was ${round.answerFlag} ${round.answerName}`}
          </p>
          <button
            onClick={nextRound}
            className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
          >
            Next price
          </button>
        </div>
      ) : (
        // A wall of 40-odd buttons rather than a select, because the whole
        // pleasure of the mode is scanning the list and going "not that one".
        <ul className="flex flex-wrap gap-1.5">
          {round.options.map((o) => {
            const tried = picked.includes(o.code);
            return (
              <li key={o.code}>
                <button
                  onClick={() => pick(o.code)}
                  disabled={tried}
                  className={`border px-2 py-1.5 text-[13px] transition-[border-color,background-color,opacity] duration-fast ease-out ${
                    tried
                      ? "border-rule-soft text-ink-faint line-through opacity-50"
                      : "border-rule text-ink-body hover:border-ink hover:bg-paper-raised"
                  }`}
                >
                  <span aria-hidden>{o.flag}</span> {o.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-center text-[13px] leading-relaxed text-ink-meta">
        A side game. It never touches your daily streak.{" "}
        <Link href="/" className="underline underline-offset-2 hover:text-ink-body">
          Today&apos;s puzzle
        </Link>
        .
      </p>
    </div>
  );
}
