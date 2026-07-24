import { BAND_EMOJI } from "@/lib/scoring";
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

// A little temperature read for the warmth number, so each guess lands as its
// own mini-reward: the closer you are, the hotter the emoji.
function warmthEmoji(pct: number): string {
  if (pct >= 90) return "🔥";
  if (pct >= 70) return "♨️";
  if (pct >= 45) return "🌡️";
  if (pct >= 20) return "❄️";
  return "🧊";
}

function Row({ guess }: { guess: GuessRecord }) {
  const pct = Math.round(guess.closeness * 100);
  return (
    <li className="animate-pop rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="tabular-nums font-semibold">
          {formatMoney(guess.value, "USD")}
        </span>
        <span className="flex items-center gap-2 text-sm">
          <span
            className={
              guess.direction === "too_high"
                ? "text-sky-400"
                : guess.direction === "too_low"
                  ? "text-orange-400"
                  : "text-green-400"
            }
          >
            {HINT[guess.direction].label}
          </span>
          <span className="text-lg" aria-hidden>
            {BAND_EMOJI[guess.band]}
          </span>
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-700"
          role="img"
          aria-label={`${pct}% warm`}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: FILL[guess.band] }}
          />
        </div>
        <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-neutral-300">
          <span aria-hidden>{warmthEmoji(pct)}</span> {pct}%
        </span>
      </div>
    </li>
  );
}

export default function GuessHistory({ guesses }: { guesses: GuessRecord[] }) {
  const empties = Math.max(0, MAX_GUESSES - guesses.length);

  return (
    <ul className="flex flex-col gap-2" aria-label="Your guesses">
      {guesses.map((g, i) => (
        <Row key={i} guess={g} />
      ))}
      {Array.from({ length: empties }, (_, i) => (
        <li
          key={`empty-${i}`}
          className="flex h-[52px] items-center justify-center rounded-lg border border-dashed border-neutral-800 text-neutral-700"
        >
          <span aria-hidden>·</span>
        </li>
      ))}
    </ul>
  );
}
