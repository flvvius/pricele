"use client";

import { useCallback, useEffect, useState } from "react";
import { playerId } from "@/lib/crowd";
import { formatPrice } from "@/lib/format";
import type { Currency } from "@/lib/currency";
import type { BoardRow } from "@/lib/room";

interface BoardResponse {
  enabled: boolean;
  locked?: boolean;
  stale?: boolean;
  room: {
    code: string;
    label: string;
    playDate: string;
    played?: number;
    itemName?: string;
    countryName?: string;
    actualUSD?: number;
    rows?: BoardRow[];
    winner?: BoardRow | null;
    allOver?: boolean;
  } | null;
}

/**
 * The classroom board, on the reveal.
 *
 * Ranked by the One Bid rule: closest without going over. Everyone's opening bid
 * is their bid, they commit once and blind, and the board is the reveal. A room
 * where every single bid went over has no winner, which happens more often than
 * you would think on the expensive items and is the best teaching moment the
 * mode produces.
 *
 * Polls while the class is still bidding. Thirty students do not finish at the
 * same second, and a board that needed refreshing by hand would be projected
 * showing four names for the rest of the lesson.
 */
export default function RoomBoard({
  code,
  currency,
}: {
  code: string;
  currency: Currency;
}) {
  const [data, setData] = useState<BoardResponse | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/room/${code}?pid=${encodeURIComponent(playerId())}`
      );
      if (!res.ok) return;
      setData((await res.json()) as BoardResponse);
    } catch {
      /* the board is optional; the reveal stands without it */
    }
  }, [code]);

  useEffect(() => {
    load();
    // Twelve seconds is slow enough that a class of thirty costs a couple of
    // hundred requests over a lesson, and fast enough that a name appears while
    // the student is still looking at the screen.
    const id = window.setInterval(load, 12000);
    return () => window.clearInterval(id);
  }, [load]);

  if (!data?.enabled || !data.room || data.stale) return null;

  const room = data.room;

  if (data.locked) {
    return (
      <section className="border border-rule bg-paper-raised p-4">
        <p className="label">Room {room.code}</p>
        <p className="mt-2 text-[14px] text-ink-body">
          {room.played ?? 0} bid so far. The board opens for you once your own
          bid is in.
        </p>
      </section>
    );
  }

  const rows = room.rows ?? [];

  return (
    <section className="border border-rule border-t-2 border-t-ink bg-paper-raised p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="label">
          Room {room.code}
          {room.label ? ` · ${room.label}` : ""}
        </p>
        <p className="label">{rows.length} bids</p>
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
        Closest without going over wins.
      </p>

      <ol className="mt-3 flex flex-col border-t border-rule">
        {rows.map((row, i) => (
          <li
            key={`${row.name}-${i}`}
            className="flex items-center gap-3 border-b border-rule-soft py-2"
          >
            <span
              className="w-6 shrink-0 font-mono text-[12px] tabular-nums"
              style={{
                color: row.winner
                  ? "rgb(var(--win))"
                  : row.over
                    ? "rgb(var(--ink-faint))"
                    : "rgb(var(--ink-meta))",
              }}
            >
              {row.over ? "—" : row.place}
            </span>
            <span className="min-w-0 flex-1 truncate text-[15px] text-ink-body">
              {row.name}
            </span>
            <span className="font-mono text-[13px] tabular-nums text-ink">
              {formatPrice(row.bid_usd, currency)}
            </span>
            <span
              className="w-16 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{
                color: row.winner
                  ? "rgb(var(--win))"
                  : row.over
                    ? "rgb(var(--accent))"
                    : "rgb(var(--ink-faint))",
              }}
            >
              {row.winner ? "Winner" : row.over ? "Over" : ""}
            </span>
          </li>
        ))}
      </ol>

      {room.allOver && (
        <p className="mt-3 border-l-2 border-accent bg-accent/[0.06] py-2 pl-3 text-[14px] leading-relaxed text-ink-body">
          Every bid in the room went over. Nobody wins the round, which is itself
          the lesson: the whole class assumed this cost more than it does.
        </p>
      )}
    </section>
  );
}
