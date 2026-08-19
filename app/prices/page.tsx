import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { COUNTRIES, pricesForCountry, suppressedPairs } from "@/lib/catalog";
import { ITEMS } from "@/data/items";
import { formatUSD } from "@/lib/format";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  pageMetadata,
  SITE_NAME,
} from "@/lib/seo";

// Regenerated hourly so the "in play right now" suppression window keeps moving
// with the rotation instead of freezing at whatever the last deploy saw.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/prices",
  title: "Prices by country",
  description:
    "What everyday things cost in 49 countries: a Big Mac, a cappuccino, milk, eggs, apples, a litre of petrol or diesel, 100 kWh of electricity, a pack of cigarettes, a beer, a gigabyte of mobile data and more, in US dollars and local currency.",
});

export default function PricesIndex() {
  const suppressed = suppressedPairs();

  const rows = COUNTRIES.map((c) => {
    const prices = pricesForCountry(c.code);
    const visible = prices.filter(
      (p) => !suppressed.has(`${p.itemId}:${p.countryCode}`)
    );
    // A country's "basket" is the sum of everything currently visible, so it is
    // only comparable between countries that have the same items. Shown as a
    // rough orientation figure, not a ranking.
    const basket = visible.reduce((sum, p) => sum + p.priceUSD, 0);
    return { country: c, count: prices.length, visible: visible.length, basket };
  });

  return (
    <ContentPage
      title="Prices by country"
      intro={
        <>
          <p>
            Every country in {SITE_NAME}, with what {ITEMS.length} everyday items
            cost there in US dollars and in the local currency. Each country page
            also shows roughly how long someone earning the average local wage
            works to buy one, which is often a bigger difference than the price
            itself.
          </p>
          <p>
            Figures come from The Economist&apos;s Big Mac Index and
            Numbeo&apos;s country price rankings. See{" "}
            <Link href="/methodology" className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink">
              methodology
            </Link>{" "}
            for how each number is produced and where it is weakest.
          </p>
        </>
      }
    >
      <Section heading={`All ${COUNTRIES.length} countries`}>
        <ul className="grid grid-cols-1 border-t border-rule sm:grid-cols-2">
          {rows.map(({ country, count, basket, visible }) => (
            <li key={country.code}>
              <Link
                href={`/prices/${country.slug}`}
                className="flex items-center justify-between gap-3 border-b border-rule-soft px-1 py-2.5 transition-[background-color,color] duration-fast ease-out hover:bg-paper-raised"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span aria-hidden className="text-lg">
                    {country.flag}
                  </span>
                  <span className="truncate text-sm font-medium text-ink-strong">
                    {country.name}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm tabular-nums text-ink-body">
                    {visible > 0 ? formatUSD(basket) : "—"}
                  </span>
                  <span className="block text-[10px] text-ink-meta">
                    {count} item{count === 1 ? "" : "s"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="How to read the basket figure">
        <Prose>
          <p>
            The number beside each country is what one of every listed item would
            cost together, in US dollars. It is a quick orientation figure, not an
            official cost-of-living index: countries stock different numbers of
            items, whichever item is currently in play is left out, and a real
            index would weight each product by how much people actually buy.
          </p>
          <p>
            For a like-for-like comparison of a single product across every
            country, use the{" "}
            <Link href="/items" className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink">
              item pages
            </Link>{" "}
            instead, since those rank one product at a time.
          </p>
        </Prose>
      </Section>

      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Prices", path: "/prices" }]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Prices by country",
            url: absoluteUrl("/prices"),
            description: metadata.description,
            hasPart: COUNTRIES.map((c) => ({
              "@type": "WebPage",
              name: `Prices in ${c.name}`,
              url: absoluteUrl(`/prices/${c.slug}`),
            })),
          },
        ]}
      />
    </ContentPage>
  );
}
