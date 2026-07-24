import { BAND_EMOJI } from "@/lib/scoring";
import type { GuessRecord } from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";

const DIRECTION_LABEL: Record<GuessRecord["direction"], string> = {
  too_high: "Too high",
  too_low: "Too low",
  exact: "Exact!",
};

export default function GuessHistory({ guesses }: { guesses: GuessRecord[] }) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => guesses[i]);

  return (
    <ul className="flex flex-col gap-2" aria-label="Your guesses">
      {rows.map((g, i) => (
        <li
          key={i}
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-lg ${
            g ? "border-neutral-700 bg-neutral-800" : "border-neutral-800 bg-neutral-900/50"
          }`}
        >
          {g ? (
            <>
              <span className="tabular-nums font-medium">
                ${g.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className="flex items-center gap-2 text-sm text-neutral-300">
                {g.direction !== "exact" && <span>{DIRECTION_LABEL[g.direction]}</span>}
                <span className="text-xl" aria-hidden>
                  {BAND_EMOJI[g.band]}
                </span>
              </span>
            </>
          ) : (
            <span className="text-neutral-600">—</span>
          )}
        </li>
      ))}
    </ul>
  );
}
