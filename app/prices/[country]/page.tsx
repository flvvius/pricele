import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import FaqSection from "@/components/FaqSection";
import SiteFooter from "@/components/SiteFooter";
import {
  activePriceEntries,
  allCountrySlugs,
  priceEntryBySlug,
} from "@/lib/catalog";
import {
  affordanceLine,
  countrySlug,
  formatLocal,
  formatUSD,
} from "@/lib/format";
import {
  ITEM_NAME,
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  type FaqItem,
} from "@/lib/seo";
import type { PriceEntry } from "@/lib/puzzle";

export const dynamic = "force-static";
export const dynamicParams = false;

// One static page per country in the dataset. Adding a country to prices.json
// automatically mints a new indexable page here.
export function generateStaticParams() {
  return allCountrySlugs().map((country) => ({ country }));
}

function faqFor(price: PriceEntry): FaqItem[] {
  return [
    {
      question: `How much does a ${ITEM_NAME} cost in ${price.countryName}?`,
      answer: `A ${ITEM_NAME} costs about ${formatUSD(
        price.priceUSD
      )} in ${price.countryName}, which is roughly ${formatLocal(
        price
      )}. ${affordanceLine(price)}`,
    },
    {
      question: `What currency is used in ${price.countryName}?`,
      answer: `Prices in ${price.countryName} are shown in ${price.localCurrency}. A ${ITEM_NAME} runs about ${formatLocal(
        price
      )} there.`,
    },
    {
      question: `Where can I guess prices like this?`,
      answer: `Pricele is a free daily game where you guess the price of an everyday item in a new country each day. ${price.countryName} is one of the countries in rotation.`,
    },
  ];
}

export function generateMetadata({
  params,
}: {
  params: { country: string };
}): Metadata {
  const price = priceEntryBySlug(params.country);
  if (!price) return {};

  const title = `How Much Does a ${ITEM_NAME} Cost in ${price.countryName}?`;
  const description = `A ${ITEM_NAME} costs about ${formatUSD(
    price.priceUSD
  )} (${formatLocal(price)}) in ${price.countryName}. See the local price, currency, and how it compares — then play the daily Pricele game.`;

  return {
    title,
    description,
    alternates: { canonical: `/prices/${params.country}` },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/prices/${params.country}`),
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function CountryPrice({
  params,
}: {
  params: { country: string };
}) {
  const price = priceEntryBySlug(params.country);
  if (!price) notFound();

  const faq = faqFor(price);
  const others = activePriceEntries().filter(
    (e) => e.countryCode !== price.countryCode
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-300">
          Pricele
        </Link>{" "}
        /{" "}
        <Link href="/prices" className="hover:text-neutral-300">
          Prices
        </Link>{" "}
        / <span className="text-neutral-300">{price.countryName}</span>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-black tracking-tight">
          How much does a {ITEM_NAME} cost in {price.countryName}{" "}
          <span aria-hidden>{price.flag}</span>?
        </h1>
        <p className="text-sm text-neutral-400">
          A {ITEM_NAME} costs about{" "}
          <strong className="text-neutral-100">{formatUSD(price.priceUSD)}</strong>{" "}
          in {price.countryName} — roughly{" "}
          <strong className="text-neutral-100">{formatLocal(price)}</strong>.{" "}
          {affordanceLine(price)}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Price (USD)
          </p>
          <p className="mt-1 text-3xl font-black tabular-nums">
            {formatUSD(price.priceUSD)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Local price
          </p>
          <p className="mt-1 text-3xl font-black tabular-nums">
            {formatLocal(price)}
          </p>
        </div>
      </section>

      <section aria-labelledby="play-cta" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
        <h2 id="play-cta" className="text-lg font-bold text-neutral-100">
          Guess prices like this every day
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Pricele shows you a new country each day and challenges you to guess
          the price in five tries.
        </p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-green-400"
        >
          Play today&apos;s Pricele
        </Link>
      </section>

      <FaqSection items={faq} heading={`${ITEM_NAME} in ${price.countryName}: FAQ`} />

      <section aria-labelledby="others-heading" className="flex flex-col gap-2">
        <h2 id="others-heading" className="text-lg font-bold text-neutral-100">
          Prices in other countries
        </h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {others.map((e) => (
            <li key={e.countryCode}>
              <Link
                href={`/prices/${countrySlug(e.countryName)}`}
                className="text-neutral-300 hover:underline"
              >
                <span aria-hidden>{e.flag}</span> {e.countryName}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-neutral-500">
        Price is a rough estimate for a daily game, not shopping advice. Source:{" "}
        {price.source}.
      </p>

      <SiteFooter />

      <JsonLd
        data={[
          faqJsonLd(faq),
          breadcrumbJsonLd([
            { name: "Pricele", path: "/" },
            { name: "Prices", path: "/prices" },
            { name: price.countryName, path: `/prices/${params.country}` },
          ]),
        ]}
      />
    </main>
  );
}
