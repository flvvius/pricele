"use client";

import { useEffect, useRef } from "react";
import { tierFromCloseness, WARMTH_LEVELS } from "@/lib/scoring";
import type { GuessRecord } from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";
import { formatPrice } from "@/lib/format";
import type { Currency } from "@/lib/currency";
import { IconCheck, IconDown, IconUp } from "./Icons";

// Phrased around the real price, not the guess, so it is unambiguous: "the real
// price is higher than what you typed" rather than the confusing bare "Higher".
const HINT: Record<GuessRecord["direction"], { label: string; Icon: typeof IconUp }> = {
  too_high: { label: "Lower", Icon: IconDown },
  too_low: { label: "Higher", Icon: IconUp },
  exact: { label: "Exact", Icon: IconCheck },
};

/**
 * Five slots, ruled like a ledger rather than drawn as five separate cards.
 *
 * The old board was five rounded boxes with their own borders, which put ten
 * competing edges on screen and made the figures, the only thing a player
 * actually reads, fight for attention with the containers holding them. A
 * single hairline between rows says the same thing and disappears while saying
 * it.
 *
 * Both the label and the fill use the coarse warmth tier, never an exact
 * percentage: a precise figure would let a player invert the scoring formula
 * and win on their second guess.
 */
function Row({
  guess,
  index,
  currency,
}: {
  guess: GuessRecord;
  index: number;
  currency: Currency;
}) {
  const tier = tierFromCloseness(guess.closeness);
  const { label, Icon } = HINT[guess.direction];
  const fill = (tier.level + 1) / WARMTH_LEVELS;

  return (
    <li
      className="animate-set-in relative flex min-h-[2.75rem] flex-1 items-center gap-3 overflow-hidden border-b border-rule-soft px-3 lg:min-h-[3.25rem]"
      style={
        {
          "--warm": `var(--warm-${tier.level})`,
          "--fill": fill,
        } as React.CSSProperties
      }
    >
      <span className="wash absolute inset-0" aria-hidden />

      <span className="relative font-mono text-[11px] tabular-nums text-ink-meta">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="relative shrink-0 font-mono text-lg font-medium tabular-nums text-ink">
        {formatPrice(guess.value, currency)}
      </span>

      <span className="relative ml-auto flex min-w-0 items-center gap-2.5">
        <Thermometer level={tier.level} />
        {/* Set in ink, not in the ramp colour. The mid-ramp ochre is around
            2.3:1 against paper, which is unreadable at 10px. The gauge beside
            it and the wash behind it already carry the colour, and neither of
            them is text.

            sr-only rather than hidden below xs: the warmth is otherwise carried
            only by the aria-hidden gauge and the background wash, so `hidden`
            left a screen reader on a small phone with no way to know how close
            the guess was. */}
        <span className="sr-only font-mono text-[11px] uppercase tracking-[0.14em] text-ink-body xs:not-sr-only xs:inline">
          {tier.label}
        </span>
        <span
          className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-ink-muted"
          style={
            guess.direction === "exact" ? { color: "rgb(var(--win))" } : undefined
          }
        >
          <Icon size={13} />
          {label}
        </span>
      </span>
    </li>
  );
}

/** Five ticks, filled to the tier. Reads as a gauge at a glance and as a
    redundant encoding of the colour for anyone who cannot separate the ramp. */
function Thermometer({ level }: { level: number }) {
  return (
    <span className="flex shrink-0 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: WARMTH_LEVELS }, (_, i) => (
        <span
          key={i}
          className="h-3 w-[3px]"
          style={{
            backgroundColor:
              i <= level ? `rgb(var(--warm-${level}))` : "rgb(var(--rule))",
          }}
        />
      ))}
    </span>
  );
}

export default function GuessHistory({
  guesses,
  currency,
}: {
  guesses: GuessRecord[];
  currency: Currency;
}) {
  const empties = Math.max(0, MAX_GUESSES - guesses.length);
  const board = useRef<HTMLUListElement>(null);

  // When the board is too short for every row, the rows it drops have to be the
  // oldest ones. Left alone a scroll container shows its top, which on a phone
  // with the keyboard up means the board renders the one bid the player has
  // already stopped thinking about and hides the one they just made.
  useEffect(() => {
    const el = board.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [guesses.length]);

  // Two safety valves, in the order they should be spent.
  //
  // The empty slots go first. They are the ledger's five-slot look and nothing
  // more — no figure on them, nothing to read — so on a cramped screen they drop
  // their minimum height and close up, which buys a played row its full height
  // at no cost to anything the player is actually reading. Played rows keep
  // their minimum and never compress. See `.cramped .board-slot` in globals.css;
  // it is keyed off the cramped screen rather than off a breakpoint because the
  // slots have to keep their height wherever the board sizes to its content,
  // which is a question about height, not width.
  //
  // overflow-y-auto is the second valve, for when the played rows alone will not
  // fit: the board scrolls internally rather than growing, so a row can never
  // end up overlapping the input. The min-height is what stops the board being
  // squeezed out of existence before either valve gets a chance to act.
  return (
    <ul
      ref={board}
      className="flex min-h-[2.75rem] flex-1 flex-col justify-start overflow-y-auto border-t border-rule lg:overflow-y-visible"
      aria-label="Your guesses"
    >
      {guesses.map((g, i) => (
        <Row key={i} guess={g} index={i} currency={currency} />
      ))}
      {Array.from({ length: empties }, (_, i) => (
        <li
          key={`empty-${i}`}
          aria-hidden
          className="board-slot flex min-h-[2.75rem] flex-1 items-center gap-3 overflow-hidden border-b border-rule-soft px-3 lg:min-h-[3.25rem]"
        >
          <span
            data-n={String(guesses.length + i + 1).padStart(2, "0")}
            className="font-mono text-[11px] tabular-nums text-ink-faint/60 before:content-[attr(data-n)]"
          />
        </li>
      ))}
    </ul>
  );
}
