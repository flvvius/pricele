import type { Metadata } from "next";
import Link from "next/link";
import Game from "@/components/Game";
import FaqSection from "@/components/FaqSection";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import GameGrid from "@/components/GameGrid";
import { HOME_FAQ } from "@/lib/faq";
import { faqJsonLd, howToPlayJsonLd, pageMetadata } from "@/lib/seo";
import { ITEMS } from "@/data/items";
import { COUNTRIES, pricesForItem, medianPriceUSD } from "@/lib/catalog";
import { formatUSD } from "@/lib/format";
import { getDailyPuzzle } from "@/lib/puzzle";
import { COUNTRY_NOTES } from "@/data/countries";
import { PUBLISHED_ARTICLES } from "@/data/articles";

const SECTION =
  "flex flex-col gap-3 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12";
const H2 = "display text-[2rem] text-ink";
const COPY = "flex flex-col gap-3 text-[16px] leading-[1.7] text-ink-body";
const LINK =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

// Statically generated (SSG): this renders to real HTML at build time for SEO,
// then <Game/> hydrates and takes over client-side. The prose and FAQ below are
// server-rendered so crawlers and AI answer engines read them without running JS.
// Rebuilt hourly rather than once at build: the "Today's round" section names
// the current item and country, so a static build would go stale by morning.
export const revalidate = 3600;

// The home page declares its own canonical like every other page. It used to
// rely on the one set in the layout, which is exactly what made that layout
// canonical leak onto routes it was never meant to describe.
export const metadata: Metadata = pageMetadata({ path: "/" });

