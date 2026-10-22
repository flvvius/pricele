import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentPage, { Section } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { answersFor, isPublishedAnswerDate, publishedAnswerDates } from "@/lib/answers";
import { isPublishedArchiveDate } from "@/lib/catalog";
import { formatArchiveDate } from "@/lib/format";
import { addDaysISO } from "@/lib/puzzle";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return publishedAnswerDates()
    .slice(0, 60)
    .map((date) => ({ date }));
}

const linkClass =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

export function generateMetadata({ params }: { params: { date: string } }): Metadata {
  if (!isPublishedAnswerDate(params.date)) return {};
  const day = formatArchiveDate(params.date);
  const [atlas] = answersFor(params.date);
  return pageMetadata({
    path: `/games/answers/${params.date}`,
    title: `Daily game answers for ${day}`,
    description: `Answers for ${day}: ${atlas.summary.replace(/ \S+\.$/, ".")} Plus Higher or Lower, Price Year, Then & Now, Open Range, Rent Ratio, Inflation Ladder and Pricele 1000, with every sourced price.`,
  });
}

export default function AnswersPage({ params }: { params: { date: string } }) {
  if (!isPublishedAnswerDate(params.date)) notFound();
  const date = params.date;
  const day = formatArchiveDate(date);
  const answers = answersFor(date);
  const older = addDaysISO(date, -1);
  const newer = addDaysISO(date, 1);

  return (
    <ContentPage
      title={`Answers for ${day}`}
      intro={
        <p>
          Every Pricele daily game from {day}, with its answer and the prices behind it. Want to
          play it first?{" "}
          <Link href="/games/archive" className={linkClass}>
            Replay this day
          </Link>{" "}
          from the archive.
          {isPublishedArchiveDate(date) && (
            <>
              {" "}
              The original Pricele puzzle has{" "}
              <Link href={`/archive/${date}`} className={linkClass}>
                its own answer page
              </Link>
              .
            </>
          )}
        </p>
      }
    >
      {answers.map((a) => (
        <Section key={a.slug} heading={`${a.name} #${a.number}`} id={a.slug}>
          <div className="flex flex-col gap-2 text-[15px] leading-relaxed text-ink-body">
            <p className="text-ink">{a.summary}</p>
            <ul className="flex flex-col gap-1 border-l border-rule pl-3.5">
              {a.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="text-[13px]">
              <Link href={`${a.href}?d=${date}`} className={linkClass}>
                Play {a.name} #{a.number}
              </Link>
              {" · "}
              <Link href={a.href} className={linkClass}>
                Today&apos;s {a.name}
              </Link>
            </p>
          </div>
        </Section>
      ))}

      <nav
        aria-label="Other days"
        className="flex justify-between gap-4 font-mono text-[12px] uppercase tracking-[0.14em]"
      >
        {isPublishedAnswerDate(older) ? (
          <Link href={`/games/answers/${older}`} className={linkClass}>
            ← {formatArchiveDate(older)}
          </Link>
        ) : (
          <span />
        )}
        <Link href="/games/answers" className={linkClass}>
          All days
        </Link>
        {isPublishedAnswerDate(newer) ? (
          <Link href={`/games/answers/${newer}`} className={linkClass}>
            {formatArchiveDate(newer)} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Games", path: "/games" },
            { name: "Answers", path: "/games/answers" },
            { name: day, path: `/games/answers/${date}` },
          ]),
        ]}
      />
    </ContentPage>
  );
}
