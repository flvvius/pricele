import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { COMPARISONS, tally } from "@/data/comparisons";
import {
  SITE_NAME,
  breadcrumbJsonLd,
  gameListJsonLd,
  pageMetadata,
  webPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

const TITLE = `${SITE_NAME} compared with every other price game`;

const DESCRIPTION = `Head-to-head comparisons between ${SITE_NAME} and the ${COMPARISONS.length} other price-guessing games worth playing: rules, guesses, where each game's prices come from, and which to play. Every figure checked against the live game, and each page says where the other game wins.`;

export const metadata: Metadata = pageMetadata({
  path: "/vs",
  title: TITLE,
  description: DESCRIPTION,
});

/**
 * The index of the comparison pages.
 *
 * `/daily-games` lists the genre. This lists the arguments: one page per
 * competitor, each adjudicating a table of matched dimensions. The two pages
 * answer different questions and should stay separate — "what else is there"
 * and "which of these two should I play" are asked by different people, and
 * merging them produces a page that answers neither well.
 */
export default function ComparisonsIndexPage() {
  // The newest check across all the comparisons: what "last verified" means for
  // the index as a whole. Derived, so it cannot claim a freshness the pages
  // themselves do not have.
  const lastChecked = COMPARISONS.map((c) => c.checked).sort().at(-1);

  return (
    <ContentPage
      title="Comparisons"
      intro={
        <>
          <p>
            {SITE_NAME} is one of about a dozen daily price-guessing games.
            These are the {COMPARISONS.length} worth comparing it against, one
            page each, with the rules of both games set out side by side and a
            verdict on every dimension. Every fact about the other game was
            checked by playing it, not taken from its marketing copy.
          </p>
          <p className="text-ink-meta">
            We wrote these, so we are not a neutral party and the pages say so.
            What we can promise is that each one names at least one thing the
            other game does better, that a dimension nobody verified is marked
            unverified rather than guessed at, and that no link on any of them
            is sponsored or affiliated.
          </p>
        </>
      }
    >
      <JsonLd
        data={[
          webPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/vs",
            dateModified: lastChecked,
          }),
          breadcrumbJsonLd([{ name: "Comparisons", path: "/vs" }]),
          gameListJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/vs",
            games: COMPARISONS.map((c) => ({
              name: c.opponent,
              url: c.opponentUrl,
              description: c.pickTheirs,
            })),
          }),
        ]}
      />

      <Section heading="The comparisons" id="list">
        <ul className="border-t border-rule">
          {COMPARISONS.map((c) => {
            const counts = tally(c);
            return (
              <li key={c.slug} className="border-b border-rule-soft">
                <Link
                  href={`/vs/${c.slug}`}
                  className="flex flex-col gap-1.5 px-1 py-3.5 transition-[background-color] duration-fast ease-out hover:bg-paper-raised"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-lg font-bold leading-snug text-ink sm:text-xl">
                      {SITE_NAME} vs {c.opponent}
                    </span>
                    {/* The tally, so the index is honest about the shape of
                        each page before you open it. */}
                    <span className="label shrink-0">
                      {counts.ours}&ndash;{counts.theirs}&ndash;{counts.even}
                    </span>
                  </span>
                  <span className="text-base leading-relaxed text-ink-body">
                    {c.verdict}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <Prose>
          <p>
            The three figures beside each comparison are the tally of verified
            dimensions: how many favour {SITE_NAME}, how many favour the other
            game, and how many are level. They are counted from the tables
            rather than written down, so they move when a table does.
          </p>
        </Prose>
      </Section>

      <Section heading="What these pages are not" id="caveats">
        <Prose>
          <p>
            They are not reviews. Every game listed here is free, made by a
            small team or one person, and worth an evening; the question a
            comparison page answers is which one suits you, not which one is
            good. All of them are good enough that the genre exists.
          </p>
          <p>
            They are also not permanent. Daily games change their rules, add
            modes and occasionally stop being maintained. Each page carries the
            date its facts were last checked against the live game, and if a
            row here disagrees with what you see when you go and play, the
            other game is right and we are out of date &mdash;{" "}
            <Link
              href="/contact"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              tell us
            </Link>{" "}
            and we will fix it.
          </p>
          <p>
            For the wider genre rather than the direct competitors, the{" "}
            <Link
              href="/daily-games"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              list of daily games
            </Link>{" "}
            covers the word, geography and trivia dailies too.
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
