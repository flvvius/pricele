import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PriceLineChart from "@/components/PriceLineChart";
import { HISTORY_ITEMS } from "@/data/price-history";
import { extremes, historyFor, historyItem, historyTitle } from "@/lib/itemhistory";
import { absoluteUrl } from "@/lib/seo";
import { liveThenNowPairs } from "@/lib/yearprices";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return HISTORY_ITEMS.map((i) => ({ item: i.id }));
}

export function generateMetadata({ params }: { params: { item: string } }): Metadata {
  const item = historyItem(params.item);
  if (!item) return {};
  return {
    title: `${historyTitle(item)} by year`,
    robots: { index: false, follow: true },
    alternates: { canonical: `/history/${item.id}` },
  };
}

export default function EmbedHistory({ params }: { params: { item: string } }) {
  const item = historyItem(params.item);
  if (!item) notFound();
  const points = historyFor(item, liveThenNowPairs());
  const e = extremes(points);
  const href = `${absoluteUrl(`/history/${item.id}`)}?utm_source=embed&utm_medium=iframe&utm_campaign=history`;
  return (
    <main className="flex flex-col gap-2 p-3">
      <p className="display text-[1.4rem] leading-tight text-ink">
        {historyTitle(item)} in the U.S., {e.first.year} to {e.last.year}
      </p>
      <PriceLineChart
        points={points}
        label={`${historyTitle(item)}, U.S. city average`}
        caption={false}
      />
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        Source: BLS average prices ·{" "}
        <a
          href={href}
          target="_blank"
          rel="noopener"
          className="text-ink underline underline-offset-2"
        >
          Full table at Pricele
        </a>
      </p>
    </main>
  );
}
