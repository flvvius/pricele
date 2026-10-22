import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentPage, { Prose, Section } from "@/components/ContentPage";
import FaqSection from "@/components/FaqSection";
import JsonLd from "@/components/JsonLd";
import YearPicker from "@/components/YearPicker";
import YearShare from "@/components/YearShare";
import { breadcrumbJsonLd, datasetJsonLd, faqJsonLd, pageMetadata, type FaqItem } from "@/lib/seo";
import {
  LATEST_YEAR,
  YEARS,
  basketMinutes,
  biggestRise,
  bornCardLines,
  isYear,
  liveThenNowPairs,
  mostTimeSaved,
  itemInProse,
  visibleRows,
  yearSummary,
  type YearRow,
  type YearSummary,
} from "@/lib/yearprices";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return YEARS.map((y) => ({ year: String(y) }));
}

const usd = (n: number) => `$${n.toFixed(2)}`;
const pct = (c: number) => `${c >= 0 ? "+" : ""}${Math.round(c * 100)}%`;
const mins = (m: number) => (m < 10 ? m.toFixed(1) : String(Math.round(m)));
const linkClass = "underline underline-offset-2 hover:text-ink";

function lead(s: YearSummary): string {
  const rows = visibleRows(s);
  const pick = ["eggs", "gasoline", "white-bread", "bacon", "sugar"]
    .map((id) => rows.find((r) => r.item.id === id))
    .filter((r): r is YearRow => Boolean(r))
    .slice(0, 2);
  const parts = pick.map((r) => `${itemInProse(r.item)} cost ${usd(r.then)}`);
  return `In ${s.year}, ${parts.join(" and ")} in the U.S., and the average hourly wage was ${usd(s.wageThen)}.`;
}

function faqFor(s: YearSummary): FaqItem[] {
  const rows = visibleRows(s);
  const items = ["eggs", "gasoline", "white-bread", "ground-beef", "coffee", "bacon", "sugar"]
    .map((id) => rows.find((r) => r.item.id === id))
    .filter((r): r is YearRow => Boolean(r))
    .slice(0, 5);
  const out = items.map((r) => ({
    question: `How much did ${itemInProse(r.item)} cost in ${s.year}?`,
    answer: `${usd(r.then)} (${r.item.unit}), the U.S. city average for ${s.year} from the Bureau of Labor Statistics. At that year's average hourly wage of ${usd(s.wageThen)}, it took about ${mins(r.minutesThen)} minutes of work. In ${s.latestYear} it cost ${usd(r.now)}, or about ${mins(r.minutesNow)} minutes.`,
  }));
  out.push({
    question: `What was the average hourly wage in ${s.year}?`,
    answer: `${usd(s.wageThen)} an hour, the BLS average for production and nonsupervisory employees in private industry. In ${s.latestYear} it was ${usd(s.wageNow)}.`,
  });
  return out;
}

export function generateMetadata({ params }: { params: { year: string } }): Metadata {
  if (!isYear(params.year)) return {};
  return pageMetadata({
    path: `/years/${params.year}`,
    title: `Grocery prices in ${params.year}: then and now`,
    description: `What eggs, gas, bread, bacon and more cost in the U.S. in ${params.year}, what they cost in ${LATEST_YEAR}, and how many minutes of work each took at the average wage. BLS data.`,
    image: `/og/year/${params.year}`,
  });
}

