import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentPage, { Prose, Section } from "@/components/ContentPage";
import FaqSection from "@/components/FaqSection";
import JsonLd from "@/components/JsonLd";
import PriceLineChart from "@/components/PriceLineChart";
import EmbedCode from "@/components/EmbedCode";
import { HISTORY_ITEMS } from "@/data/price-history";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  datasetJsonLd,
  faqJsonLd,
  pageMetadata,
  type FaqItem,
} from "@/lib/seo";
import { extremes, historyFor, historyItem, historyTitle, shown } from "@/lib/itemhistory";
import { liveThenNowPairs, itemInProse } from "@/lib/yearprices";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return HISTORY_ITEMS.map((i) => ({ item: i.id }));
}

const usd = (n: number) => `$${n.toFixed(2)}`;
const mins = (m: number) => (m < 10 ? m.toFixed(1) : String(Math.round(m)));
const pct = (c: number) => `${c >= 0 ? "+" : ""}${Math.round(c * 100)}%`;
const linkClass = "underline underline-offset-2 hover:text-ink";

export function generateMetadata({ params }: { params: { item: string } }): Metadata {
  const item = historyItem(params.item);
  if (!item) return {};
  const years = Object.keys(item.prices).map(Number);
  const first = Math.min(...years);
  const last = Math.max(...years);
  return pageMetadata({
    path: `/history/${item.id}`,
    title: `${historyTitle(item)} by year, ${first} to ${last}`,
    image: `/og/history/${item.id}`,
    description: `The U.S. average price of ${itemInProse(item)} every year from ${first} to ${last}, from BLS data, with the yearly change and how many minutes of work it took at the average wage.`,
  });
}

export default function HistoryPage({ params }: { params: { item: string } }) {
  const item = historyItem(params.item);
  if (!item) notFound();
  const points = historyFor(item, liveThenNowPairs());
  const e = extremes(points);
  const title = `${historyTitle(item)} by year`;
  const faq: FaqItem[] = [
    {
      question: `What year were ${historyTitle(item).toLowerCase()} highest?`,
      answer: `${e.priciest.year}, when ${itemInProse(item)} averaged ${usd(e.priciest.price)} in U.S. cities (${item.unit}), counting the years shown on this page.`,
    },
    {
      question: `When was ${itemInProse(item)} cheapest in work time?`,
      answer: `${e.cheapestWork.year}. At ${usd(e.cheapestWork.price)} and that year's average hourly wage, it took about ${mins(e.cheapestWork.minutes)} minutes of work. It took the longest in ${e.dearestWork.year}, about ${mins(e.dearestWork.minutes)} minutes.`,
    },
    {
      question: `What was the biggest one-year jump?`,
      answer: `${e.biggestJump.year}, up ${pct(e.biggestJump.change ?? 0)} on the year before to ${usd(e.biggestJump.price)}.`,
    },
  ];

  return (
    <ContentPage
      title={title}
      intro={
        <p>
          {item.name} averaged{" "}
          <strong className="font-semibold text-ink">{usd(e.last.price)}</strong> in U.S. cities in{" "}
          {e.last.year}, up from {usd(e.first.price)} in {e.first.year}. In minutes of work at the
          average wage it went from {mins(e.first.minutes)} to {mins(e.last.minutes)}.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Price history", path: "/history" },
            { name: historyTitle(item) },
          ]),
          datasetJsonLd({
            name: `${title}, U.S. city average`,
            description: `Annual U.S. city average price of ${itemInProse(item)} (${item.unit}), BLS series ${item.series}, with minutes of work at the BLS average hourly wage.`,
            path: `/history/${item.id}`,
            spatialCoverage: "United States",
            countryCode: "US",
            citations: [`https://data.bls.gov/timeseries/${item.series}`],
            size: points.length,
          }),
          faqJsonLd(faq),
        ]}
      />
      <Section heading="The chart">
        <PriceLineChart points={points} label={`${historyTitle(item)}, U.S. city average`} />
      </Section>
      <Section heading="Every year">
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse font-mono text-[14px]"
            data-testid="history-table"
          >
            <thead>
              <tr className="border-b border-rule text-left text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                <th className="py-2 pr-3 font-normal">Year</th>
                <th className="py-2 pr-3 text-right font-normal">Price</th>
                <th className="py-2 pr-3 text-right font-normal">On year</th>
                <th className="py-2 text-right font-normal">Work</th>
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((p) => (
                <tr key={p.year} className="border-b border-rule-soft">
                  <td className="py-1.5 pr-3">
                    <Link href={`/years/${p.year}`} className={linkClass}>
                      {p.year}
                    </Link>
                  </td>
                  {p.hidden ? (
                    <td colSpan={3} className="py-1.5 text-right text-ink-muted">
                      In today&apos;s{" "}
                      <Link href="/games/then-and-now" className={linkClass}>
                        Then &amp; Now
                      </Link>
                    </td>
                  ) : (
                    <>
                      <td className="py-1.5 pr-3 text-right text-ink">{usd(p.price)}</td>
                      <td className="py-1.5 pr-3 text-right text-ink-muted">
                        {p.change === null ? "" : pct(p.change)}
                      </td>
                      <td className="py-1.5 text-right text-ink-muted">{mins(p.minutes)} min</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          Source: U.S. Bureau of Labor Statistics, Average Price Data, series{" "}
          <a href={`https://data.bls.gov/timeseries/${item.series}`} className={linkClass}>
            {item.series}
          </a>{" "}
          ({item.blsItem}, U.S. city average). Each year is the mean of its monthly averages; years
          with fewer than ten months published are left out. Work is minutes at the BLS average
          hourly earnings of production and nonsupervisory employees. Not adjusted for inflation.
        </p>
      </Section>
      <Section heading="Use this chart">
        <Prose>
          <p>
            Writing about {historyTitle(item).toLowerCase()}? Paste this into your page. The chart
            updates when the data does and links back to the full table.
          </p>
        </Prose>
        <EmbedCode
          item={item.id}
          code={`<iframe src="${absoluteUrl(`/embed/history/${item.id}`)}" title="${historyTitle(item)} by year" width="100%" height="360" style="border:0;max-width:600px" loading="lazy"></iframe>`}
        />
      </Section>
      <FaqSection items={faq} heading="Answered" />
      <Section heading="Play with it">
        <Prose>
          <p>
            <Link href="/games/then-and-now" className={linkClass}>
              Then &amp; Now
            </Link>{" "}
            asks what one of these items cost in an earlier year, and{" "}
            <Link href="/games/price-year" className={linkClass}>
              Price Year
            </Link>{" "}
            shows a receipt and asks for the year. Other items:{" "}
            {HISTORY_ITEMS.filter((i) => i.id !== item.id).map((i, k, all) => (
              <span key={i.id}>
                <Link href={`/history/${i.id}`} className={linkClass}>
                  {historyTitle(i)
                    .replace(/ prices$/, "")
                    .toLowerCase()}
                </Link>
                {k < all.length - 1 ? ", " : "."}
              </span>
            ))}
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
