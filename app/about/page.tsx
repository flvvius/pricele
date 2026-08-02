import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import { SITE_NAME, SITE_EMAIL } from "@/lib/seo";
import { ITEMS } from "@/data/items";
import { COUNTRIES } from "@/lib/catalog";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Pricele is, how the daily price puzzle works, where the price data comes from, and who makes it.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ContentPage
      title={`About ${SITE_NAME}`}
      intro={
        <p>
          A free daily guessing game about what everyday things cost around the
          world — and a small reference site for the price data behind it.
        </p>
      }
    >
      <Section heading="What it is">
        <Prose>
          <p>
            {SITE_NAME} is a quick, free browser game you play once a day. Each
            day you get one country and one everyday item, and you try to guess
            what it costs in US dollars. You get five tries, with
            higher-or-lower hints after each guess, and you win if you land
            within 5% of the real price. Both the item and the country change at
            midnight your local time.
          </p>
          <p>
            If you like Wordle or Globle, this is the same kind of thing: a short
            daily puzzle and a streak you&apos;ll want to keep going. When
            you&apos;re done you can share your result as a spoiler-free grid of
            squares.
          </p>
          <p>
            There are {ITEMS.length} items in rotation across {COUNTRIES.length}{" "}
            countries. The item and the country advance on separate cycles, so
            the same pairing only comes back around about twice a year.
          </p>
        </Prose>
      </Section>

      <Section heading="Why it exists">
        <Prose>
          <p>
            Most people have a decent sense of what things cost where they live
            and almost none for anywhere else. That gap is genuinely interesting:
            the same can of Coke, the same litre of petrol, the same cup of
            coffee can differ five-fold between two countries, and the reasons
            are rarely the obvious ones. A litre of petrol is mostly tax policy.
            A cappuccino is mostly rent. A kilo of apples is mostly climate and
            freight.
          </p>
          <p>
            The game is the hook, but the reference pages are the point. Every
            price has{" "}
            <Link href="/items" className="underline hover:text-neutral-300">
              its own page
            </Link>{" "}
            ranking every country, and every country has{" "}
            <Link href="/prices" className="underline hover:text-neutral-300">
              a page
            </Link>{" "}
            showing what a basket of ordinary things costs there — in dollars, in
            local currency, and in how long the average local wage takes to earn
            it. That last measure often reverses the ranking entirely.
          </p>
        </Prose>
      </Section>

      <Section heading="Where the prices come from">
        <Prose>
          <p>
            Big Mac prices come from The Economist&apos;s Big Mac Index, which
            has collected local-currency burger prices across dozens of economies
            since 1986. Cappuccino, milk, egg, apple and petrol prices come from
            Numbeo&apos;s crowd-sourced country price rankings. Coca-Cola prices
            are a curated table compiled from published cost-of-living figures.
          </p>
          <p>
            Every price on the site displays its own source and collection month.
            The{" "}
            <Link
              href="/methodology"
              className="underline hover:text-neutral-300"
            >
              methodology page
            </Link>{" "}
            goes through each source in detail and is candid about where the data
            is weak — particularly the wage estimates, which are the roughest
            numbers here, and fast-moving currencies like the Argentine peso,
            where any single conversion is contestable.
          </p>
          <p>
            These are national averages published for general interest. Real
            prices vary by city, shop, brand and season. Nothing here is shopping
            or financial advice.
          </p>
        </Prose>
      </Section>

      <Section heading="Privacy and how it's paid for">
        <Prose>
          <p>
            There is no account, no sign-in and no tracking of who you are. Your
            results, statistics and streak are stored in your own browser and
            never uploaded — clearing your browser data clears them.
          </p>
          <p>
            The site is free and carries advertising, which is shown after a
            puzzle is finished rather than during play. The{" "}
            <Link href="/privacy" className="underline hover:text-neutral-300">
              privacy policy
            </Link>{" "}
            covers what advertising partners may collect.
          </p>
        </Prose>
      </Section>

      <Section heading="Who makes it">
        <Prose>
          <p>
            {SITE_NAME} is an independent side project, built and maintained by
            one person. If you have a question, spot a price that looks wrong, or
            want to suggest an item or country to add, email{" "}
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="underline hover:text-neutral-300"
            >
              {SITE_EMAIL}
            </a>{" "}
            or use the{" "}
            <Link href="/contact" className="underline hover:text-neutral-300">
              contact page
            </Link>
            . Corrections are genuinely welcome — if you live somewhere covered
            here and a number looks off, you know better than the dataset does.
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
