"use client";

import { useEffect, useState } from "react";
import { playerId } from "@/lib/crowd";
import { standingLine, type Standing } from "@/lib/hubscore";

export default function ScoreRank({
  game,
  name,
  date,
  state,
  archived,
}: {
  game: string;
  name: string;
  date: string;
  state: unknown;
  archived: boolean;
}) {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    if (archived) return;
    const pid = playerId();
    if (!pid) return;
    let live = true;
    fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game, date, state, playerId: pid }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { standing?: Standing | null } | null) => {
        if (live) setLine(standingLine(d?.standing ?? null, name));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, date, archived]);

  if (!line) return null;
  return (
    <p className="border-l-2 border-accent pl-3 text-[15px] text-ink" aria-live="polite">
      {line}
    </p>
  );
}
