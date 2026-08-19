import type { Metadata } from "next";
import Link from "next/link";
import RelatedGuides, { GUIDES_FOR_COUNTRY } from "@/components/RelatedGuides";
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
            Grocery and café prices come from Numbeo&apos;s crowd-sourced country
            rankings. Fuel and household energy come from GlobalPetrolPrices.com.
            Tobacco, beer and spirits come from the World Health
            Organization&apos;s tax surveys, mobile data from Cable.co.uk, and the
            cost of a healthy diet from the World Bank and FAO. Wage figures are
            our own estimates and are the least reliable numbers on the site.
          </p>
          <p>
            Every price carries its source and its collection date on screen,
            because the sources are refreshed at wildly different intervals: fuel
            weekly, household energy quarterly, the tax surveys every two years.
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

      <Section heading="Fuel and household energy">
        <Prose>
          <p>
            Diesel, LPG, residential electricity and residential natural gas come
            from{" "}
            <a
              href="https://www.globalpetrolprices.com/"
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="underline hover:text-neutral-300"
            >
              GlobalPetrolPrices.com
            </a>
            , which assembles them from government sources, regulators, fuel
            retailers and national media. Road fuels update weekly; the two
            household utilities are collected quarterly and include the cost of
            the energy, the network and every tax and fee on the bill.
          </p>
          <p>
            The two utilities are published per kilowatt-hour, which lands
            between two and forty cents and rounds to something unguessable. They
            are shown here per 100 kWh instead, which is the same figure
            multiplied by a hundred and roughly a small flat&apos;s monthly draw.
            Nothing else in the game is rescaled.
          </p>
          <p>
            Coverage is uneven, and deliberately so. LPG appears only where it is
            sold as a road fuel at all, and natural gas only where households are
            on a gas grid. An absent row means the country does not have the
            thing, not that we could not find a number for it.
          </p>
        </Prose>
      </Section>

      <Section heading="WHO tax surveys: tobacco, beer and spirits">
        <Prose>
          <p>
            Cigarettes, vape e-liquid, beer and spirits come from the{" "}
            <a
              href="https://www.who.int/data/gho"
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="underline hover:text-neutral-300"
            >
              WHO Global Health Observatory
            </a>
            , specifically the 2024 rounds of its global tobacco and alcohol tax
            surveys. These are the most rigorously comparable numbers on the
            site: WHO collects the price of a named most-sold brand from
            supermarkets in each capital, standardises it to a fixed container —
            a pack of 20, 330ml of beer, a 750ml bottle of spirits, 1ml of
            e-liquid — and publishes it in local currency and in dollars at the
            official rate.
          </p>
          <p>
            Two things to know when reading them. The surveys run every two
            years, so a 2024 figure is the current one even in 2026, and in a
            high-inflation country it will lag badly. And &ldquo;most sold
            brand&rdquo; is not one product: the most sold spirit is soju in
            South Korea, vodka in Poland and whisky in India, which is a large
            part of why the spirits column has the widest spread in the game.
          </p>
        </Prose>
      </Section>

      <Section heading="Mobile data">
        <Prose>
          <p>
            The price of 1GB comes from{" "}
            <a
              href="https://www.cable.co.uk/mobiles/worldwide-data-pricing/"
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="underline hover:text-neutral-300"
            >
              Cable.co.uk&apos;s worldwide mobile data pricing league table
            </a>
            , which averages more than 5,600 prepaid and postpaid plans across
            237 countries.
          </p>
          <p>
            This is the oldest data on the site. Cable&apos;s own dataset
            download and historical series are both dated 2023, and although
            plenty of other sites republish these exact figures under the current
            year, nothing on the publisher&apos;s page supports that. So the rows
            say 2023, and they are shown per the year they were collected in.
            Mobile data has been getting cheaper by roughly a fifth a year, so
            read these as a ceiling.
          </p>
          <p>
            It is also the only item published in dollars and nothing else. Those
            rows show no local-currency price rather than a converted one.
          </p>
        </Prose>
      </Section>

      <Section heading="The cost of a healthy diet">
        <Prose>
          <p>
            The one item here that nobody actually buys. The{" "}
            <a
              href="https://www.worldbank.org/en/programs/icp/brief/foodpricesfornutrition"
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="underline hover:text-neutral-300"
            >
              Food Prices for Nutrition
            </a>{" "}
            database, published by the World Bank with the FAO, prices the
            cheapest combination of locally available foods that would meet
            national dietary guidelines, per person per day. It is a floor rather
            than an average, and it is the figure used to count how many people
            cannot afford to eat well.
          </p>
          <p>
            It is published in local currency only, so the dollar figure here is
            converted at the World Bank&apos;s own official exchange rate for the
            same year. Both halves are published; the multiplication is ours.
          </p>
        </Prose>
      </Section>

      <Section heading="Currency conversion">
        <Prose>
          <p>
            Most sources publish both figures themselves, and where they do,
            both are printed as published and neither is derived. That covers the
            Big Mac, all four energy items and all four WHO items: the dollar
            price is the publisher&apos;s own conversion at the rate on its
            collection date.
          </p>
          <p>
            Two groups work the other way. Numbeo publishes in US dollars, so the
            local-currency figure for cappuccino, milk, eggs, apples and petrol is
            converted at the rate on the collection day. The cost of a healthy
            diet is published in local currency only, so its dollar figure is the
            converted one.
          </p>
          <p>
            Either way, a converted figure is not an observed one. For most
            currencies that distinction is invisible. For fast-moving currencies
            like the Argentine peso, the Turkish lira and the Egyptian pound, it
            matters, and a figure can drift noticeably from what a shopper
            actually pays within weeks. Argentina is the extreme case, because
            official and parallel exchange rates have historically differed enough
            that any single conversion is contestable.
          </p>
          <p>
            Mobile data is published in dollars with no local figure at all.
            Rather than invent one, those rows leave the local price blank. A
            price nobody published would look exactly as authoritative on the page
            as one that was.
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
            because nine of the {ITEMS.length} items are food or drink. A country
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
            The rest carry their publishers&apos; own terms, and two of them are
            more restrictive than this site: GlobalPetrolPrices.com states a
            Creative Commons Attribution-NonCommercial-NoDerivs 3.0 licence at
            the foot of every page, and WHO data is issued under
            CC BY-NC-SA 3.0 IGO. Both carry a non-commercial condition, and this
            site carries advertising. The energy and WHO figures are reproduced
            here with attribution and a link to the source on every price, and we
            will take either set down on request from the publisher. World Bank
            and FAO data is CC BY 4.0, which has no such condition.
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
      <RelatedGuides
        slugs={GUIDES_FOR_COUNTRY}
        heading="Further reading"
      />

    </ContentPage>
  );
}
