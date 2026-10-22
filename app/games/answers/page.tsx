import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { publishedAnswerDates } from "@/lib/answers";
import { formatArchiveDate } from "@/lib/format";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/games/answers",
  title: "Daily game answers",
  description:
    "Past answers for every Pricele daily game: Price Atlas, Higher or Lower, Price Year, Then & Now, Open Range, Rent Ratio, Inflation Ladder and Pricele 1000. Each day is published two days later.",
});

const linkClass =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

export default function AnswersIndex() {
  const dates = publishedAnswerDates();
  return (
    <ContentPage
      title="Daily game answers"
      intro={
        <p>
          The answers to every daily game, one page per day. A day goes up two days after it ends,
          once it has finished in every time zone, so today&apos;s answers stay in the games. To
          play a past day instead, use the{" "}
          <Link href="/games/archive" className={linkClass}>
            games archive
          </Link>
          .
        </p>
      }
    >
      {dates.length === 0 ? (
        <Prose>
          <p>
            The first day&apos;s answers go up soon. Until then,{" "}
            <Link href="/today" className={linkClass}>
              play today&apos;s set
            </Link>
            .
          </p>
        </Prose>
      ) : (
        <ul className="border-t border-rule">
          {dates.map((d) => (
            <li key={d}>
              <Link
                href={`/games/answers/${d}`}
                className="block border-b border-rule-soft px-1 py-2.5 text-base text-ink-strong transition-[background-color] duration-fast ease-out hover:bg-paper-raised"
              >
                {formatArchiveDate(d)}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Games", path: "/games" },
            { name: "Answers", path: "/games/answers" },
          ]),
        ]}
      />
    </ContentPage>
  );
}
