"use client";

import Modal from "./Modal";
import { getDailyPuzzle, dateFromISO, pastPuzzleDates } from "@/lib/puzzle";
import { loadDayState } from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";
import { IconCheck, IconClose } from "./Icons";

interface Props {
  open: boolean;
  onClose: () => void;
  today: string;
  onPlay: (date: string) => void;
}

export default function ArchiveModal({ open, onClose, today, onPlay }: Props) {
  // Only computed while open, and only on the client, so it always reflects
  // real "today" and the player's saved results.
  const dates = open ? pastPuzzleDates(dateFromISO(today)) : [];

  return (
    <Modal open={open} onClose={onClose} title="Back numbers">
      <p className="mb-4 text-[13px] leading-relaxed text-ink-muted">
        Replay a past edition. These are practice — they never touch your streak.
      </p>

      {dates.length === 0 ? (
        <p className="border-y border-rule py-8 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-meta">
          No back numbers yet
        </p>
      ) : (
        // A stack of rows, ruled rather than boxed — the same ledger the board
        // uses, so the archive reads as another page of the same paper.
        <ul className="max-h-[58dvh] overflow-y-auto border-t border-rule">
          {dates.map((date) => {
            const puzzle = getDailyPuzzle(dateFromISO(date));
            if (!puzzle) return null;
            const st = loadDayState(date);
            const played = st.done;
            return (
              <li key={date}>
                <button
                  onClick={() => {
                    onPlay(date);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 border-b border-rule-soft px-1 py-2.5 text-left transition-[background-color] duration-fast ease-out hover:bg-paper-sunk"
                >
                  <span className="font-mono text-[10px] tabular-nums text-ink-faint">
                    {String(puzzle.puzzleNumber).padStart(3, "0")}
                  </span>
                  {/* The item changes daily too, so the country alone no longer
                      identifies a past puzzle. */}
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink-body">
                    <span aria-hidden className="mr-1.5">
                      {puzzle.price.flag}
                    </span>
                    {puzzle.item.shortName} in {puzzle.price.countryName}
                  </span>
                  {played ? (
                    <span
                      className="flex shrink-0 items-center gap-1 font-mono text-[11px] tabular-nums"
                      style={{
                        color: st.won
                          ? "rgb(var(--win))"
                          : "rgb(var(--ink-faint))",
                      }}
                    >
                      {st.won ? <IconCheck size={12} /> : <IconClose size={12} />}
                      {st.won ? `${st.guesses.length}/${MAX_GUESSES}` : "—"}
                    </span>
                  ) : (
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                      Play
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
