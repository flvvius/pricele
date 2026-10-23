import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Prose, Section } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { HISTORY_ITEMS } from "@/data/price-history";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { extremes, historyFor, historyTitle } from "@/lib/itemhistory";

export const metadata: Metadata = pageMetadata({
  path: "/history",
  title: "U.S. grocery price history by item, 1980 to today",
  description:
    "Year-by-year U.S. average prices for eggs, gas, bread, coffee, beef and ten more everyday items since 1980, from Bureau of Labor Statistics data, with minutes of work at the average wage.",
});

export default function HistoryIndex() {
  return (
    <ContentPage
      title="Price history"
      intro={
        <p>
          Fifteen everyday U.S. items, priced every year from 1980 (1984 for beef and cheddar), from
          the Bureau of Labor Statistics. Each page has the chart, the full table and the price in
          minutes of work.
        </p>
      }
    >
      <JsonLd data={breadcrumbJsonLd([{ name: "Price history" }])} />
      <Section heading="Items">
        <ul className="flex flex-col border-t border-rule">
          {HISTORY_ITEMS.map((i) => {
            const e = extremes(historyFor(i));
            return (
              <li key={i.id} className="border-b border-rule-soft py-2.5">
                <Link
                  href={`/history/${i.id}`}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="text-[16px] text-ink underline-offset-4 hover:underline">
                    {historyTitle(i)}
                  </span>
                  <span className="shrink-0 font-mono text-[13px] text-ink-muted">
                    ${e.first.price.toFixed(2)} → ${e.last.price.toFixed(2)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
      <Section heading="By year instead">
        <Prose>
          <p>
            For the whole basket in minutes of work, see the{" "}
            <Link href="/work-time" className="underline underline-offset-2">
              grocery work-time index
            </Link>
            . To see every item for one year, start from{" "}
            <Link href="/years" className="underline underline-offset-2">
              prices the year you were born
            </Link>
            . Only three of these items take more work to buy than in the 1980s; we name them in{" "}
            <Link
              href="/blog/groceries-that-got-harder-to-buy-since-1980"
              className="underline underline-offset-2"
            >
              this piece
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
