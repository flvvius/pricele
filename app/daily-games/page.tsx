import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import {
  ALL_SIMILAR_GAMES,
  CATEGORY_LABELS,
  GENRE_DIRECTORIES,
  OTHER_DAILY_GAMES,
  PRICE_GAMES,
  type GameCategory,
  type SimilarGame,
} from "@/data/similar-games";
import { COMPARISONS } from "@/data/comparisons";
import { breadcrumbJsonLd, gameListJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

const TITLE = "Daily games like Wordle";

const DESCRIPTION =
  "A short, honest list of the daily browser games worth playing: the price-guessing ones Pricele competes with, plus the best of the word, geography and trivia dailies. Every link checked, no affiliate links.";

export const metadata: Metadata = pageMetadata({
  path: "/daily-games",
  title: TITLE,
  description: DESCRIPTION,
});

/**
 * Group the non-price games by category, preserving the order they're declared
 * in rather than the order the category keys happen to hash into. A Map keeps
 * insertion order, which is what makes this stable across builds.
 */
function byCategory(games: SimilarGame[]): Map<GameCategory, SimilarGame[]> {
  const groups = new Map<GameCategory, SimilarGame[]>();
  for (const game of games) {
    const existing = groups.get(game.category);
    if (existing) existing.push(game);
    else groups.set(game.category, [game]);
  }
  return groups;
}

/**
 * One game. Outbound links are `rel="noopener"` but deliberately **not**
 * `nofollow`: the recommendation is real, and a page that hedges every link it
 * makes is not a recommendation, it's a hedge. Nothing here is paid.
 */
function GameEntry({ game }: { game: SimilarGame }) {
  // The games we have written a full head-to-head for get a link to it. Matched
  // on URL rather than on name, since the URL is the thing that identifies a
  // game and two of these have very similar names.
  const comparison = COMPARISONS.find((c) => c.opponentUrl === game.url);

  return (
    <li className="border-b border-rule-soft px-1 py-3.5">
      <h3 className="text-lg font-bold leading-snug text-ink sm:text-xl">
        <a
          href={game.url}
          rel="noopener"
          target="_blank"
          className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-accent"
        >
          {game.name}
        </a>
      </h3>
      <p className="mt-1 text-base leading-relaxed text-ink-body">
        {game.description}
      </p>
      {game.contrast && (
        <p className="mt-1.5 text-base leading-relaxed text-ink-muted">
          <span className="label">vs. Pricele</span> {game.contrast}
        </p>
      )}
      {comparison && (
        <p className="mt-2">
          <Link
            href={`/vs/${comparison.slug}`}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent underline underline-offset-[3px]"
          >
            Full comparison &rarr;
          </Link>
        </p>
      )}
    </li>
  );
}

export default function DailyGamesPage() {
  const otherGroups = byCategory(OTHER_DAILY_GAMES);

  return (
    <ContentPage
      title={TITLE}
      intro={
        <>
          <p>
            There are something like a thousand daily browser games now, nearly
            all of them built on the same shape Wordle settled: one puzzle, a
            handful of guesses, feedback that narrows the answer, and a result
            you can post without spoiling it. This is not a list of a thousand.
            It is the ones that have lasted, one or two per genre, with the games
            closest to what we do at the top.
          </p>
          <p>
            Pricele is one of them, so treat the list accordingly — but the
            descriptions are straight, and where another game does something
            better than we do, it says so. Nothing here is sponsored and there
            are no affiliate links.
          </p>
        </>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Daily games", path: "/daily-games" }]),
          gameListJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/daily-games",
            games: ALL_SIMILAR_GAMES.map((g) => ({
              name: g.name,
              url: g.url,
              description: g.description,
            })),
          }),
        ]}
      />

      <Section heading="Price-guessing games" id="price">
        <Prose>
          <p>
            The genre Pricele sits in, and the shortest section on this page:
            price is a category with maybe a dozen games in it, against a
            hundred and fifty word games. Most of them ask what a product costs.
            Pricele asks what an everyday thing costs{" "}
            <em>in a particular country</em>, which turns out to be a different
            question — a litre of petrol is the same litre in Norway and Egypt,
            and the price is set almost entirely by politics.
          </p>
        </Prose>
        <ul className="border-t border-rule">
          {PRICE_GAMES.map((game) => (
            <GameEntry key={game.url} game={game} />
          ))}
        </ul>
        <Prose>
          <p>
            Each of these has a{" "}
            <Link
              href="/vs"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              full head-to-head comparison
            </Link>{" "}
            with Pricele: the two rulebooks side by side, a verdict on every
            dimension, and a section on what the other game does better.
          </p>
          <p>
            If you want the country angle specifically, the{" "}
            <Link
              href="/prices"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              price tables
            </Link>{" "}
            are readable without playing at all, and{" "}
            <Link
              href="/methodology"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              methodology
            </Link>{" "}
            says where each number came from and where it is weakest.
          </p>
        </Prose>
      </Section>

      {[...otherGroups].map(([category, games]) => (
        <Section
          key={category}
          heading={CATEGORY_LABELS[category]}
          id={category}
        >
          <ul className="border-t border-rule">
            {games.map((game) => (
              <GameEntry key={game.url} game={game} />
            ))}
          </ul>
        </Section>
      ))}

      <Section heading="Where to find the rest" id="directories">
        <Prose>
          <p>
            The genre is catalogued better by the people who collect it than by
            anyone writing a list like this one. If you want the full sprawl,
            including the several hundred games too niche to justify a line here,
            start with these.
          </p>
        </Prose>
        <ul className="border-t border-rule">
          {GENRE_DIRECTORIES.map((dir) => (
            <li key={dir.url} className="border-b border-rule-soft px-1 py-3.5">
              <h3 className="text-lg font-bold leading-snug text-ink">
                <a
                  href={dir.url}
                  rel="noopener"
                  target="_blank"
                  className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-accent"
                >
                  {dir.name}
                </a>
              </h3>
              <p className="mt-1 text-base leading-relaxed text-ink-body">
                {dir.note}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="What makes one of these last" id="what-lasts">
        <Prose>
          <p>
            Most daily games are abandoned within a year, and the ones above are
            the survivors, so the pattern is worth naming. The games that last
            are the ones where the answer is a fact rather than a whim: a
            country&apos;s outline, a published price, the year a photograph was
            taken. That gives the puzzle somewhere to come from tomorrow, and it
            gives a player something to be right about.
          </p>
          <p>
            The ones that die are usually the ones where the daily answer was
            hand-picked. That works for a few weeks and then it is a second job.
            Pricele&apos;s answer is a{" "}
            <Link
              href="/methodology"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              published figure
            </Link>{" "}
            with a source attached, and the rotation is arithmetic, which is the
            whole reason it can keep going without anyone deciding anything each
            morning.
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
