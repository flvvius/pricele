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
 * competing edges on screen and made the figures — the only thing a player
 * actually reads — fight for attention with the containers holding them. A
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
      className="animate-set-in relative flex min-h-[2.75rem] flex-1 items-center gap-3 overflow-hidden border-b border-rule-soft px-3"
      style={
        {
          "--warm": `var(--warm-${tier.level})`,
          "--fill": fill,
        } as React.CSSProperties
      }
    >
      <span className="wash absolute inset-0" aria-hidden />

      <span className="relative font-mono text-[10px] tabular-nums text-ink-faint">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="relative shrink-0 font-mono text-base font-medium tabular-nums text-ink">
        {formatPrice(guess.value, currency)}
      </span>

      <span className="relative ml-auto flex min-w-0 items-center gap-2.5">
        <Thermometer level={tier.level} />
        {/* Set in ink, not in the ramp colour. The mid-ramp ochre is around
            2.3:1 against paper, which is unreadable at 10px — the gauge beside
            it and the wash behind it already carry the colour, and neither of
            them is text.

            sr-only rather than hidden below xs: the warmth is otherwise carried
            only by the aria-hidden gauge and the background wash, so `hidden`
            left a screen reader on a small phone with no way to know how close
            the guess was. */}
        <span className="sr-only font-mono text-[10px] uppercase tracking-[0.14em] text-ink-body xs:not-sr-only xs:inline">
          {tier.label}
        </span>
        <span
          className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-ink-muted"
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

  // overflow-y-auto is a safety valve for extremely short viewports (a small
  // phone with the keyboard up): rows shrink to their minimum first, and only if
  // they still cannot fit does the board scroll internally, so a row can never
  // end up overlapping the input.
  return (
    <ul
      className="flex min-h-0 flex-1 flex-col justify-start overflow-y-auto border-t border-rule"
      aria-label="Your guesses"
    >
      {guesses.map((g, i) => (
        <Row key={i} guess={g} index={i} currency={currency} />
      ))}
      {Array.from({ length: empties }, (_, i) => (
        <li
          key={`empty-${i}`}
          className="flex min-h-[2.75rem] flex-1 items-center gap-3 border-b border-rule-soft px-3"
        >
          <span className="font-mono text-[10px] tabular-nums text-ink-faint/60">
            {String(guesses.length + i + 1).padStart(2, "0")}
          </span>
        </li>
      ))}
    </ul>
  );
}