export default function Home() {
  // Server clock (UTC). Players east or west of UTC may be a day either side,
  // so the copy says "in most time zones". Nothing here gives the price away:
  // no figure, no rank, and no link to the pages that list it.
  const today = getDailyPuzzle();
  const todayCount = today ? pricesForItem(today.item.id).length : 0;
  const todayNote = today ? COUNTRY_NOTES[today.price.countryCode] : undefined;
  const guides = PUBLISHED_ARTICLES.slice(0, 5);
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
                    loading="lazy"
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
                  <span className="ml-1.5">
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
          , replay past rounds in the{" "}
          <Link href="/archive" className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink">
            archive
          </Link>
          , or look up U.S.{" "}
          <Link href="/history" className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink">
            price history since 1980
          </Link>
          .
        </p>
      </section>

      <section
        aria-labelledby="more-games-heading"
        className="flex flex-col gap-3 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12"
      >
        <h2 id="more-games-heading" className="display text-[2rem] text-ink">
          More daily games
        </h2>
        <div className="flex flex-col gap-3">
          <GameGrid exclude="pricele" />
          <p className="text-[14px] text-ink-muted">
            Track them all on{" "}
            <Link href="/today" className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink">
              Today
            </Link>{" "}
            with one streak, or see{" "}
            <Link href="/games" className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink">
              every game
            </Link>
            .
          </p>
        </div>
      </section>

      <section aria-labelledby="how-heading" className={SECTION}>
        <h2 id="how-heading" className={H2}>
          How to play
        </h2>
        <div className={COPY}>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>
              Read the item and the country at the top of the puzzle. Note the
              unit: a litre of milk, a pack of 20 cigarettes, 100 kWh of
              household electricity.
            </li>
            <li>
              Type your guess in US dollars and submit. Prices are converted from
              local currency at the exchange rate the source used.
            </li>
            <li>
              Each guess comes back with an arrow (the real price is higher or
              lower) and a colour: green means within 5%, yellow within 30%,
              grey further off.
            </li>
            <li>
              After your third miss a hint unlocks. It never gives a figure; it
              tells you why this country&apos;s price might be unusual, for
              example heavy excise tax, a fuel subsidy, or reliance on imports.
            </li>
            <li>
              You have five guesses. Win or lose, the reveal shows the real price,
              the local-currency figure, and how many minutes of the average local
              wage it takes to buy one.
            </li>
          </ol>
        </div>
      </section>

      <section aria-labelledby="scoring-heading" className={SECTION}>
        <h2 id="scoring-heading" className={H2}>
          How closeness is scored
        </h2>
        <div className={COPY}>
          <p>
            Pricele measures how far off you are as a ratio, not a dollar
            difference. Guessing twice the real price is exactly as wrong as
            guessing half of it. That keeps the game fair across items: being
            $1 out on a 40-cent egg is a huge miss, while being $1 out
            on a $60 bottle of spirits is nearly perfect.
          </p>
          <p>
            In practice this means the proximity meter fills on a logarithmic
            scale. A guess 5 times too high or too low (or worse) scores zero
            warmth; within 30% turns yellow; within 5% wins. A good strategy is to
            halve the gap each time: if $4 is too high and $1 too low, try $2
            rather than $2.50, because $2 sits in the middle on a ratio scale.
          </p>
        </div>
      </section>

      {today && (
        <section aria-labelledby="today-heading" className={SECTION}>
          <h2 id="today-heading" className={H2}>
            Today&apos;s round
          </h2>
          <div className={COPY}>
            <p>
              In most time zones puzzle #{today.puzzleNumber} asks about{" "}
              <strong>{today.item.name.toLowerCase()}</strong> ({today.item.unit})
              in <strong>{today.price.countryName}</strong> {today.price.flag}.
              This item is priced in {todayCount} countries in our data, so once
              you have played you can see where {today.price.countryName} lands
              in the full ranking.
            </p>
            <p>{today.item.blurb}</p>
            {todayNote && (
              <p>
                <span className="label mr-1">About the country.</span>
                {todayNote}
              </p>
            )}
            <p className="text-ink-meta">
              No spoilers here: the price, its rank and the country&apos;s price
              page stay hidden until you finish the puzzle.
            </p>
          </div>
        </section>
      )}

      <section aria-labelledby="sources-heading" className={SECTION}>
        <h2 id="sources-heading" className={H2}>
          Where the prices come from
        </h2>
        <div className={COPY}>
          <p>
            Every answer is a figure somebody published, with the source shown on
            the reveal and on each item page. Nothing is estimated by us or
            generated. The main sources are:
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>The Economist Big Mac Index, for burgers.</li>
            <li>
              GlobalPetrolPrices.com, for petrol, diesel, household electricity
              and natural gas.
            </li>
            <li>
              WHO Global Health Observatory tax surveys, for cigarettes, beer,
              spirits and e-liquid (most-sold brand in each country).
            </li>
            <li>
              World Bank Food Prices for Nutrition, for the daily cost of a
              healthy diet.
            </li>
            <li>Cable.co.uk&apos;s worldwide mobile data pricing study.</li>
            <li>
              Numbeo&apos;s crowd-sourced cost-of-living survey, for groceries,
              coffee and soft drinks, labelled as crowd-sourced wherever it
              appears.
            </li>
          </ul>
          <p>
            Wage comparisons use average earnings so the reveal can say how long
            the price takes to earn locally, which is often more telling than the
            dollar figure. The{" "}
            <Link href="/methodology" className={LINK}>
              methodology page
            </Link>{" "}
            explains conversions, dates and what we leave out, and the{" "}
            <Link href="/data" className={LINK}>
              data page
            </Link>{" "}
            lists every source in full.
          </p>
        </div>
      </section>

      <section aria-labelledby="more-heading" className={SECTION}>
        <h2 id="more-heading" className={H2}>
          Guides and other games
        </h2>
        <div className={COPY}>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>
              <Link href="/today" className={LINK}>
                Today
              </Link>
              : every daily game in one place, with one streak and one share line.
            </li>
            <li>
              <Link href="/games/then-and-now" className={LINK}>
                Then &amp; Now
              </Link>
              : guess what an everyday grocery cost in U.S. cities years ago, from
              Bureau of Labor Statistics data.
            </li>
            <li>
              <Link href="/games/rent-ratio" className={LINK}>
                Rent Ratio
              </Link>
              : five pairs of U.S. metros, pick the one with the higher HUD fair
              market rent.
            </li>
            <li>
              <Link href="/higher-or-lower" className={LINK}>
                Higher or Lower
              </Link>{" "}
              and{" "}
              <Link href="/where-in-the-world" className={LINK}>
                Where in the World
              </Link>{" "}
              for quicker rounds.
            </li>
          </ul>
          {guides.length > 0 && (
            <>
              <p>Guides from the blog:</p>
              <ul className="flex list-disc flex-col gap-1 pl-5">
                {guides.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/blog/${a.slug}`} className={LINK}>
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
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
