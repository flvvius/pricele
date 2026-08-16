import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import PriceTable, { type Row } from "@/components/PriceTable";
import JsonLd from "@/components/JsonLd";
import RelatedGuides, { GUIDES_FOR_COUNTRY } from "@/components/RelatedGuides";
import {
  COUNTRIES,
  getCountryBySlug,
  pricesForCountry,
  pricesForItem,
  rankForItem,
  medianPriceUSD,
  suppressedPairs,
  wageMinutes,
} from "@/lib/catalog";
import { ITEMS, getItem } from "@/data/items";
import { COUNTRY_NOTES, COUNTRY_TAX } from "@/data/countries";
import { formatUSD } from "@/lib/format";
import { datasetJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ country: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { country: string };
}): Metadata {
  const country = getCountryBySlug(params.country);
  if (!country) return {};
  return pageMetadata({
    path: `/prices/${country.slug}`,
    title: `Prices in ${country.name}`,
    description: `What everyday items cost in ${country.name}: a Big Mac, a cappuccino, milk, eggs, apples and petrol, priced in US dollars, in ${country.localCurrency}, and in how long the average local wage takes to earn them.`,
  });
}

/** Ordinal suffix for a rank: 1st, 2nd, 3rd, 4th. */
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function CountryPage({ params }: { params: { country: string } }) {
  const country = getCountryBySlug(params.country);
  if (!country) notFound();

  const suppressed = suppressedPairs();
  const prices = pricesForCountry(country.code);

  const rows: Row[] = ITEMS.map((item) => {
    const price = prices.find((p) => p.itemId === item.id) ?? null;
    return {
      key: item.id,
      label: item.name,
      href: `/items/${item.slug}`,
      price,
      hidden: price ? suppressed.has(`${item.id}:${country.code}`) : false,
    };
  });

  // Analysis is computed only from rows that are visible, so nothing here can
  // narrow down a price that the table itself is hiding.
  const visible = prices.filter(
    (p) => !suppressed.has(`${p.itemId}:${p.countryCode}`)
  );

  const ranked = visible
    .map((p) => {
      const rank = rankForItem(p.itemId, country.code);
      const total = pricesForItem(p.itemId).length;
      return rank ? { price: p, rank, total } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const priciest = [...ranked].sort((a, b) => a.rank - b.rank)[0];
  const cheapest = [...ranked].sort((a, b) => b.rank - a.rank)[0];
  const hardest = [...visible].sort((a, b) => wageMinutes(b) - wageMinutes(a))[0];
  const note = COUNTRY_NOTES[country.code];
  const tax = COUNTRY_TAX[country.code];

  return (
    <ContentPage
      title={`Prices in ${country.name} ${country.flag}`}
      intro={
        <>
          <p>
            What {ITEMS.length} everyday items cost in {country.name}, shown in US
            dollars, in {country.localCurrency}, and as roughly how long someone
            earning the average local wage works to buy one.
          </p>
          {note && <p>{note}</p>}
        </>
      }
    >
      <Section heading="What things cost">
        <PriceTable rows={rows} labelHeader="Item" />
        <p className="label">
          Local-currency figures are converted from US dollars at recent exchange
          rates, except the Big Mac, which is published in local currency by The
          Economist and converted the other way. Work time divides the dollar
          price by an estimated average hourly wage, the roughest number on this
          page. See{" "}
          <Link href="/methodology" className="underline hover:text-neutral-300">
            methodology
          </Link>
          .
        </p>
      </Section>

      {ranked.length > 1 && (
        <Section heading={`How ${country.name} compares`}>
          <Prose>
            {priciest && (
              <p>
                Relative to the rest of the game, {country.name} is most
                expensive for{" "}
                <strong className="font-semibold text-neutral-200">
                  {getItem(priciest.price.itemId)?.shortName.toLowerCase()}
                </strong>
                , where it ranks {ordinal(priciest.rank)} out of{" "}
                {priciest.total} countries at{" "}
                {formatUSD(priciest.price.priceUSD)}, against a global median of{" "}
                {formatUSD(medianPriceUSD(priciest.price.itemId))}.
              </p>
            )}
            {cheapest && cheapest.price.itemId !== priciest?.price.itemId && (
              <p>
                It is relatively cheapest for{" "}
                <strong className="font-semibold text-neutral-200">
                  {getItem(cheapest.price.itemId)?.shortName.toLowerCase()}
                </strong>{" "}
                at {formatUSD(cheapest.price.priceUSD)}, which is{" "}
                {ordinal(cheapest.rank)} of {cheapest.total}, only{" "}
                {cheapest.total - cheapest.rank} countries in the game are
                cheaper.
              </p>
            )}
            {hardest && (
              <p>
                Measured against local earnings rather than dollars, the item
                that takes the longest to afford here is{" "}
                {getItem(hardest.itemId)?.shortName.toLowerCase()}, at roughly{" "}
                {wageMinutes(hardest) < 90
                  ? `${Math.round(wageMinutes(hardest))} minutes`
                  : `${(wageMinutes(hardest) / 60).toFixed(1)} hours`}{" "}
                of the average wage. Dollar prices and work-time prices often
                rank countries very differently, and that gap is usually the more
                interesting number.
              </p>
            )}
          </Prose>
        </Section>
      )}

      {tax && (
        <Section heading="What the state takes">
          {/* Deliberately short. The sourcing and caveats live on /methodology
              rather than here: repeated verbatim across 33 country pages they
              were ~70 words of boilerplate each, which is the exact problem the
              written notes above exist to solve. */}
          <Prose>
            <p>
              Standard rate in {country.name}:{" "}
              <strong className="font-semibold text-ink">{tax.standard}</strong>
              {tax.food ? (
                <>
                  . Ordinary groceries:{" "}
                  <strong className="font-semibold text-ink">{tax.food}</strong>.
                </>
              ) : (
                "."
              )}{" "}
              <Link href="/methodology#tax" className="underline">
                Where these come from
              </Link>
              .
            </p>
          </Prose>
        </Section>
      )}

      <Section heading="Play a puzzle">
        <Prose>
          <p>
            {country.name} comes up in the daily puzzle roughly once every{" "}
            {COUNTRIES.length} days, paired with a different item each time.{" "}
            <Link href="/" className="underline hover:text-neutral-300">
              Play today&apos;s puzzle
            </Link>{" "}
            or browse the{" "}
            <Link href="/archive" className="underline hover:text-neutral-300">
              archive
            </Link>{" "}
            of past rounds.
          </p>
        </Prose>
      </Section>

      <Section heading="Other countries">
        <ul className="flex flex-wrap gap-1.5">
          {COUNTRIES.filter((c) => c.code !== country.code).map((c) => (
            <li key={c.code}>
              <Link
                href={`/prices/${c.slug}`}
                className="inline-flex items-center gap-1.5 border border-rule px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted transition-[border-color,color] duration-fast ease-out hover:border-ink hover:text-ink"
              >
                <span aria-hidden>{c.flag}</span>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <RelatedGuides
        slugs={GUIDES_FOR_COUNTRY}
        heading="Why a country's prices look the way they do"
      />

      <JsonLd
        data={datasetJsonLd({
          name: `Everyday prices in ${country.name}`,
          description: `Prices for ${ITEMS.length} everyday items in ${country.name}, in US dollars and ${country.localCurrency}.`,
          path: `/prices/${country.slug}`,
          spatialCoverage: country.name,
        })}
      />
    </ContentPage>
  );
}
