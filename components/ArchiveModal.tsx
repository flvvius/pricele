"use client";

import Modal from "./Modal";
import { getDailyPuzzle, dateFromISO, pastPuzzleDates } from "@/lib/puzzle";
import { loadDayState } from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";

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
    <Modal open={open} onClose={onClose} title="Archive">
      <p className="mb-3 text-sm text-neutral-400">
        Replay past days. Archive games don&apos;t affect your streak.
      </p>

      {dates.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-500">
          No past puzzles yet — come back tomorrow.
        </p>
      ) : (
        <ul className="flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto">
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
                  className="flex w-full items-center justify-between rounded-lg border border-neutral-800 bg-neutral-800/60 px-3 py-2.5 text-left transition hover:border-neutral-600 hover:bg-neutral-800"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden>
                      {puzzle.price.flag}
                    </span>
                    <span>
                      <span className="font-medium">
                        {puzzle.price.countryName}
                      </span>
                      <span className="ml-2 text-xs text-neutral-500">
                        #{puzzle.puzzleNumber}
                      </span>
                    </span>
                  </span>
                  {played ? (
                    <span
                      className={`text-sm font-semibold ${
                        st.won ? "text-green-400" : "text-neutral-500"
                      }`}
                    >
                      {st.won ? `✓ ${st.guesses.length}/${MAX_GUESSES}` : "✗ X"}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-neutral-300">
                      Play ▸
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
