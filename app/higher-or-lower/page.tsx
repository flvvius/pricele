import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import HigherLower from "@/components/HigherLower";
import { pageMetadata } from "@/lib/seo";
import { PRICES } from "@/lib/puzzle";
import { suppressedPairs } from "@/lib/catalog";
import { getItem, itemLabel } from "@/data/items";
import { drawPair, toCard, MIN_RATIO, MAX_RATIO } from "@/lib/higherlower";

export const metadata: Metadata = pageMetadata({
  path: "/higher-or-lower",
  title: "Higher or Lower",
  description:
    "Two prices, one question: which costs more? A Big Mac in Norway or a cappuccino in Japan? Chain a run for as long as you can, on the same sourced figures as the daily puzzle.",
});

/**
 * Rebuilt hourly, and it has to be rebuilt on a clock rather than at deploy time.
 *
 * Which pairs this page may deal depends on today's date, because the three
 * inside the suppression window are excluded. A page frozen at build time would
 * keep offering yesterday's exclusions and, within a day, start offering the
 * pair that is currently live. An hour of staleness against a three-day window
 * is not close to a problem; a static build against it is.
 *
 * The alternative was drawing the pair on the client, and that costs the page its
 * content: a crawler would get a heading, two paragraphs and a spinner. The whole
 * site is server-rendered on purpose and a new indexable route does not get to be
 * the exception.
 */
export const revalidate = 3600;

export default function HigherOrLowerPage() {
  const hidden = suppressedPairs();
  const deck = PRICES.filter(
    (p) => p.priceUSD > 0 && !hidden.has(`${p.itemId}:${p.countryCode}`)
  )
    .map((p) => {
      const item = getItem(p.itemId);
      return item ? toCard(p, itemLabel(item)) : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const initialPair = drawPair(deck);

  return (
    <ContentPage
      title="Higher or lower"
      intro={
        <p>
          Two prices at a time, from anywhere in the table. Pick the dearer one
          and keep going until you get one wrong. Unlimited, unlike the daily,
          and it counts for nothing except a run you can beat.
        </p>
      }
    >
      {initialPair ? (
        <HigherLower deck={deck} initialPair={initialPair} />
      ) : (
        <p className="text-[16px] leading-relaxed text-ink-body">
          No pair is playable right now, which means the table has shrunk below
          what this mode needs. That is a data problem rather than a temporary
          one.
        </p>
      )}

      <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
        <p>
          Pairs cross items as well as countries, which is what makes them hard.
          Knowing that Norway is expensive and Vietnam is cheap answers nothing
          when the question is a Big Mac in one against a cappuccino in the
          other: both halves move, and the item is usually the half that decides
          it.
        </p>
        <p>
          Two prices are only offered together when one is between {MIN_RATIO}{" "}
          and {MAX_RATIO} times the other. Closer than that and nobody could
          know. Further apart and the stereotype answers it for you, which is the
          opposite of what this game is for.
        </p>
        <p>
          Today&apos;s puzzle never appears here, and neither do the days either
          side of it. Every figure on this page is one the{" "}
          <a href="/prices" className="underline underline-offset-2 hover:text-ink">
            country pages
          </a>{" "}
          already publish, with the source behind it.
        </p>
      </div>
    </ContentPage>
  );
}
