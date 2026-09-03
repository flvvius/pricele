// Create a classroom room. One POST, one code back.
//
// Deliberately the smallest endpoint that could work. There is no owner token,
// no teacher account and no way to delete a room from the UI, because every one
// of those would be a reason for a teacher to have to sign up for something
// during a lesson. A room is a code and a date, it holds one day of bids, and
// the housekeeping query in db/schema.sql sweeps it inside a month.

import { NextResponse } from "next/server";
import { createRoom, dbEnabled } from "@/lib/db";
import { cleanName } from "@/lib/room";

export const dynamic = "force-dynamic";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function utcIsoDate(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  if (!dbEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 200 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // The room is pinned to a date so a board cannot mix two days of bids. A
  // teacher creating a room a minute before their own local midnight gets the
  // date they are on, which is why the client sends one and it is bounds-checked
  // rather than taken from the server clock outright.
  const requested = String(body.date ?? "");
  const date =
    ISO_DATE.test(requested) &&
    [-1, 0, 1].some((i) => requested === utcIsoDate(i))
      ? requested
      : utcIsoDate();

  const label = cleanName(String(body.label ?? ""));
  const code = await createRoom(date, label);

  if (!code) {
    return NextResponse.json(
      { error: "could not create a room" },
      { status: 503 }
    );
  }
  return NextResponse.json({ enabled: true, code, date, label });
}
