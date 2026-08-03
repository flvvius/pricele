import Modal from "./Modal";
import Countdown from "./Countdown";
import type { Stats } from "@/lib/storage";

interface Props {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  /** If the player won today, the guess count of that win, to highlight its bar. */
  highlightGuess?: number;
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-1">
      <span className="display text-3xl tabular-nums text-ink">{value}</span>
      <span className="text-center font-mono text-[9px] uppercase leading-tight tracking-[0.12em] text-ink-meta">
        {label}
      </span>
    </div>
  );
}

export default function StatsPanel({
  open,
  onClose,
  stats,
  highlightGuess,
}: Props) {
  const winPct = stats.played
    ? Math.round((stats.wins / stats.played) * 100)
    : 0;
  const maxCount = Math.max(1, ...stats.distribution);

  return (
    <Modal open={open} onClose={onClose} title="Statistics">
      <div className="flex flex-col gap-7">
        {/* Hairline gutters instead of gaps: four figures in a row are a table,
            and a table has rules between its columns. */}
        <div className="grid grid-cols-4 divide-x divide-rule border-y border-rule py-4">
          <Stat value={stats.played} label="Played" />
          <Stat value={`${winPct}%`} label="Win rate" />
          <Stat value={stats.currentStreak} label="Streak" />
          <Stat value={stats.maxStreak} label="Best" />
        </div>

        <div>
          <h3 className="label rule-label mb-3">Guess distribution</h3>
          {stats.wins === 0 ? (
            <p className="text-[13px] text-ink-meta">
              Win a round to start your distribution.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.distribution.map((count, i) => {
                const isHighlight = highlightGuess === i + 1;
                const pct = count === 0 ? 0 : (count / maxCount) * 100;
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-3 font-mono text-[11px] tabular-nums text-ink-meta">
                      {i + 1}
                    </span>
                    {/* The track is always full width so the bars share a
                        baseline and can actually be compared to each other. */}
                    <div className="h-5 flex-1 bg-paper-sunk">
                      <div
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isHighlight
                            ? "rgb(var(--win))"
                            : "rgb(var(--ink-faint))",
                        }}
                      />
                    </div>
                    <span
                      className="w-5 text-right font-mono text-[11px] tabular-nums"
                      style={{
                        color: isHighlight
                          ? "rgb(var(--win))"
                          : "rgb(var(--ink-muted))",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-rule pt-4">
          <span className="label">Next edition</span>
          <Countdown />
        </div>
      </div>
    </Modal>
  );
}
