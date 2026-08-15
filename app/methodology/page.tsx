import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import { ITEMS } from "@/data/items";
import { COUNTRIES } from "@/lib/catalog";
import { pricesForItem } from "@/lib/catalog";
import { SITE_EMAIL, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/methodology",
  title: "Methodology",
  description:
    "Where every price on Pricele comes from, how local currencies and work-time figures are calculated, and the specific ways these numbers can be wrong.",
});

export default function MethodologyPage() {
  return (
    <ContentPage
      title="Methodology"
      intro={
        <>
          <p>
            Pricele is a game, but the numbers in it are real, and this page
            explains exactly where each one comes from. It also sets out the
            places the data is weakest, because a price comparison that only
            lists its strengths isn&apos;t worth much.
          </p>
          <p>
            Short version: Big Mac prices are published by The Economist.
            Grocery, café and fuel prices come from Numbeo&apos;s crowd-sourced
            country rankings. Wage figures are our own estimates and are the
            least reliable numbers on the site.
          </p>
        </>
      }
    >
      <Section heading="Sources, item by item">
        <div className="flex flex-col gap-4">
          {ITEMS.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"
            >
              <h3 className="text-sm font-bold text-neutral-100">
                <Link
                  href={`/items/${item.slug}`}
                  className="underline-offset-2 hover:underline"
                >
                  {item.name}
                </Link>
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                {pricesForItem(item.id).length} countries · quoted per{" "}
                {item.unit}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {item.sourceNote}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section heading="The Big Mac Index">
        <Prose>
          <p>
            The Economist has published its Big Mac Index since 1986 as an
            accessible test of purchasing-power parity. It collects local-currency
            prices from McDonald&apos;s corporate and franchisee sources across
            more than 50 economies and publishes the raw data openly. Pricele
            uses the January 2026 edition.
          </p>
          <p>
            The index has one well-known limitation that applies directly here:
            the burger is not identical everywhere. India&apos;s entry is a
            Maharaja Mac, because McDonald&apos;s does not sell beef there. The
            Economist also publishes a single euro-area price rather than one per
            member state, so Germany, France, Spain, Italy, Ireland, the
            Netherlands and Portugal all show the same figure on this site,
            labelled as the euro-area price. Real Big Mac prices do differ
            between those countries.
          </p>
          <p>
            The dataset is available at{" "}
            <a
              href="https://github.com/TheEconomist/big-mac-data"
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="underline hover:text-neutral-300"
            >
              github.com/TheEconomist/big-mac-data
            </a>
            .
          </p>
        </Prose>
      </Section>

      <Section heading="Numbeo price rankings">
        <Prose>
          <p>
            Cappuccino, milk, eggs, apples and petrol prices come from{" "}
            <a
              href="https://www.numbeo.com/cost-of-living/"
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="underline hover:text-neutral-300"
            >
              Numbeo
            </a>
            , which aggregates prices contributed by users around the world and
            publishes national averages. Figures here were retrieved in August
            2026 and are national averages in US dollars.
          </p>
          <p>
            Crowd-sourced data has real weaknesses. Contributions skew towards
            large cities and towards people who use the internet in English, so
            a national average can lean urban and middle-class. Sample sizes vary
            a lot between countries: a figure for Switzerland rests on far more
            submissions than one for Egypt. Numbeo filters outliers, but a
            country with few contributors will always be noisier than one with
            many.
          </p>
        </Prose>
      </Section>

      <Section heading="Currency conversion">
        <Prose>
          <p>
            Big Mac prices are published in local currency, and the US-dollar
            figure is The Economist&apos;s own conversion at the exchange rate on
            its collection date. Everything else works the other way: Numbeo
            publishes in US dollars, and the local-currency figure shown here is
            converted at the exchange rate on the day the data was collected.
          </p>
          <p>
            This means local-currency prices for the five Numbeo items are
            derived, not observed. For most currencies that distinction is
            invisible. For fast-moving currencies like the Argentine peso, the
            Turkish lira and the Egyptian pound, it matters, and a figure can drift
            noticeably from what a shopper actually pays within weeks. Argentina
            is the extreme case, because official and parallel exchange rates
            have historically differed enough that any single conversion is
            contestable.
          </p>
        </Prose>
      </Section>

      <Section heading="Work-time figures">
        <Prose>
          <p>
            Every price page shows roughly how long someone earning the average
            local wage works to buy one unit. That figure divides the dollar
            price by an estimated average hourly wage for the country.
          </p>
          <p>
            <strong className="font-semibold text-neutral-300">
              These wage estimates are the least rigorous numbers on the site.
            </strong>{" "}
            They are our own approximations, not drawn from a single official
            series, and they compress an enormous amount of variation: formal
            versus informal employment, regional differences, and the gap between
            mean and median earnings, which is very wide in some of these
            countries. Treat work-time figures as illustrative of the general
            shape of affordability, not as a measurement. We round them hard for
            exactly that reason, and we would rather replace them with an
            official series such as the ILO&apos;s than keep estimating.
          </p>
        </Prose>
      </Section>

      <Section heading="Consumption tax" id="tax">
        <Prose>
          <p>
            Each country page states that country&apos;s standard VAT, GST or
            consumption tax rate, and how ordinary groceries are treated under
            it. Consumption tax is the largest single wedge between what two
            countries charge for a physically identical item, and it is the one
            component of a price that is set deliberately rather than emerging
            from a market, so it is worth reading separately from the price
            itself.
          </p>
          <p>
            <strong className="font-semibold text-neutral-300">
              Standard rates come from PwC&apos;s Worldwide Tax Summaries VAT
              quick chart.
            </strong>{" "}
            That is one source for all {COUNTRIES.length} countries, used
            deliberately: rates assembled from {COUNTRIES.length} different
            national pages would be internally inconsistent in exactly the way
            that makes cross-country comparison meaningless. Reduced,
            super-reduced and zero rates for European countries are cross-checked
            against the Tax Foundation&apos;s annual VAT rates in Europe table.
          </p>
          <p>
            The grocery treatment matters more here than the headline rate does,
            because six of the {ITEMS.length} items are food or drink. A country
            can charge 23% on most things and nothing at all on bread, as Ireland
            does, so quoting only its standard rate would actively mislead you
            about its food prices.
          </p>
          <p>
            Two honest limits. First, where a country&apos;s food treatment could
            not be confirmed from either source, the field is left empty rather
            than filled in from memory; a missing line means we could not verify
            it, not that no relief exists. Second, three countries genuinely
            cannot be reduced to one number: Brazil overlaps federal, state and
            municipal levies, the United States has no VAT and leaves sales tax
            to states and municipalities, and India and China both band their
            rates by category. Those are described in words instead, and their
            rows should be read as national approximations.
          </p>
          <p>
            A rate is not a full explanation of a price. Switzerland charges 2.6%
            on food and is still the most expensive country in this table; the
            United States has no VAT at all and sits mid-range. Tax tells you
            what the state adds. Wages, distance, tariffs, subsidies and what a
            country grows for itself do the rest, which is what the note at the
            top of each country page is for.
          </p>
        </Prose>
      </Section>

      <Section heading="What a single national price cannot capture">
        <Prose>
          <p>
            Every figure here is one number standing in for a whole country. That
            is a large simplification. Prices differ between a capital city and a
            rural town, between a supermarket and a corner shop, between seasons,
            and between brands. Eggs in particular swing hard with avian
            influenza outbreaks; fuel changes weekly; fresh produce is seasonal.
          </p>
          <p>
            If a price here doesn&apos;t match what you paid this morning, the
            most likely explanation is that both numbers are correct and they are
            measuring different things. Pricele is published for general interest
            and as the basis for a game. It is not shopping advice, financial
            advice, or a substitute for an official statistical series.
          </p>
        </Prose>
      </Section>

      {/* The `license` of the Dataset schema on every /prices and /items page
          points at this section, so it has to state terms rather than gesture
          at them. */}
      <Section heading="Reuse and licensing" id="reuse">
        <Prose>
          <p>
            The price tables here are a compilation of third-party data, so the
            underlying numbers are not ours to place under an open licence. The
            Big Mac figures remain The Economist&apos;s and are governed by the
            terms on its{" "}
            <a
              href="https://github.com/TheEconomist/big-mac-data"
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="underline hover:text-neutral-300"
            >
              published dataset
            </a>
            ; the cappuccino, milk, egg, apple and petrol figures remain
            Numbeo&apos;s and are governed by{" "}
            <a
              href="https://www.numbeo.com/common/terms_of_use.jsp"
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="underline hover:text-neutral-300"
            >
              Numbeo&apos;s terms of use
            </a>
            .
          </p>
          <p>
            What is ours is the compilation itself: the country and item
            selection, the local-currency and work-time calculations, the wage
            estimates and the writing. You may quote individual figures or a
            small extract of a table for editorial, educational or
            non-commercial use, with attribution to Pricele and a link to the
            page you took it from. Republishing a table wholesale, or any
            commercial use, needs permission from the original source rather
            than from us.
          </p>
          <p>
            For anything this doesn&apos;t cover, email{" "}
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="underline hover:text-neutral-300"
            >
              {SITE_EMAIL}
            </a>{" "}
            and ask.
          </p>
        </Prose>
      </Section>

      <Section heading="Corrections">
        <Prose>
          <p>
            If you live somewhere in the {COUNTRIES.length} countries covered here
            and a price looks clearly wrong, we would rather hear about it than
            not. Email{" "}
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="underline hover:text-neutral-300"
            >
              {SITE_EMAIL}
            </a>{" "}
            with the item, the country and what you actually see locally.
            Corrections are applied to the dataset and take effect across the
            game and every reference page at once.
          </p>
          <p>
            Data on this site is refreshed periodically rather than live. The
            source and collection month is printed next to every price, so you
            can always see how old a figure is.
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
