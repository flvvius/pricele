// The crowd-stats endpoint. POST a finished round, GET the day's aggregates.
//
// One of only three routes on the site that are not statically rendered;
// everything else stays HTML a CDN can serve without waking anything up. If this
// route is slow or down the game is unaffected, because the client treats every
// crowd figure as optional.
//
// The client is not trusted with the answer. It sends its bids; the server looks
// up what the price actually was for that date from the same rotation the game
// is built on, and rejects anything claiming to be a pair that was not up that
// day. Without that, "players overestimate Japan by 36%" is only ever as true as
// the most bored person who found the endpoint.

import { NextResponse } from "next/server";
import { dateFromISO, getDailyPuzzle } from "@/lib/puzzle";
import { dbEnabled, readCrowd, writeCrowd, writeRoomEntry, isRoomCode } from "@/lib/db";
import { cleanName } from "@/lib/room";

export const dynamic = "force-dynamic";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const COUNTRY = /^[A-Z]{2}$/;
const ITEM = /^[a-z0-9-]{1,32}$/;

/** Plausible bids, in USD. Anything outside this never came from the UI. */
const MIN_USD = 0.0001;
const MAX_USD = 100000;

/**
 * How far a submitted date may sit from the server's own UTC date.
 *
 * The puzzle rolls over at each player's local midnight and the timezone map
 * runs from UTC-12 to UTC+14, so two players finishing the same puzzle at the
 * same moment can be on dates a day apart in either direction. One day of slack
 * covers all of it. More would let anyone write to arbitrary history.
 */
const DATE_SLACK_DAYS = 1;

function utcIsoDate(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function dateInWindow(date: string): boolean {
  for (let i = -DATE_SLACK_DAYS; i <= DATE_SLACK_DAYS; i++) {
    if (date === utcIsoDate(i)) return true;
  }
  return false;
}

/**
 * The real price for a pair on a date, or null when that pair was not the puzzle
 * that day.
 *
 * This is the check that makes the aggregates mean anything. It also quietly
 * closes the obvious hole in the read path: the endpoint will only ever discuss
 * a date/pair combination that was genuinely live, so it cannot be used as an
 * oracle for tomorrow's answer.
 */
function priceFor(date: string, itemId: string, country: string): number | null {
  const puzzle = getDailyPuzzle(dateFromISO(date));
  if (!puzzle) return null;
  if (puzzle.item.id !== itemId || puzzle.price.countryCode !== country) {
    return null;
  }
  return puzzle.price.priceUSD;
}

export async function GET(request: Request) {
  if (!dbEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 200 });
  }

  const params = new URL(request.url).searchParams;
  const date = params.get("date") ?? "";
  const itemId = params.get("item") ?? "";
  const country = params.get("country") ?? "";
  const bestOffRaw = params.get("bestOff");

  if (
    !ISO_DATE.test(date) ||
    !dateInWindow(date) ||
    !ITEM.test(itemId) ||
    !COUNTRY.test(country)
  ) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (priceFor(date, itemId, country) === null) {
    return NextResponse.json({ error: "not the puzzle" }, { status: 400 });
  }

  const bestOff = bestOffRaw === null ? undefined : Number(bestOffRaw);
  const stats = await readCrowd(
    date,
    itemId,
    country,
    bestOff !== undefined && Number.isFinite(bestOff) && bestOff >= 0
      ? bestOff
      : undefined
  );

  return NextResponse.json(
    { enabled: true, stats },
    // Ten seconds of shared cache. The numbers move constantly and nobody needs
    // them to the second, but a popular day would otherwise hit the database
    // once per reveal.
    { headers: { "Cache-Control": "public, s-maxage=10" } }
  );
}

export async function POST(request: Request) {
  if (!dbEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 200 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const date = String(body.date ?? "");
  const itemId = String(body.itemId ?? "");
  const country = String(body.country ?? "");
  const playerCountry = String(body.playerCountry ?? "");
  const playerId = String(body.playerId ?? "");
  const won = body.won === true;
  const firstGuessUSD = Number(body.firstGuessUSD);
  const bestPctOff = Number(body.bestPctOff);

  const valid =
    ISO_DATE.test(date) &&
    dateInWindow(date) &&
    ITEM.test(itemId) &&
    COUNTRY.test(country) &&
    (playerCountry === "" || COUNTRY.test(playerCountry)) &&
    /^[a-z0-9]{8,64}$/.test(playerId) &&
    Number.isFinite(firstGuessUSD) &&
    firstGuessUSD >= MIN_USD &&
    firstGuessUSD <= MAX_USD &&
    Number.isFinite(bestPctOff) &&
    bestPctOff >= 0;

  if (!valid) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const actualUSD = priceFor(date, itemId, country);
  if (actualUSD === null) {
    return NextResponse.json({ error: "not the puzzle" }, { status: 400 });
  }

  const counted = await writeCrowd({
    date,
    itemId,
    country,
    playerCountry,
    playerId,
    won,
    // Computed here, from the price the server looked up, rather than taken
    // from the body. The whole value of the Ego Gap is that this number is
    // not the client's to assert.
    firstLogError: Math.log(firstGuessUSD / actualUSD),
    firstOver: firstGuessUSD > actualUSD,
    bestPctOff: Math.min(bestPctOff, 100000),
  });

  // A player in a classroom posts to the board in the same request. It is a
  // separate table with separate rules, so a failure on one side leaves the
  // other intact.
  const roomCode = String(body.roomCode ?? "");
  if (isRoomCode(roomCode)) {
    await writeRoomEntry({
      code: roomCode,
      playerId,
      playDate: date,
      name: cleanName(String(body.roomName ?? "")) || "Anonymous",
      bidUSD: firstGuessUSD,
      bestPct: Math.round(Math.min(bestPctOff, 100000)),
      won,
      numGuesses: Math.min(Math.max(Number(body.numGuesses) || 0, 0), 5),
      score: Math.min(Math.max(Number(body.score) || 0, 0), 1000),
    });
  }

  // The reveal wants the numbers it just contributed to, so the write returns
  // the read. One round trip instead of two, on the screen where the player is
  // waiting to see something.
  const stats = await readCrowd(date, itemId, country, bestPctOff);
  return NextResponse.json({ enabled: true, counted, stats });
}
