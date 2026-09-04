import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import WhereInTheWorld from "@/components/WhereInTheWorld";
import { pageMetadata } from "@/lib/seo";
import { PRICES } from "@/lib/puzzle";
import { suppressedPairs } from "@/lib/catalog";
import { roundFor, MAX_ATTEMPTS, type Round } from "@/lib/whereintheworld";

export const metadata: Metadata = pageMetadata({
  path: "/where-in-the-world",
  title: "Where in the World",
  description:
    "The daily puzzle backwards: here is the item and here is the price, name the country. Five guesses, a new clue after each miss, on the same sourced figures.",
});

/** Same hourly rebuild, and for the same reason as /higher-or-lower. */
export const revalidate = 3600;

/** How many rounds to ship. Enough for a long sitting, small enough to send. */
const ROUND_COUNT = 24;

/**
 * Pick the rounds on the server.
 *
 * Spread across items rather than drawn at random, because a random sample of
 * 617 rows is nearly half petrol and diesel, and a mode that asks the same
 * question twenty times is a mode nobody plays twice. Stepping through the deck
 * at a stride coprime with its length gives a spread with no bookkeeping.
 */
function pickRounds(): Round[] {
  const hidden = suppressedPairs();
  const deck = PRICES.filter(
    (p) => p.priceUSD > 0 && !hidden.has(`${p.itemId}:${p.countryCode}`)
  );
  if (deck.length === 0) return [];

  const start = Math.floor(Math.random() * deck.length);
  const stride = 37;
  const out: Round[] = [];
  const seen = new Set<string>();

  for (let i = 0; out.length < ROUND_COUNT && i < deck.length; i++) {
    const row = deck[(start + i * stride) % deck.length];
    const key = `${row.itemId}:${row.countryCode}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const round = roundFor(row);
    if (round) out.push(round);
  }
  return out;
}

export default function WhereInTheWorldPage() {
  const rounds = pickRounds();

  return (
    <ContentPage
      title="Where in the world"
      intro={
        <p>
          The daily puzzle turned around. You get the item and the price, and you
          name the country. {MAX_ATTEMPTS} guesses, with a fresh clue after each
          miss.
        </p>
      }
    >
      {rounds.length > 0 ? (
        <WhereInTheWorld rounds={rounds} />
      ) : (
        <p className="text-[16px] leading-relaxed text-ink-body">
          No rounds are playable right now, which means the table has shrunk
          below what this mode needs.
        </p>
      )}

      <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
        <p>
          Guessing a price is a shopping game. Being handed a price and asked
          where you are is a geography game, and it turns out to be the harder of
          the two: a litre of petrol at $1.40 could be half of Europe, and
          separating them means knowing which half taxes fuel and which half
          refines it.
        </p>
        <p>
          The country list for each round is only the countries that actually
          have a price for that item. Offering all of them when a third have no
          row would mean a third of the list was never the answer, which is a
          free hint to anyone who noticed.
        </p>
        <p>
          Today&apos;s puzzle never appears here, and neither do the days either
          side of it.
        </p>
      </div>
    </ContentPage>
  );
}
