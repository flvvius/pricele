import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import { activePriceEntries } from "@/lib/catalog";
import { countrySlug, formatLocal, formatUSD } from "@/lib/format";
import {
  ITEM_NAME,
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

const TITLE = `Price of a ${ITEM_NAME} by Country`;
const DESCRIPTION = `How much does a ${ITEM_NAME} cost around the world? Compare prices in local currency and US dollars across every country featured in Pricele, the daily price-guessing game.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/prices" },
  openGraph: {
    title: `${TITLE} · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absoluteUrl("/prices"),
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function PricesIndex() {
  const entries = activePriceEntries();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: TITLE,
    description: DESCRIPTION,
    numberOfItems: entries.length,
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${ITEM_NAME} in ${e.countryName}`,
      url: absoluteUrl(`/prices/${countrySlug(e.countryName)}`),
    })),
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-300">
          Pricele
        </Link>{" "}
        / <span className="text-neutral-300">Prices by country</span>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-black tracking-tight">
          How much does a {ITEM_NAME} cost around the world?
        </h1>
        <p className="text-sm text-neutral-400">
          {DESCRIPTION} Think you can guess these from memory?{" "}
          <Link href="/" className="text-neutral-200 underline underline-offset-2">
            Play today&apos;s Pricele
          </Link>
          .
        </p>
      </header>

      <section aria-label="Prices by country" className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="py-2 pr-4 font-medium">Country</th>
              <th className="py-2 pr-4 font-medium">Price (USD)</th>
              <th className="py-2 font-medium">Local price</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.countryCode} className="border-b border-neutral-900">
                <td className="py-2 pr-4">
                  <Link
                    href={`/prices/${countrySlug(e.countryName)}`}
                    className="font-medium text-neutral-100 hover:underline"
                  >
                    <span aria-hidden>{e.flag}</span> {e.countryName}
                  </Link>
                </td>
                <td className="py-2 pr-4 tabular-nums text-neutral-300">
                  {formatUSD(e.priceUSD)}
                </td>
                <td className="py-2 tabular-nums text-neutral-400">
                  {formatLocal(e)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-neutral-500">
        Prices are rough estimates for a daily game, not shopping advice.
      </p>

      <SiteFooter />

      <JsonLd
        data={[
          itemListJsonLd,
          breadcrumbJsonLd([
            { name: "Pricele", path: "/" },
            { name: "Prices by country", path: "/prices" },
          ]),
        ]}
      />
    </main>
  );
}
