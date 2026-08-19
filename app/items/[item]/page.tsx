import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import PriceTable, { type Row } from "@/components/PriceTable";
import JsonLd from "@/components/JsonLd";
import RelatedGuides, { GUIDES_BY_ITEM } from "@/components/RelatedGuides";
import { ITEMS, getItemBySlug } from "@/data/items";
import {
  pricesForItem,
  medianPriceUSD,
  suppressedPairs,
  countrySlug,
  wageMinutes,
} from "@/lib/catalog";
import { formatUSD } from "@/lib/format";
import { datasetJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return ITEMS.map((i) => ({ item: i.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { item: string };
}): Metadata {
  const item = getItemBySlug(params.item);
  if (!item) return {};
  const rows = pricesForItem(item.id);
  // Not every source publishes a local-currency figure, and promising one the
  // table does not have is worse than not mentioning it.
  const local = rows.some((p) => p.priceLocal != null) ? " and local currency," : "";
  return pageMetadata({
    path: `/items/${item.slug}`,
    title: `${item.name} prices by country`,
    description: `What ${item.name.toLowerCase()} costs in ${rows.length} countries, ranked cheapest to most expensive, in US dollars${local} plus how long the average local wage takes to earn one.`,
  });
}

export default function ItemPage({ params }: { params: { item: string } }) {
  const item = getItemBySlug(params.item);
  if (!item) notFound();

  const suppressed = suppressedPairs();
  const prices = pricesForItem(item.id); // cheapest first
  const hasLocal = prices.some((p) => p.priceLocal != null);

  const rows: Row[] = prices.map((p) => ({
    key: p.countryCode,
    label: p.countryName,
    icon: p.flag,
    href: `/prices/${countrySlug(p.countryName)}`,
    price: p,
    hidden: suppressed.has(`${p.itemId}:${p.countryCode}`),
  }));

  const visible = prices.filter(
    (p) => !suppressed.has(`${p.itemId}:${p.countryCode}`)
  );
  const cheapest = visible[0];
  const dearest = visible[visible.length - 1];
  const median = medianPriceUSD(item.id);
  const ratio =
    cheapest && dearest && cheapest.priceUSD > 0
      ? dearest.priceUSD / cheapest.priceUSD
      : null;

  // Work time reorders the table completely, and that contrast is the most useful
  // thing on the page, so it gets its own short list.
  const byWork = [...visible].sort((a, b) => wageMinutes(b) - wageMinutes(a));
  const worstWork = byWork[0];
  const bestWork = byWork[byWork.length - 1];

  return (
    <ContentPage
      title={`${item.name} prices by country`}
      intro={
        <>
          <p>{item.blurb}</p>
          <p>
            Below, {item.unit} priced in {prices.length} countries, cheapest
            first, in US dollars
            {hasLocal ? " and in local currency." : ". This source publishes dollars and nothing else, so there is no local-currency column to fill."}
          </p>
        </>
      }
    >
      <Section heading="The numbers">
        <PriceTable rows={rows} labelHeader="Country" showLocal={hasLocal} />
        <p className="label">
          Source: {item.sourceNote}{" "}
          <Link href="/methodology" className="underline hover:text-neutral-300">
            Full methodology
          </Link>
          .
        </p>
      </Section>

      {cheapest && dearest && ratio && (
        <Section heading="What the spread shows">
          <Prose>
            <p>
              The cheapest {item.shortName.toLowerCase()} in the game is in{" "}
              <Link
                href={`/prices/${countrySlug(cheapest.countryName)}`}
                className="underline hover:text-neutral-300"
              >
                {cheapest.countryName}
              </Link>{" "}
              at {formatUSD(cheapest.priceUSD)}; the most expensive is in{" "}
              <Link
                href={`/prices/${countrySlug(dearest.countryName)}`}
                className="underline hover:text-neutral-300"
              >
                {dearest.countryName}
              </Link>{" "}
              at {formatUSD(dearest.priceUSD)}. That is a{" "}
              {ratio.toFixed(1)}× difference for the same thing, against a
              median of {formatUSD(median)} across all {prices.length} countries.
            </p>
            {worstWork && bestWork && worstWork !== bestWork && (
              <p>
                Ranking by earnings instead of dollars rearranges the table.{" "}
                {worstWork.countryName} has the longest wait, about{" "}
                {wageMinutes(worstWork) < 90
                  ? `${Math.round(wageMinutes(worstWork))} minutes`
                  : `${(wageMinutes(worstWork) / 60).toFixed(1)} hours`}{" "}
                of the average local wage, while in {bestWork.countryName} it is
                roughly{" "}
                {wageMinutes(bestWork) < 1
                  ? "under a minute"
                  : `${Math.round(wageMinutes(bestWork))} minutes`}
                . A country can look cheap in dollars and expensive in hours at
                the same time, and for most people the hours are what actually
                matter.
              </p>
            )}
          </Prose>
        </Section>
      )}

      <Section heading="Other items">
        <ul className="flex flex-wrap gap-1.5">
          {ITEMS.filter((i) => i.id !== item.id).map((i) => (
            <li key={i.id}>
              <Link
                href={`/items/${i.slug}`}
                className="inline-block border border-rule px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted transition-[border-color,color] duration-fast ease-out hover:border-ink hover:text-ink"
              >
                {i.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Chosen per item, so the fuel page and the egg page do not recommend
          the same reading. See components/RelatedGuides.tsx. */}
      <RelatedGuides slugs={GUIDES_BY_ITEM[item.id] ?? []} />

      <JsonLd
        data={datasetJsonLd({
          name: `${item.name} prices by country`,
          description: `Price of ${item.name.toLowerCase()} across ${prices.length} countries in US dollars${hasLocal ? " and local currency" : ""}.`,
          path: `/items/${item.slug}`,
        })}
      />
    </ContentPage>
  );
}
