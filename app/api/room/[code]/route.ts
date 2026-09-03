// Read one room's board.
//
// THE BOARD IS NOT PUBLIC, AND THIS IS THE ONLY PLACE THAT ENFORCES IT.
//
// A room's bids bracket the real price: the highest bid that came in under it is
// a lower bound, the lowest that went over is an upper bound, and with a class of
// thirty that bracket is tight enough to be the answer. So an open board endpoint
// would be a way to read today's price out of the game without playing it, for
// anybody holding a four-character code, and the code is by design something a
// teacher reads out to a room.
//
// The gate is simple: you get the board once you have bid, and not before. Every
// caller sends the same random browser id it uses everywhere else, the route
// checks it has an entry for this room today, and until it does the response
// carries a headcount and nothing else. The teacher plays first and then
// projects, which is what they were going to do anyway.
//
// A room whose date is not the live puzzle never resolves a price at all,
// because otherwise it would be a way around the archive's suppression rules.

import { NextResponse } from "next/server";
import { dateFromISO, getDailyPuzzle } from "@/lib/puzzle";
import { dbEnabled, hasRoomEntry, readRoom, isRoomCode } from "@/lib/db";
import { board } from "@/lib/room";

export const dynamic = "force-dynamic";

function utcIsoDate(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  if (!dbEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 200 });
  }

  const code = (params.code ?? "").toUpperCase();
  if (!isRoomCode(code)) {
    return NextResponse.json({ error: "bad code" }, { status: 400 });
  }

  const playerId = new URL(request.url).searchParams.get("pid") ?? "";
  const room = await readRoom(code);
  if (!room) {
    return NextResponse.json({ enabled: true, room: null }, { status: 404 });
  }

  const meta = { code: room.code, label: room.label, playDate: room.playDate };

  // A room more than a day either side of now is stale. Say so rather than
  // serving a board, and never resolve its price.
  const live = [-1, 0, 1].some((i) => room.playDate === utcIsoDate(i));
  if (!live) {
    return NextResponse.json({ enabled: true, stale: true, room: meta });
  }

  const unlocked =
    /^[a-z0-9]{8,64}$/.test(playerId) &&
    (await hasRoomEntry(code, room.playDate, playerId));

  // Locked: the headcount, so a projector can show the room filling up, and
  // nothing that could be worked back into a price.
  if (!unlocked) {
    return NextResponse.json(
      { enabled: true, locked: true, room: { ...meta, played: room.entries.length } },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const puzzle = getDailyPuzzle(dateFromISO(room.playDate));
  if (!puzzle) {
    return NextResponse.json({ error: "no puzzle" }, { status: 400 });
  }

  return NextResponse.json(
    {
      enabled: true,
      locked: false,
      room: {
        ...meta,
        itemName: puzzle.item.name,
        countryName: puzzle.price.countryName,
        flag: puzzle.price.flag,
        // Safe here and only here: the caller has finished the round, so this is
        // the same figure their own reveal screen is already showing them.
        actualUSD: puzzle.price.priceUSD,
        ...board(room.entries, puzzle.price.priceUSD),
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
