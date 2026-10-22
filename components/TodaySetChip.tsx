"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GAMES, readStatuses } from "@/lib/games";

export default function TodaySetChip() {
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    const st = readStatuses();
    setDone(GAMES.filter((g) => st[g.slug]?.phase === "done").length);
  }, []);

  return (
    <Link
      href="/today"
      data-testid="today-set-chip"
      className="label !text-accent underline-offset-[3px] hover:underline"
    >
      {done ? `${done}/${GAMES.length} games done` : `${GAMES.length} games today`} →
    </Link>
  );
}
