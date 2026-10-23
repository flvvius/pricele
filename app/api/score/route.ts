import { NextResponse } from "next/server";
import { dbEnabled, readHubScores, writeHubScore } from "@/lib/db";
import { rankedScore, standing } from "@/lib/hubscore";

export const dynamic = "force-dynamic";

const text = (v: unknown) => (typeof v === "string" ? v : "");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PLAYER_ID = /^[a-z0-9]{8,64}$/;

function utcIsoDate(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function dateInWindow(date: string): boolean {
  return [-1, 0, 1].some((i) => utcIsoDate(i) === date);
}

export async function POST(request: Request) {
  if (!dbEnabled()) return NextResponse.json({ enabled: false });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const game = text(body.game);
  const date = text(body.date);
  const playerId = text(body.playerId);
  if (!ISO_DATE.test(date) || !dateInWindow(date) || !PLAYER_ID.test(playerId)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const score = rankedScore(game, date, body.state);
  if (score === null) return NextResponse.json({ error: "not finished" }, { status: 400 });

  await writeHubScore({ date, game, playerId, score });
  const counts = await readHubScores(date, game);
  return NextResponse.json({
    enabled: true,
    standing: counts && counts.length > 0 ? standing(counts, score) : null,
  });
}
