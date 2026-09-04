import type { Metadata } from "next";
import Link from "next/link";
import Game from "@/components/Game";
import FaqSection from "@/components/FaqSection";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { HOME_FAQ } from "@/lib/faq";
import { faqJsonLd, howToPlayJsonLd, pageMetadata } from "@/lib/seo";
import { ITEMS } from "@/data/items";
import { COUNTRIES, pricesForItem, medianPriceUSD } from "@/lib/catalog";
import { formatUSD } from "@/lib/format";

// Statically generated (SSG): this renders to real HTML at build time for SEO,
// then <Game/> hydrates and takes over client-side. The prose and FAQ below are
// server-rendered so crawlers and AI answer engines read them without running JS.
export const dynamic = "force-static";

// The home page declares its own canonical like every other page. It used to
// rely on the one set in the layout, which is exactly what made that layout
// canonical leak onto routes it was never meant to describe.
export const metadata: Metadata = pageMetadata({ path: "/" });

export default function Home() {
  return (
    // max-w-md is the phone column and stays the phone column. A tablet opens to
    // the same measure the reference pages use rather than sitting at phone
    // width with half the screen empty, and from lg up the page opens again to
    // a broadsheet measure where each section sets as a standing head beside
    // its copy. See the `lg:grid` rails below.
    <main className="mx-auto flex max-w-md flex-col gap-10 px-4 pb-6 md:max-w-2xl lg:max-w-4xl">
      {/* On a phone the game occupies exactly the first screen; the prose below
          is for readers and crawlers and sits deliberately below the fold. */}
      <Game />

      <section
        aria-labelledby="about-heading"
        className="flex flex-col gap-3 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12"
      >
        <h2
          id="about-heading"
          className="display text-[2rem] text-ink"
        >
          A new price puzzle every day
        </h2>
        {/* Wrapper, not bare siblings: under the lg grid every child becomes a
            cell, and the copy has to stay one. Below lg it inherits the same
            gap-3 the section had, so the phone stack is unchanged. */}
        <div className="flex flex-col gap-3">
          <p className="text-[16px] leading-[1.7] text-ink-body">
            Pricele is a free daily game about what things cost around the world.
            Every day you get one country and one everyday item: a Big Mac in
            Norway, a cappuccino in Japan, a litre of petrol in Egypt. You try
            to guess the price in US dollars. You get five guesses, with
            higher-or-lower hints along the way, and you win if you land within 5%
            of the real price. Both the item and the country change at midnight
            your time, so there&apos;s always a fresh one waiting when you wake up.
          </p>
          <p className="text-[16px] leading-[1.7] text-ink-body">
            If you play Wordle or Globle, it&apos;s the same kind of thing: a quick
            puzzle you do once a day, plus a streak you&apos;ll want to keep going.
            The difference is that the answer is a real number, since every price comes
            from a published source, and the reveal tells you where that country
            sits against the rest of the world.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="items-heading"
        className="flex flex-col gap-3 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12"
      >
        <h2 id="items-heading" className="display text-[2rem] text-ink">
          What&apos;s in the game
        </h2>
        <p className="text-[16px] leading-[1.7] text-ink-body">
          {ITEMS.length} items, priced across {COUNTRIES.length} countries. Each
          item has its own page ranking every country from cheapest to most
          expensive.
        </p>
        {/* The index runs the full measure and sets in two columns on a desk,
            since seventeen one-line rows down a narrow column is a lot of
            scrolling. */}
        <ul className="border-t border-rule lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-x-10">
          {ITEMS.map((item) => (
            <li key={item.id}>
              <Link
                href={`/items/${item.slug}`}
                className="flex items-center justify-between gap-3 border-b border-rule-soft px-1 py-2.5 transition-[background-color] duration-fast ease-out hover:bg-paper-raised lg:h-full"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 border border-rule bg-paper-raised object-contain p-0.5"
                  />
                  <span className="truncate text-[15px] text-ink-body">
                    {item.name}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[12px] tabular-nums text-ink-meta">
                  median {formatUSD(medianPriceUSD(item.id))}
                  <span className="ml-1.5 text-ink-faint">
                    · {pricesForItem(item.id).length}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {/* Auto-flow would drop this back into the rail column after the
            full-width index above; keep it under the copy where it belongs. */}
        <p className="text-[16px] leading-[1.7] text-ink-body lg:col-start-2">
          Or browse{" "}
          <Link href="/prices" className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink">
            prices by country
          </Link>
          , read the{" "}
          <Link href="/methodology" className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink">
            methodology
          </Link>
          , or replay past rounds in the{" "}
          <Link href="/archive" className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink">
            archive
          </Link>
          .
        </p>
      </section>

      <FaqSection items={HOME_FAQ} />

      <SiteFooter />

      {/* The rules as a procedure, alongside the FAQ. "How do you play
          Pricele" was answerable from this page in prose and in an FAQ answer,
          but never as typed steps; HowTo is what makes it extractable as one. */}
      <JsonLd data={[faqJsonLd(HOME_FAQ), howToPlayJsonLd()]} />
    </main>
  );
}