export default function YearPage({ params }: { params: { year: string } }) {
  if (!isYear(params.year)) notFound();
  const year = Number(params.year);
  const s = yearSummary(year, liveThenNowPairs());
  const rise = biggestRise(s);
  const saved = mostTimeSaved(s);
  const basket = basketMinutes(visibleRows(s));
  const faq = faqFor(s);
  const description = `U.S. city average prices for ${s.rows.length} grocery and fuel items in ${year} and ${LATEST_YEAR}, with minutes of work at the average hourly wage.`;

  return (
    <ContentPage title={`Grocery prices in ${year}`} intro={<p>{lead(s)}</p>}>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Prices by year", path: "/years" }, { name: String(year) }]),
          datasetJsonLd({
            name: `U.S. grocery and fuel prices, ${year} and ${LATEST_YEAR}`,
            description,
            path: `/years/${year}`,
            spatialCoverage: "United States",
            countryCode: "US",
            citations: ["https://www.bls.gov/cpi/factsheets/average-prices.htm"],
            size: s.rows.length,
          }),
          faqJsonLd(faq),
        ]}
      />

      <Section heading={`${year} vs ${LATEST_YEAR}`}>
        <ul className="flex flex-col border-t border-rule" data-testid="year-rows">
          {s.rows.map((r) => (
            <li key={r.item.id} className="flex flex-col gap-0.5 border-b border-rule-soft py-3">
              <Link
                href={`/history/${r.item.id}`}
                className="text-[16px] text-ink underline-offset-4 hover:underline"
              >
                {r.item.name}
              </Link>
              {r.hidden ? (
                <span className="font-mono text-[13px] text-ink-muted">
                  Hidden: this is a live{" "}
                  <Link href="/games/then-and-now" className={linkClass}>
                    Then &amp; Now
                  </Link>{" "}
                  answer. Back in a day or two.
                </span>
              ) : (
                <>
                  <span className="font-mono text-[14px] text-ink">
                    {usd(r.then)} → {usd(r.now)}{" "}
                    <span className="text-ink-muted">({pct(r.change)})</span>
                  </span>
                  <span className="font-mono text-[12px] text-ink-muted">
                    {mins(r.minutesThen)} → {mins(r.minutesNow)} minutes of work
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          Source: U.S. Bureau of Labor Statistics, Average Price Data (U.S. city average) and
          average hourly earnings of production and nonsupervisory employees. Yearly figures are the
          mean of the monthly ones. Prices are in the dollars of each year, not adjusted for
          inflation; minutes of work is the adjustment.
        </p>
      </Section>

      <Section heading="What changed">
        <Prose>
          <p>
            The wage went from {usd(s.wageThen)} to {usd(s.wageNow)} an hour. The whole basket above
            took about {Math.round(basket.then)} minutes of work in {year} and about{" "}
            {Math.round(basket.now)} in {LATEST_YEAR}.
          </p>
          {rise && (
            <p>
              The biggest price rise was {itemInProse(rise.item)}, {pct(rise.change)}, from{" "}
              {usd(rise.then)} to {usd(rise.now)}.
            </p>
          )}
          {saved && saved.minutesNow < saved.minutesThen && (
            <p>
              Measured in work, {itemInProse(saved.item)} got the most affordable: about{" "}
              {mins(saved.minutesThen)} minutes in {year}, about {mins(saved.minutesNow)} now.
            </p>
          )}
        </Prose>
        <YearShare year={year} lines={bornCardLines(s)} />
      </Section>

      <Section heading="Play with these numbers">
        <Prose>
          <p>
            <Link href="/games/price-year" className={linkClass}>
              Price Year
            </Link>{" "}
            shows five receipts like this one and asks for the year.{" "}
            <Link href="/games/then-and-now" className={linkClass}>
              Then &amp; Now
            </Link>{" "}
            asks what one item cost in an earlier year, and{" "}
            <Link href="/games/inflation-ladder" className={linkClass}>
              Inflation Ladder
            </Link>{" "}
            asks which rose the most.
          </p>
        </Prose>
      </Section>

      <FaqSection items={faq} heading={`${year} prices, answered`} />

      <Section heading="Another year">
        <YearPicker years={YEARS} initial={year} />
        <p className="flex gap-4 font-mono text-[12px] uppercase tracking-[0.14em]">
          {year > YEARS[0] && (
            <Link href={`/years/${year - 1}`} className="text-ink-muted hover:text-ink">
              ← {year - 1}
            </Link>
          )}
          <Link href="/years" className="text-ink-muted hover:text-ink">
            All years
          </Link>
          {year < LATEST_YEAR && (
            <Link href={`/years/${year + 1}`} className="text-ink-muted hover:text-ink">
              {year + 1} →
            </Link>
          )}
        </p>
      </Section>
    </ContentPage>
  );
}
