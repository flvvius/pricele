import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import PriceTable from "@/components/PriceTable";
import {
  publishedArchiveDates,
  isPublishedArchiveDate,
  countrySlug,
  rankForItem,
  pricesForItem,
  pricesForCountry,
  medianPriceUSD,
  suppressedPairs,
} from "@/lib/catalog";
import { getItem } from "@/data/items";
import { COUNTRY_NOTES } from "@/data/countries";
import { getPuzzleForISO } from "@/lib/puzzle";
import {
  formatUSD,
  formatLocal,
  formatArchiveDate,
  affordanceLine,
  priceRankLine,
} from "@/lib/format";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

// Only past dates are pre-rendered. dynamicParams stays on (the default) so a
// day rolls into the archive on its own without a redeploy; anything too recent
// is rejected by the isPublishedArchiveDate guard below rather than 404'd at
// build time.
export function generateStaticParams() {
  return publishedArchiveDates().map((date) => ({ date }));
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function generateMetadata({
  params,
}: {
  params: { date: string };
}): Metadata {
  if (!ISO_RE.test(params.date)) return {};
  const puzzle = getPuzzleForISO(params.date);
  if (!puzzle || !isPublishedArchiveDate(params.date)) return {};
  const { item, price, puzzleNumber } = puzzle;
  return pageMetadata({
    path: `/archive/${params.date}`,
    title: `Pricele #${puzzleNumber} — ${item.shortName} in ${price.countryName}`,
    description: `The answer to Pricele #${puzzleNumber} (${formatArchiveDate(
      params.date
    )}): ${item.name.toLowerCase()} in ${price.countryName} cost ${formatUSD(
      price.priceUSD
    )}. See how that compares with every other country.`,
  });
}

export default function ArchiveDatePage({
  params,
}: {
  params: { date: string };
}) {
  if (!ISO_RE.test(params.date)) notFound();
  const puzzle = getPuzzleForISO(params.date);
  if (!puzzle || !isPublishedArchiveDate(params.date)) notFound();

  const { item, price, puzzleNumber } = puzzle;
  const rank = rankForItem(item.id, price.countryCode);
  const total = pricesForItem(item.id).length;
  const note = COUNTRY_NOTES[price.countryCode];
  const median = medianPriceUSD(item.id);

  // The two countries either side of this one in the same item's ranking. Far
  // more informative than a bare rank number, and it gives the reader somewhere
  // to go next.
  const ladder = pricesForItem(item.id); // cheapest first
  const here = ladder.findIndex((p) => p.countryCode === price.countryCode);
  const neighbours = ladder
    .slice(Math.max(0, here - 2), here + 3)
    .filter((p) => !suppressedPairs().has(`${p.itemId}:${p.countryCode}`));

  // What else the same country was priced at, so the reader can calibrate.
  const suppressed = suppressedPairs();
  const alsoHere = pricesForCountry(price.countryCode).filter(
    (p) => p.itemId !== item.id && !suppressed.has(`${p.itemId}:${p.countryCode}`)
  );

  const all = publishedArchiveDates();
  const idx = all.indexOf(params.date);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <ContentPage
      title={`Pricele #${puzzleNumber}: ${item.name} in ${price.countryName} ${price.flag}`}
      intro={
        <p>
          The puzzle for {formatArchiveDate(params.date)} asked what{" "}
          {item.unit} of {item.shortName.toLowerCase()} costs in{" "}
          {price.countryName}. Here is the answer and the context behind it.
        </p>
      }
    >
      <Section heading="The answer">
        <div className="border border-rule border-t-2 border-t-ink bg-paper-raised p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            {item.name} · {price.countryName}
          </p>
          <p className="mt-1 text-4xl font-black tabular-nums text-ink">
            {formatUSD(price.priceUSD)}
          </p>
          <p className="text-ink-muted">{formatLocal(price)}</p>
          <p className="mt-3 border-t border-rule pt-3 text-sm text-ink-body">
            {affordanceLine(price)}
          </p>
          {priceRankLine(price) && (
            <p className="mt-2 text-sm text-ink-muted">{priceRankLine(price)}</p>
          )}
        </div>
        <p className="label">Source: {price.source}.</p>
      </Section>

      <Section heading={`About ${item.shortName.toLowerCase()}`}>
        <Prose>
          <p>{item.blurb}</p>
        </Prose>
      </Section>

      <Section heading={`Where ${price.countryName} sits`}>
        <Prose>
          {rank && (
            <p>
              Of the {total} countries priced for {item.shortName.toLowerCase()},{" "}
              {price.countryName} ranks #{rank} from the top at{" "}
              {formatUSD(price.priceUSD)} — {price.priceUSD > median
                ? `${(price.priceUSD / median).toFixed(1)}× the median`
                : `${((1 - price.priceUSD / median) * 100).toFixed(0)}% below the median`}{" "}
              of {formatUSD(median)}.
            </p>
          )}
          {note && <p>{note}</p>}
        </Prose>
        {neighbours.length > 1 && (
          <PriceTable
            rows={neighbours.map((p) => ({
              key: p.countryCode,
              label: p.countryName,
              icon: p.flag,
              href: `/prices/${countrySlug(p.countryName)}`,
              price: p,
            }))}
            labelHeader={`Nearby on the ${item.shortName.toLowerCase()} table`}
          />
        )}
      </Section>

      {alsoHere.length > 0 && (
        <Section heading={`What else costs what in ${price.countryName}`}>
          <PriceTable
            rows={alsoHere.map((p) => ({
              key: p.itemId,
              label: getItem(p.itemId)?.name ?? p.itemId,
              href: `/items/${getItem(p.itemId)?.slug ?? ""}`,
              price: p,
            }))}
            labelHeader="Item"
          />
        </Section>
      )}

      <Section heading="Go deeper">
        <Prose>
          <p>
            See the full table for{" "}
            <Link
              href={`/items/${item.slug}`}
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              {item.shortName.toLowerCase()} in every country
            </Link>{" "}
            or everything priced in{" "}
            <Link
              href={`/prices/${countrySlug(price.countryName)}`}
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              {price.countryName}
            </Link>
            .
          </p>
        </Prose>
      </Section>

      <Section heading="More puzzles">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {older && (
            <Link
              href={`/archive/${older}`}
              className="border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-body transition-[border-color,background-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-raised active:scale-[0.97]"
            >
              ← Previous puzzle
            </Link>
          )}
          {newer && (
            <Link
              href={`/archive/${newer}`}
              className="border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-body transition-[border-color,background-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-raised active:scale-[0.97]"
            >
              Next puzzle →
            </Link>
          )}
          <Link
            href="/archive"
            className="border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-body transition-[border-color,background-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-raised active:scale-[0.97]"
          >
            All puzzles
          </Link>
          <Link
            href="/"
            className="bg-ink px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.97]"
          >
            Play today&apos;s
          </Link>
        </div>
      </Section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `Pricele #${puzzleNumber} — ${item.name} in ${price.countryName}`,
          datePublished: params.date,
          url: absoluteUrl(`/archive/${params.date}`),
          isAccessibleForFree: true,
          author: { "@type": "Organization", name: "Pricele" },
          publisher: { "@type": "Organization", name: "Pricele" },
        }}
      />
    </ContentPage>
  );
}
