import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { publishedRecapWeeks, weekLabel } from "@/lib/recap";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/games/recap",
  title: "The week in prices",
  description:
    "A weekly recap of the Pricele daily games: the dearest and cheapest prices, the countries, the rent gaps and the biggest climbers, with every answer.",
});

const linkClass =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

export default function RecapIndex() {
  const weeks = publishedRecapWeeks();
  return (
    <ContentPage
      title="The week in prices"
      intro={
        <p>
          One page per week, Monday to Sunday, covering what the daily games asked and what the
          answers were. A week goes up once its Sunday clears the two-day hold on{" "}
          <Link href="/games/answers" className={linkClass}>
            daily answers
          </Link>
          .
        </p>
      }
    >
      {weeks.length === 0 ? (
        <Prose>
          <p>
            The first recap goes up after the first full week. Until then,{" "}
            <Link href="/today" className={linkClass}>
              play today&apos;s set
            </Link>
            .
          </p>
        </Prose>
      ) : (
        <ul className="border-t border-rule">
          {weeks.map((m) => (
            <li key={m}>
              <Link
                href={`/games/recap/${m}`}
                className="block border-b border-rule-soft px-1 py-2.5 text-base text-ink-strong transition-[background-color] duration-fast ease-out hover:bg-paper-raised"
              >
                {weekLabel(m)}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Games", path: "/games" },
            { name: "Weekly recaps", path: "/games/recap" },
          ]),
        ]}
      />
    </ContentPage>
  );
}
