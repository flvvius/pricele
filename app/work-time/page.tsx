import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Prose, Section } from "@/components/ContentPage";
import EmbedCode from "@/components/EmbedCode";
import JsonLd from "@/components/JsonLd";
import PriceLineChart from "@/components/PriceLineChart";
import { HISTORY_ITEMS, HOURLY_WAGE, WAGE_SERIES } from "@/data/price-history";
import { historyTitle } from "@/lib/itemhistory";
import { absoluteUrl, breadcrumbJsonLd, datasetJsonLd, pageMetadata } from "@/lib/seo";
import { BASKET, basketSeries, itemWorkChanges, lowest } from "@/lib/worktime";
import { itemInProse } from "@/lib/yearprices";

const series = basketSeries();
const first = series[0];
const last = series[series.length - 1];
const low = lowest(series);
const changes = itemWorkChanges(last.year).filter((c) => BASKET.includes(c.item));
const outside = HISTORY_ITEMS.filter((i) => !BASKET.includes(i));
const dearer = changes.filter((c) => c.change > 0);
const pct = (c: number) => `${c >= 0 ? "+" : ""}${Math.round(c * 100)}%`;
const linkClass = "underline underline-offset-2 hover:text-ink";

export const metadata: Metadata = pageMetadata({
  path: "/work-time",
  image: "/og/history/work-time",
  title: `How many minutes of work groceries cost, ${first.year} to ${last.year}`,
  description: `A basket of ${BASKET.length} everyday U.S. items took ${Math.round(first.price)} minutes of work at the average wage in ${first.year}, ${Math.round(low.price)} in ${low.year} and ${Math.round(last.price)} in ${last.year}. BLS prices and wages, every year.`,
});

export default function WorkTimePage() {
  return (
    <ContentPage
      title="The grocery work-time index"
      intro={
        <p>
          A basket of {BASKET.filter((i) => i.id !== "gasoline").length} everyday U.S. groceries and
          a gallon of gas took{" "}
          <strong className="font-semibold text-ink">{Math.round(first.price)} minutes</strong> of
          work at the average hourly wage in {first.year}. It bottomed out at{" "}
          {Math.round(low.price)} minutes in {low.year} and took{" "}
          <strong className="font-semibold text-ink">{Math.round(last.price)}</strong> in{" "}
          {last.year}, {pct(last.price / low.price - 1)} since the low and{" "}
          {pct(last.price / first.price - 1)} since {first.year}.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Price history", path: "/history" },
            { name: "Work-time index" },
          ]),
          datasetJsonLd({
            name: `U.S. grocery basket in minutes of work, ${first.year}-${last.year}`,
            description: `Minutes of work at BLS average hourly earnings (${WAGE_SERIES}) needed to buy ${BASKET.length} items at BLS U.S. city average prices, every year.`,
            path: "/work-time",
            spatialCoverage: "United States",
            countryCode: "US",
            citations: [`https://data.bls.gov/timeseries/${WAGE_SERIES}`],
            size: series.length,
          }),
        ]}
      />
      <Section heading="The chart">
        <PriceLineChart
          points={series}
          unit="min"
          fromZero={false}
          label="Minutes of work to buy the basket"
          caption={false}
        />
        <p className="text-[13px] text-ink-muted">
          Minutes of work at the average hourly wage to buy one of each item below. Hover a point
          for the year.
        </p>
      </Section>
      <Section heading="Item by item">
        <ul className="flex flex-col border-t border-rule">
          {changes.map((c) => (
            <li
              key={c.item.id}
              className="flex items-baseline justify-between gap-3 border-b border-rule-soft py-2"
            >
              <Link
                href={`/history/${c.item.id}`}
                className="min-w-0 text-[15px] text-ink underline-offset-4 hover:underline"
              >
                {c.item.name}
              </Link>
              <span className="shrink-0 font-mono text-[13px] text-ink-muted">
                {c.from.toFixed(1)} → {c.to.toFixed(1)} min{" "}
                <span className={c.change > 0 ? "text-accent" : ""}>({pct(c.change)})</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-ink-muted">
          From {first.year} to {last.year}.{" "}
          {outside.map((i, k) => (
            <span key={i.id}>
              <Link href={`/history/${i.id}`} className={linkClass}>
                {historyTitle(i).replace(/ prices$/, "")}
              </Link>
              {k < outside.length - 2 ? ", " : k === outside.length - 2 ? " and " : ""}
            </span>
          ))}{" "}
          {outside.length === 1 ? "is" : "are"} left out because BLS has gaps or starts later.
        </p>
      </Section>
      <Section heading="What it shows">
        <Prose>
          <p>
            Nominal prices rose for every item, but the average hourly wage rose from $
            {HOURLY_WAGE[first.year].toFixed(2)} to ${HOURLY_WAGE[last.year].toFixed(2)}, faster
            than most of them. Measured in work, the basket got cheaper over the period as a whole,
            though not every year: it climbed again from 2008 to 2012, and again after {low.year}.
          </p>
          {dearer.length > 0 && (
            <p>
              {dearer.length} item{dearer.length === 1 ? "" : "s"} now take
              {dearer.length === 1 ? "s" : ""} longer to earn than in the first year of the data:{" "}
              {dearer.map((c, k) => (
                <span key={c.item.id}>
                  {itemInProse(c.item)} ({pct(c.change)})
                  {k < dearer.length - 2 ? ", " : k === dearer.length - 2 ? " and " : ""}
                </span>
              ))}
              .
            </p>
          )}
          <p>
            The basket is the {BASKET.length} items BLS has priced every year since {first.year}:{" "}
            {BASKET.map((i) =>
              historyTitle(i)
                .replace(/ prices$/, "")
                .toLowerCase()
            ).join(", ")}
            . Prices are BLS U.S. city averages; the wage is average hourly earnings of production
            and nonsupervisory employees ({WAGE_SERIES}), about four in five private-sector workers.
            It is not the CPI and ignores rent, health care and everything else outside a grocery
            bag.
          </p>
          <p>
            To guess the year from a basket like this, play{" "}
            <Link href="/games/price-year" className={linkClass}>
              Price Year
            </Link>
            . For one year at a time, see{" "}
            <Link href="/years" className={linkClass}>
              prices the year you were born
            </Link>
            . We wrote up what the series shows in{" "}
            <Link href="/blog/grocery-work-time-index-1980-2025" className={linkClass}>
              groceries take 24% less work than in 1980
            </Link>
            .
          </p>
        </Prose>
      </Section>
      <Section heading="Use this chart">
        <EmbedCode
          item="work-time"
          code={`<iframe src="${absoluteUrl("/embed/work-time")}" title="U.S. grocery work-time index" width="100%" height="360" style="border:0;max-width:600px" loading="lazy"></iframe>`}
        />
      </Section>
    </ContentPage>
  );
}
