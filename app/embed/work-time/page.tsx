import type { Metadata } from "next";
import PriceLineChart from "@/components/PriceLineChart";
import { absoluteUrl } from "@/lib/seo";
import { basketSeries } from "@/lib/worktime";

export const metadata: Metadata = {
  title: "Grocery work-time index",
  robots: { index: false, follow: true },
  alternates: { canonical: "/work-time" },
};

export default function EmbedWorkTime() {
  const series = basketSeries();
  const href = `${absoluteUrl("/work-time")}?utm_source=embed&utm_medium=iframe&utm_campaign=work-time`;
  return (
    <main className="flex flex-col gap-2 p-3">
      <p className="display text-[1.4rem] leading-tight text-ink">
        Minutes of work to buy a U.S. grocery basket, {series[0].year} to{" "}
        {series[series.length - 1].year}
      </p>
      <PriceLineChart points={series} unit="min" fromZero={false} label="Grocery work-time index" caption={false} />
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        Source: BLS prices and wages ·{" "}
        <a
          href={href}
          target="_blank"
          rel="noopener"
          className="text-ink underline underline-offset-2"
        >
          Method at Pricele
        </a>
      </p>
    </main>
  );
}
