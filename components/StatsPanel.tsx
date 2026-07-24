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
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-center text-xs leading-tight text-neutral-400">
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
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-2">
          <Stat value={stats.played} label="Played" />
          <Stat value={`${winPct}%`} label="Win rate" />
          <Stat value={stats.currentStreak} label="Current streak" />
          <Stat value={stats.maxStreak} label="Max streak" />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-neutral-300">
            Guess distribution
          </h3>
          {stats.wins === 0 ? (
            <p className="text-sm text-neutral-500">
              Win a game to start your distribution.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {stats.distribution.map((count, i) => {
                const isHighlight = highlightGuess === i + 1;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-neutral-400">{i + 1}</span>
                    <div className="flex-1">
                      <div
                        className={`flex h-6 min-w-[1.5rem] items-center justify-end rounded px-2 font-medium tabular-nums transition-all ${
                          isHighlight
                            ? "bg-green-600 text-white"
                            : "bg-neutral-700 text-neutral-200"
                        }`}
                        style={{ width: `${Math.max(pct, count > 0 ? 12 : 8)}%` }}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-800 pt-4 text-sm">
          <span className="text-neutral-400">Next country in</span>
          <Countdown />
        </div>
      </div>
    </Modal>
  );
}
