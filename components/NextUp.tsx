"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nextGame, readStatuses, syncHub, type DailyGame } from "@/lib/games";

/**
 * Shown in a game's finished state: the next unfinished daily game, or the
 * hub when the whole set is done. Also logs today into the hub streak.
 */
export default function NextUp({ current }: { current: string }) {
  const [next, setNext] = useState<DailyGame | null | undefined>(undefined);

  useEffect(() => {
    syncHub();
    setNext(nextGame(current, readStatuses()));
  }, [current]);

  if (next === undefined) return null;
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] uppercase tracking-[0.14em]">
      {next && (
        <Link href={next.href} className="text-accent underline-offset-4 hover:underline">
          Next: {next.name} →
        </Link>
      )}
      <Link href="/today" className="text-ink-muted underline-offset-4 hover:text-ink hover:underline">
        {next ? "Today's set" : "Set complete: today's set →"}
      </Link>
      {!next && (
        <Link
          href="/games/archive"
          className="text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Past days →
        </Link>
      )}
    </p>
  );
}
