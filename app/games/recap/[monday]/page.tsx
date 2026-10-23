import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentPage, { Section } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { formatArchiveDate, formatUSD } from "@/lib/format";
import { addDaysISO } from "@/lib/puzzle";
import { isPublishedRecapWeek, publishedRecapWeeks, recapFor, weekLabel } from "@/lib/recap";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return publishedRecapWeeks()
    .slice(0, 26)
    .map((monday) => ({ monday }));
}

const linkClass =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

export function generateMetadata({ params }: { params: { monday: string } }): Metadata {
  if (!isPublishedRecapWeek(params.monday)) return {};
  const [first] = recapFor(params.monday).highlights;
  return pageMetadata({
    path: `/games/recap/${params.monday}`,
    title: `Pricele week in prices: ${weekLabel(params.monday)}`,
    description: `${first} Every answer from the week's price games, day by day.`,
  });
}

export default function RecapPage({ params }: { params: { monday: string } }) {
  if (!isPublishedRecapWeek(params.monday)) notFound();
  const { monday, days, highlights } = recapFor(params.monday);
  const label = weekLabel(monday);
  const older = addDaysISO(monday, -7);
  const newer = addDaysISO(monday, 7);

  return (
    <ContentPage
      title="The week in prices"
      intro={
        <p>
          {label}: what the Pricele games asked, and what the answers were. Each day links to its
          full answer page, and you can replay any of them from the{" "}
          <Link href="/games/archive" className={linkClass}>
            games archive
          </Link>
          .
        </p>
      }
    >
      <Section heading="Highlights" id="highlights">
        <ul className="flex flex-col gap-3 text-[16px] leading-relaxed text-ink-body">
          {highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </Section>

      {days.map((d) => (
        <Section key={d.date} heading={formatArchiveDate(d.date)} id={d.date}>
          <div className="flex flex-col gap-2 text-[15px] leading-relaxed text-ink-body">
            {d.pricele && (
              <p className="text-ink">
                Pricele: {d.pricele.item} in {d.pricele.flag} {d.pricele.country},{" "}
                {formatUSD(d.pricele.priceUSD)}.{" "}
                <Link href={`/archive/${d.date}`} className={linkClass}>
                  Answer page
                </Link>
              </p>
            )}
            <ul className="flex flex-col gap-1 border-l border-rule pl-3.5">
              {d.answers.map((a) => (
                <li key={a.slug}>
                  <span className="text-ink">{a.name}:</span> {a.summary}
                </li>
              ))}
            </ul>
            <p className="text-[13px]">
              <Link href={`/games/answers/${d.date}`} className={linkClass}>
                Every price from {formatArchiveDate(d.date)}
              </Link>
            </p>
          </div>
        </Section>
      ))}

      <nav
        aria-label="Other weeks"
        className="flex justify-between gap-4 font-mono text-[12px] uppercase tracking-[0.14em]"
      >
        {isPublishedRecapWeek(older) ? (
          <Link href={`/games/recap/${older}`} className={linkClass}>
            ← Previous week
          </Link>
        ) : (
          <span />
        )}
        <Link href="/games/recap" className={linkClass}>
          All weeks
        </Link>
        {isPublishedRecapWeek(newer) ? (
          <Link href={`/games/recap/${newer}`} className={linkClass}>
            Next week →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Games", path: "/games" },
            { name: "Weekly recaps", path: "/games/recap" },
            { name: label, path: `/games/recap/${monday}` },
          ]),
        ]}
      />
    </ContentPage>
  );
}
