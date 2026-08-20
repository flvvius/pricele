import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import ComparisonTable from "@/components/ComparisonTable";
import FaqSection from "@/components/FaqSection";
import JsonLd from "@/components/JsonLd";
import { COMPARISONS, getComparison, type Comparison } from "@/data/comparisons";
import { formatArchiveDate } from "@/lib/format";
import {
  SITE_NAME,
  SITE_URL,
  breadcrumbJsonLd,
  faqJsonLd,
  gameJsonLd,
  gameListJsonLd,
  pageMetadata,
  webPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

/**
 * One page per competitor: /vs/costcodle, /vs/spendle and so on.
 *
 * The whole page is built from `data/comparisons.ts`, including the tally under
 * the table, so there is no copy here that can contradict the data. The rules
 * about what may be said about a competitor live in that file's header, and
 * they are the important part of this feature.
 *
 * The page shape is deliberate and is the same on every comparison: the verdict
 * first, then the table, then the two "where they win" / "where we win" lists,
 * then the recommendation, then the FAQ. Extractive summarisers overwhelmingly
 * take the answer from the top of a document, which is why the verdict is a
 * standalone 40-60 word paragraph carrying `data-answer` rather than an
 * introduction to the page.
 */

function title(c: Comparison): string {
  return `${SITE_NAME} vs ${c.opponent}`;
}

function description(c: Comparison): string {
  return `${SITE_NAME} and ${c.opponent} compared dimension by dimension: rules, guesses, where each game's prices come from, and which one to play. Checked against the live game, and honest about what ${c.opponent} does better.`;
}

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const comparison = getComparison(params.slug);
  if (!comparison) return {};
  return pageMetadata({
    path: `/vs/${comparison.slug}`,
    title: title(comparison),
    description: description(comparison),
  });
}

/** A bulleted case, used for both "where they win" and "where we win". */
function Case({ heading, points }: { heading: string; points: readonly string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="label">{heading}</h3>
      <ul className="flex flex-col border-t border-rule">
        {points.map((point) => (
          <li
            key={point}
            className="border-b border-rule-soft px-1 py-2.5 text-[14px] leading-relaxed text-ink-body"
          >
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ComparisonPage({
  params,
}: {
  params: { slug: string };
}) {
  const comparison = getComparison(params.slug);
  if (!comparison) notFound();

  const path = `/vs/${comparison.slug}`;
  const heading = title(comparison);

  return (
    <ContentPage
      title={heading}
      intro={
        <>
          {/* The direct answer. Kept to one paragraph, naming both games and
              saying who each is for, because this is the text that gets lifted
              out of the page. `data-answer` is what the page's `speakable`
              selector points at. */}
          <p>{comparison.verdict}</p>
          <p className="text-ink-meta">
            Written by {SITE_NAME}, so read the tally accordingly &mdash; but
            every figure below was checked against {comparison.opponent} itself
            on {" "}
            <time dateTime={comparison.checked}>
              {formatArchiveDate(comparison.checked)}
            </time>
            , and the page says where {comparison.opponent} wins. Nothing here
            is sponsored and there are no affiliate links.
          </p>
        </>
      }
    >
      <JsonLd
        data={[
          webPageJsonLd({
            name: heading,
            description: description(comparison),
            path,
            dateModified: comparison.checked,
          }),
          breadcrumbJsonLd([
            { name: "Comparisons", path: "/vs" },
            { name: heading, path },
          ]),
          // The two games as a list, so the page parses as a comparison of two
          // named things with URLs rather than as an article mentioning them.
          gameListJsonLd({
            name: heading,
            description: description(comparison),
            path,
            games: [
              {
                // Absolute, like every other URL in a graph on this site:
                // gameListJsonLd emits `url` verbatim, and a site-relative one
                // in JSON-LD has no base to resolve against.
                name: SITE_NAME,
                url: SITE_URL,
                description: comparison.pickOurs,
              },
              {
                name: comparison.opponent,
                url: comparison.opponentUrl,
                description: comparison.pickTheirs,
              },
            ],
          }),
          gameJsonLd(),
          faqJsonLd(comparison.faqs),
        ]}
      />

      <Section heading="Side by side" id="table">
        <ComparisonTable comparison={comparison} />
      </Section>

      <Section heading={`Where ${comparison.opponent} wins`} id="theirs">
        <Case
          heading={`${comparison.opponent} does this better`}
          points={comparison.theirStrengths}
        />
        <Prose>
          <p>
            <a
              href={comparison.opponentUrl}
              rel="noopener"
              target="_blank"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-accent"
            >
              Play {comparison.opponent}
            </a>{" "}
            and judge for yourself. The link is not affiliated and the
            recommendation is real.
          </p>
        </Prose>
      </Section>

      <Section heading={`Where ${SITE_NAME} wins`} id="ours">
        <Case heading={`${SITE_NAME} does this better`} points={comparison.ourStrengths} />
      </Section>

      <Section heading="Which should you play" id="verdict">
        <Prose>
          <p>
            <strong className="text-ink-strong">
              Play {comparison.opponent} if:
            </strong>{" "}
            {comparison.pickTheirs}
          </p>
          <p>
            <strong className="text-ink-strong">Play {SITE_NAME} if:</strong>{" "}
            {comparison.pickOurs}
          </p>
          <p>
            Or both. They take about a minute each and they are not competing
            for the same minute of your day so much as this page implies.{" "}
            <Link
              href="/daily-games"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              The full list of daily games
            </Link>{" "}
            has the rest of the genre, and{" "}
            <Link
              href="/methodology"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              methodology
            </Link>{" "}
            says where our own numbers are weakest.
          </p>
        </Prose>
      </Section>

      <FaqSection items={comparison.faqs} />

      <Section heading="Other comparisons" id="others">
        <ul className="border-t border-rule">
          {COMPARISONS.filter((c) => c.slug !== comparison.slug).map((c) => (
            <li key={c.slug} className="border-b border-rule-soft">
              <Link
                href={`/vs/${c.slug}`}
                className="flex items-baseline justify-between gap-3 px-1 py-2.5 transition-[background-color] duration-fast ease-out hover:bg-paper-raised"
              >
                <span className="text-[14px] text-ink-body">{title(c)}</span>
                <span className="label shrink-0">Compare</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </ContentPage>
  );
}
