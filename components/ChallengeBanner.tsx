"use client";

import { useEffect, useState } from "react";
import { decodeGameScore } from "@/lib/sharelink";

export default function ChallengeBanner({ game }: { game: string }) {
  const [score, setScore] = useState<string | null>(null);

  useEffect(() => {
    try {
      setScore(decodeGameScore(new URLSearchParams(window.location.search).get("c")));
    } catch {
      setScore(null);
    }
  }, []);

  if (!score) return null;
  const missed = score.startsWith("X");
  return (
    <p
      data-testid="challenge-banner"
      className="max-w-xl border-l-2 border-accent bg-accent/[0.07] py-2 pl-3 pr-2 text-[15px] text-ink"
    >
      {missed
        ? `A friend didn't crack their ${game} (${score}). Can you?`
        : `A friend scored ${score} on ${game}. Can you beat it?`}
    </p>
  );
}
