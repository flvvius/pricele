import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { ITEMS } from "@/data/items";
import { pricesForItem, medianPriceUSD, COUNTRIES } from "@/lib/catalog";
import { formatUSD } from "@/lib/format";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Items",
  description:
    "The seven everyday items priced across 33 countries in Pricele — Big Mac, Coca-Cola, cappuccino, milk, eggs, apples and petrol — with the price range for each.",
  alternates: { canonical: "/items" },
};

export default function ItemsIndex() {
  return (
    <ContentPage
      title="Items"
      intro={
        <>
          <p>
            {ITEMS.length} everyday things, priced across up to{" "}
            {COUNTRIES.length} countries each. One of them is the subject of the
            puzzle every day.
          </p>
          <p>
            Each item page ranks every country from cheapest to most expensive
            and explains what actually drives the spread — which is different in
            every case. Fuel is almost pure tax policy; apples are mostly
            climate and freight; a cappuccino is nearly all local rent and wages.
          </p>
        </>
      }
    >
      <Section heading="All items">
        <ul className="flex flex-col gap-2">
          {ITEMS.map((item) => {
            const prices = pricesForItem(item.id);
            const lo = prices[0];
            const hi = prices[prices.length - 1];
            return (
              <li key={item.id}>
                <Link
                  href={`/items/${item.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 transition hover:border-neutral-600 hover:bg-neutral-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-neutral-100">
                      {item.name}
                    </h3>
                    <p className="truncate text-xs text-neutral-500">
                      {prices.length} countries · median{" "}
                      {formatUSD(medianPriceUSD(item.id))}
                    </p>
                  </div>
                  {lo && hi && (
                    <span className="shrink-0 text-right text-xs tabular-nums text-neutral-400">
                      {formatUSD(lo.priceUSD)} – {formatUSD(hi.priceUSD)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section heading="Why the spread differs so much by item">
        <Prose>
          <p>
            The gap between the cheapest and most expensive country is not the
            same size for every product, and the reason is usually structural
            rather than about wealth. Goods that are heavy, perishable or grown
            in a specific climate — milk, apples — are priced by local supply.
            Goods that trade on a world market — fuel, coffee beans — should in
            theory cost the same everywhere, so whatever spread remains is
            mostly tax, subsidy and retail margin.
          </p>
          <p>
            That makes fuel the widest spread in the game and one of the most
            informative: crude oil costs roughly the same to every buyer, so the
            difference between a litre in Egypt and a litre in Norway is almost
            entirely a policy choice.
          </p>
        </Prose>
      </Section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Items",
          url: absoluteUrl("/items"),
          description: metadata.description,
          hasPart: ITEMS.map((i) => ({
            "@type": "WebPage",
            name: i.name,
            url: absoluteUrl(`/items/${i.slug}`),
          })),
        }}
      />
    </ContentPage>
  );
}
