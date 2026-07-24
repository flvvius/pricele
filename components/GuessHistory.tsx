import { BAND_EMOJI } from "@/lib/scoring";
import type { GuessRecord } from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";

const HINT: Record<GuessRecord["direction"], { label: string }> = {
  too_high: { label: "▼ Lower" },
  too_low: { label: "▲ Higher" },
  exact: { label: "Exact" },
};

const FILL: Record<GuessRecord["band"], string> = {
  green: "#16a34a",
  yellow: "#d9a400",
  black: "#6b7280",
};

function Row({ guess }: { guess: GuessRecord }) {
  const pct = Math.round(guess.closeness * 100);
  return (
    <li className="animate-pop rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="tabular-nums font-semibold">
          ${guess.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-700"
        role="img"
        aria-label={`${pct}% warm`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: FILL[guess.band] }}
        />
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
