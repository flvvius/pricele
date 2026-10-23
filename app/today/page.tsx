import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import TodayHub from "@/components/TodayHub";
import JsonLd from "@/components/JsonLd";
import { GAMES } from "@/lib/games";
import { absoluteUrl, breadcrumbJsonLd, gameListJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/today",
  image: "/og/game/hub",
  title: "Today's daily games",
  description:
    "Every Pricele daily game in one place: what you have played today, one streak across all games, and a single share line for the whole set.",
});

const linkClass = "underline decoration-rule underline-offset-2 hover:text-ink";

export default function TodayPage() {
  return (
    <ContentPage
      title="Today"
      intro={<p>Today&apos;s daily set. Finish at least one game a day to keep your streak.</p>}
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Today" }]),
          gameListJsonLd({
            name: "Today's daily games",
            description: "Every Pricele daily game, with one streak across all of them.",
            path: "/today",
            games: GAMES.map((g) => ({
              name: g.name,
              url: absoluteUrl(g.href),
              description: g.blurb,
            })),
          }),
        ]}
      />
      <div className="lg:pl-64">
        <TodayHub />
        <noscript>
          <ul className="flex flex-col gap-2">
            {GAMES.map((g) => (
              <li key={g.slug}>
                <Link href={g.href} className="underline underline-offset-2">
                  {g.name}
                </Link>
                : {g.blurb}
              </li>
            ))}
          </ul>
        </noscript>
      </div>
      <Section heading="How to play">
        <Prose>
          <p>
            Today collects all {GAMES.length} Pricele daily games. Each card shows whether you have
            played today and links straight to the game. Finish at least one game on a given day to
            keep your shared streak alive.
          </p>
          <p>
            When you are done, copy the combined share line to post your whole set at once. It shows
            your results as emoji and never reveals an answer.
          </p>
        </Prose>
      </Section>
      <Section heading="Method and sources">
        <Prose>
          <p>
            Each game has its own source: {GAMES.map((g) => `${g.name} (${g.source})`).join(", ")}.
            Every game resets at midnight in your own time zone.
          </p>
          <p>
            Progress is stored only in your browser, so clearing site data resets your streak. The{" "}
            <Link href="/methodology" className={linkClass}>
              methodology
            </Link>{" "}
            page explains how each data set is converted and dated. Missed a day? Replay it from the{" "}
            <Link href="/games/archive" className={linkClass}>
              games archive
            </Link>{" "}
            or check the{" "}
            <Link href="/games/answers" className={linkClass}>
              past answers
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
