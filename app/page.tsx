import Link from "next/link";
import Game from "@/components/Game";
import FaqSection from "@/components/FaqSection";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { HOME_FAQ } from "@/lib/faq";
import { faqJsonLd } from "@/lib/seo";
import { ITEMS } from "@/data/items";
import { COUNTRIES, pricesForItem, medianPriceUSD } from "@/lib/catalog";
import { formatUSD } from "@/lib/format";

// Statically generated (SSG): this renders to real HTML at build time for SEO,
// then <Game/> hydrates and takes over client-side. The prose and FAQ below are
// server-rendered so crawlers and AI answer engines read them without running JS.
export const dynamic = "force-static";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-10 px-4 pb-6">
      {/* The game occupies exactly the first screen; the prose below is for
          readers and crawlers and sits deliberately below the fold. */}
      <Game />

      <section aria-labelledby="about-heading" className="flex flex-col gap-3">
        <h2
          id="about-heading"
          className="text-lg font-bold text-neutral-100"
        >
          A new price puzzle every day
        </h2>
        <p className="text-sm leading-relaxed text-neutral-400">
          Pricele is a free daily game about what things cost around the world.
          Every day you get one country and one everyday item — a Big Mac in
          Norway, a cappuccino in Japan, a litre of petrol in Egypt — and you try
          to guess the price in US dollars. You get five guesses, with
          higher-or-lower hints along the way, and you win if you land within 5%
          of the real price. Both the item and the country change at midnight
          your time, so there&apos;s always a fresh one waiting when you wake up.
        </p>
        <p className="text-sm leading-relaxed text-neutral-400">
          If you play Wordle or Globle, it&apos;s the same kind of thing: a quick
          puzzle you do once a day, plus a streak you&apos;ll want to keep going.
          The difference is that the answer is a real number — every price comes
          from a published source, and the reveal tells you where that country
          sits against the rest of the world.
        </p>
      </section>

      <section aria-labelledby="items-heading" className="flex flex-col gap-3">
        <h2 id="items-heading" className="text-lg font-bold text-neutral-100">
          What&apos;s in the game
        </h2>
        <p className="text-sm leading-relaxed text-neutral-400">
          {ITEMS.length} items, priced across {COUNTRIES.length} countries. Each
          item has its own page ranking every country from cheapest to most
          expensive.
        </p>
        <ul className="flex flex-col gap-1.5">
          {ITEMS.map((item) => (
            <li key={item.id}>
              <Link
                href={`/items/${item.slug}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2.5 transition hover:border-neutral-600 hover:bg-neutral-800"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded bg-white object-contain p-0.5"
                  />
                  <span className="truncate text-sm text-neutral-200">
                    {item.name}
                  </span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-neutral-500">
                  median {formatUSD(medianPriceUSD(item.id))}
                  <span className="ml-1.5 text-neutral-600">
                    · {pricesForItem(item.id).length}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-neutral-400">
          Or browse{" "}
          <Link href="/prices" className="underline hover:text-neutral-300">
            prices by country
          </Link>
          , read the{" "}
          <Link href="/methodology" className="underline hover:text-neutral-300">
            methodology
          </Link>
          , or replay past rounds in the{" "}
          <Link href="/archive" className="underline hover:text-neutral-300">
            archive
          </Link>
          .
        </p>
      </section>

      <FaqSection items={HOME_FAQ} />

      <SiteFooter />

      <JsonLd data={faqJsonLd(HOME_FAQ)} />
    </main>
  );
}
