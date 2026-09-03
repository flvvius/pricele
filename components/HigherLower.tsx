"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  applyAnswer,
  drawPair,
  isCorrect,
  loadHL,
  saveHL,
  EMPTY_HL,
  type Card,
  type HigherLowerStats,
  type Pair,
} from "@/lib/higherlower";
import { formatPrice } from "@/lib/format";
import { loadCurrency, type Currency } from "@/lib/currency";
import { IconCheck, IconClose } from "./Icons";

type Phase = "asking" | "right" | "wrong";

interface Props {
  /**
   * The deck, already filtered on the server. Passing it in rather than building
   * it here is what lets the page server-render a real first round: the
   * suppression window depends on today's date, and a client-side filter would
   * mean the server had nothing to draw with.
   */
  deck: Card[];
  /** The opening pair, drawn on the server so the HTML is not a spinner. */
  initialPair: Pair;
}

function PriceCard({
  card,
  onPick,
  reveal,
  currency,
  disabled,
}: {
  card: Card;
  onPick: () => void;
  reveal: boolean;
  currency: Currency;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onPick}
      disabled={disabled}
      className="flex flex-1 flex-col items-center justify-center gap-2 border border-rule bg-paper-raised px-3 py-7 text-center transition-[border-color,background-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-sunk active:scale-[0.98] disabled:cursor-default disabled:hover:border-rule disabled:hover:bg-paper-raised"
    >
      <span className="display text-[1.25rem] leading-tight text-ink">
        {card.itemName}
      </span>
      <span className="text-[14px] text-ink-muted">
        <span aria-hidden>{card.flag}</span> {card.countryName}
      </span>
      {/* The price appears only after the answer, which is also what keeps it
          out of the server-rendered HTML. The height is reserved so revealing it
          does not shove the other card down the page. */}
      <span className="mt-1 flex h-7 items-center font-mono text-lg tabular-nums text-ink">
        {reveal ? formatPrice(card.priceUSD, currency) : ""}
      </span>
    </button>
  );
}

/**
 * The "one more go" mode, played on figures the site already publishes.
 *
 * Pairs cross items as well as countries, which is the trick that makes it hard:
 * "a Big Mac in Norway or a cappuccino in Japan" cannot be answered by knowing
 * which country is richer, because both are, so the answer turns on the items.
 */
export default function HigherLower({ deck, initialPair }: Props) {
  const [pair, setPair] = useState<Pair>(initialPair);
  const [phase, setPhase] = useState<Phase>("asking");
  const [stats, setStats] = useState<HigherLowerStats>(EMPTY_HL);
  const [currency, setCurrency] = useState<Currency>("USD");

  // Both of these live in localStorage, so they can only be read after mount.
  // The initial state matches what the server rendered, so there is no mismatch
  // to hydrate through: a fresh player genuinely is on zero and on dollars.
  useEffect(() => {
    setStats(loadHL());
    setCurrency(loadCurrency());
  }, []);

  const cards = useMemo(() => deck, [deck]);

  function answer(side: "left" | "right") {
    if (phase !== "asking") return;
    const correct = isCorrect(pair, side);
    const updated = applyAnswer(stats, correct);
    setStats(updated);
    saveHL(updated);
    setPhase(correct ? "right" : "wrong");
  }

  function advance() {
    const key = (c: Card) => `${c.itemId}:${c.countryName}`;
    const next = drawPair(cards, new Set([key(pair.left), key(pair.right)]));
    if (next) setPair(next);
    setPhase("asking");
  }

  const answered = phase !== "asking";

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

      <p className="text-center text-[15px] leading-relaxed text-ink-body">
        Which of these costs more?
      </p>

      <div className="flex items-stretch gap-3">
        <PriceCard
          card={pair.left}
          onPick={() => answer("left")}
          reveal={answered}
          currency={currency}
          disabled={answered}
        />
        <PriceCard
          card={pair.right}
          onPick={() => answer("right")}
          reveal={answered}
          currency={currency}
          disabled={answered}
        />
      </div>

      {answered && (
        <div className="animate-set-in flex flex-col gap-4">
          <p
            className="flex items-center justify-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.16em]"
            style={{
              color:
                phase === "right" ? "rgb(var(--win))" : "rgb(var(--accent))",
            }}
          >
            {phase === "right" ? <IconCheck size={14} /> : <IconClose size={14} />}
            {phase === "right"
              ? `Correct · ${stats.current} in a row`
              : stats.best > 0
                ? `Wrong. Your best run is ${stats.best}.`
                : "Wrong. Back to zero."}
          </p>

          <button
            onClick={advance}
            className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
          >
            Next pair
          </button>
        </div>
      )}

      <p className="text-center text-[13px] leading-relaxed text-ink-meta">
        This is a side game. It never touches your daily streak.{" "}
        <Link href="/" className="underline underline-offset-2 hover:text-ink-body">
          Today&apos;s puzzle
        </Link>
        .
      </p>
    </div>
  );
}
