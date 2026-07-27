import { BAND_EMOJI, tierFromCloseness, WARMTH_LEVELS } from "@/lib/scoring";
import type { GuessRecord } from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";
import { formatMoney } from "@/lib/format";

// Phrased around the real price, not the guess, so it's unambiguous: "the real
// price is higher than what you typed" rather than the confusing bare "Higher".
const HINT: Record<GuessRecord["direction"], { label: string }> = {
  too_high: { label: "↓ Real price is lower" },
  too_low: { label: "↑ Real price is higher" },
  exact: { label: "✓ Exact" },
};

const FILL: Record<GuessRecord["band"], string> = {
  green: "#16a34a",
  yellow: "#d9a400",
  black: "#6b7280",
};

// One compact row per guess. Warmth is the row's background fill rather than a
// separate bar underneath, so the whole five-row board fits above the keyboard
// without scrolling. Rows flex to share whatever height is available.
//
// Both the label and the fill use the coarse warmth tier, never an exact
// percentage: a precise figure would let a player invert the scoring formula
// and win on their second guess.
function Row({ guess }: { guess: GuessRecord }) {
  const tier = tierFromCloseness(guess.closeness);
  const fillPct = ((tier.level + 1) / WARMTH_LEVELS) * 100;
  return (
    <li className="animate-pop relative min-h-[24px] max-h-[80px] flex-1 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
      <div
        className="absolute inset-y-0 left-0 opacity-25 transition-all duration-500"
        style={{ width: `${fillPct}%`, backgroundColor: FILL[guess.band] }}
        aria-hidden
      />
      <div className="relative flex h-full items-center justify-between gap-2 px-3">
        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {formatMoney(guess.value, "USD")}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`truncate text-xs ${
              guess.direction === "too_high"
                ? "text-sky-300"
                : guess.direction === "too_low"
                  ? "text-orange-300"
                  : "text-green-300"
            }`}
          >
            {HINT[guess.direction].label}
          </span>
          <span className="shrink-0 text-xs font-semibold text-neutral-300">
            {tier.label}
          </span>
          <span className="shrink-0 text-sm" aria-hidden>
            {BAND_EMOJI[guess.band]}
          </span>
        </span>
      </div>
    </li>
  );
}

export default function GuessHistory({ guesses }: { guesses: GuessRecord[] }) {
  const empties = Math.max(0, MAX_GUESSES - guesses.length);

  // overflow-y-auto is a safety valve for extremely short viewports (a small
  // phone with the keyboard up): rows shrink to their minimum first, and only if
  // they still cannot fit does the board scroll internally, so a row can never
  // end up overlapping the input.
  return (
    <ul
      className="flex min-h-0 flex-1 flex-col justify-start gap-1.5 overflow-y-auto"
      aria-label="Your guesses"
    >
      {guesses.map((g, i) => (
        <Row key={i} guess={g} />
      ))}
      {Array.from({ length: empties }, (_, i) => (
        <li
          key={`empty-${i}`}
          className="flex min-h-[24px] max-h-[80px] flex-1 items-center justify-center rounded-lg border border-dashed border-neutral-800 text-neutral-700"
        >
          <span aria-hidden>·</span>
        </li>
      ))}
    </ul>
  );
}
