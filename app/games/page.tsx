import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import GameGrid from "@/components/GameGrid";
import JsonLd from "@/components/JsonLd";
import { GAMES } from "@/lib/games";
import { absoluteUrl, breadcrumbJsonLd, gameListJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

const TITLE = "Daily games about real prices";
const DESCRIPTION =
  "Every Pricele daily game in one place: guess prices around the world, what groceries cost decades ago, which U.S. metro has the higher rent, and how much prices have risen. Free, no sign-up, every number sourced.";

export const metadata: Metadata = pageMetadata({
  path: "/games",
  image: "/og/game/hub",
  title: TITLE,
  description: DESCRIPTION,
});

const linkClass =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

export default function GamesPage() {
  return (
    <ContentPage
      title="All games"
      intro={
        <p>
          {GAMES.length} free daily games, each built on a published number: a price, a rent, a
          price rise. One puzzle per game per day, new at your local midnight, and one streak across
          all of them.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Games", path: "/games" }]),
          gameListJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/games",
            games: GAMES.map((g) => ({
              name: g.name,
              url: absoluteUrl(g.href),
              description: g.blurb,
            })),
          }),
        ]}
      />
      <GameGrid />
      <Section heading="Play them as a set" id="set">
        <Prose>
          <p>
            <Link href="/today" className={linkClass}>
              Today
            </Link>{" "}
            shows which of today&apos;s games you have finished, keeps a streak for every day you
            finish at least one, and gives you one share line for the whole set.
          </p>
        </Prose>
      </Section>
      <Section heading="More ways to play" id="unlimited">
        <Prose>
          <p>
            <Link href="/games/pricele-1000" className={linkClass}>
              Pricele 1000
            </Link>{" "}
            is the daily Pricele without hints: five prices, one guess each, scored out of 1,000.
          </p>
          <p>
            Missed a day? The{" "}
            <Link href="/games/archive" className={linkClass}>
              games archive
            </Link>{" "}
            replays any past puzzle without touching your streak.
          </p>
          <p>
            The daily games stop after one round on purpose. If you want to keep going, try{" "}
            <Link href="/higher-or-lower" className={linkClass}>
              Higher or lower
            </Link>
            , which pits two prices against each other until you miss, or{" "}
            <Link href="/where-in-the-world" className={linkClass}>
              Where in the world
            </Link>
            , where you name the country from a basket of its prices. Teachers can run any round
            with a whole class from the{" "}
            <Link href="/classroom" className={linkClass}>
              classroom
            </Link>{" "}
            page.
          </p>
          <p>
            Not a game, but made from the same numbers:{" "}
            <Link href="/years" className={linkClass}>
              prices the year you were born
            </Link>
            , every year from 1980, in dollars and in minutes of work.
          </p>
        </Prose>
      </Section>
      <Section heading="Questions" id="questions">
        <Prose>
          <h3 className="font-bold text-ink">Are these games free?</h3>
          <p>
            Yes. There is no account, no download and no paywall. Your results and streaks stay in
            your own browser.
          </p>
          <h3 className="font-bold text-ink">How long does the whole set take?</h3>
          <p>
            About {GAMES.reduce((n, g) => n + g.minutes, 0)} minutes for all {GAMES.length}. Each
            game is one short puzzle, so you can also play one and come back tomorrow.
          </p>
          <h3 className="font-bold text-ink">Where do the numbers come from?</h3>
          <p>
            Every answer is a published figure: world prices from sources such as The
            Economist&apos;s Big Mac Index and Numbeo, U.S. price history from the Bureau of Labor
            Statistics, and rents from HUD. The{" "}
            <Link href="/methodology" className={linkClass}>
              methodology
            </Link>{" "}
            and{" "}
            <Link href="/data" className={linkClass}>
              data
            </Link>{" "}
            pages list each source and its licence.
          </p>
          <h3 className="font-bold text-ink">What if I like Wordle, Worldle or Costcodle?</h3>
          <p>
            Price Atlas plays like Worldle with prices in place of a map outline. Pricele and Then
            &amp; Now are closest to Costcodle. For daily games made by other people, see{" "}
            <Link href="/daily-games" className={linkClass}>
              daily games like Wordle
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
