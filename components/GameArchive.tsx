"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GAMES } from "@/lib/games";
import { EPOCH } from "@/lib/openrange";
import { pastDates } from "@/lib/gamedate";
import { formatArchiveDate } from "@/lib/format";
import { isPublishedAnswerDate } from "@/lib/answers";

const ARCHIVED = [
  ...GAMES.filter((g) => g.slug !== "pricele").map((g) => ({ name: g.name, href: g.href })),
  { name: "Pricele 1000", href: "/games/pricele-1000" },
];

export default function GameArchive() {
  const [dates, setDates] = useState<string[] | null>(null);

  useEffect(() => setDates(pastDates(EPOCH)), []);

  if (!dates) return <p className="text-ink-muted">Loading past days…</p>;
  if (dates.length === 0) {
    return (
      <p className="text-ink-muted">
        The first past day appears here after your local midnight. Until then, play{" "}
        <Link href="/today" className="underline underline-offset-2">
          today&apos;s set
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="border-t border-rule" data-testid="game-archive">
      {dates.map((d) => (
        <li key={d} className="flex flex-col gap-1.5 border-b border-rule-soft px-1 py-3">
          <span className="text-base font-medium text-ink-strong">{formatArchiveDate(d)}</span>
          <span className="flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
            {ARCHIVED.map((g) => (
              <Link
                key={g.href}
                href={`${g.href}?d=${d}`}
                className="underline decoration-rule underline-offset-2 hover:text-ink"
              >
                {g.name}
              </Link>
            ))}
            {isPublishedAnswerDate(d) && (
              <Link
                href={`/games/answers/${d}`}
                className="text-ink-muted underline decoration-rule underline-offset-2 hover:text-ink"
              >
                Answers
              </Link>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
