import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import ThenAndNow from "@/components/ThenAndNow";
import JsonLd from "@/components/JsonLd";
import ChallengeBanner from "@/components/ChallengeBanner";
import { breadcrumbJsonLd, dailyGameJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "A daily price-history game: here is what an everyday item costs now in U.S. cities, guess what it cost years ago. Five guesses, sourced from BLS average price data.";

export const metadata: Metadata = pageMetadata({
  path: "/games/then-and-now",
  title: "Then & Now",
  description: DESCRIPTION,
  image: "/og/game/then-and-now",
});

export default function ThenAndNowPage() {
  return (
    <ContentPage
      title="Then & Now"
      intro={
        <p>
          One item a day. You see what it averaged in U.S. cities in the latest full year; guess
          what it averaged back then. Five guesses, higher or lower after each, and within 10% wins.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Games", path: "/games" }, { name: "Then & Now" }]),
          dailyGameJsonLd({
            name: "Then & Now",
            path: "/games/then-and-now",
            description: DESCRIPTION,
            genre: ["Puzzle", "Trivia", "Educational"],
          }),
        ]}
      />
      <div className="flex flex-col gap-8 lg:pl-64">
        <ChallengeBanner game="Then & Now" />
        <ThenAndNow />
        <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
          <p>
            Every figure is from the Bureau of Labor Statistics Average Price Data, the same survey
            that feeds the Consumer Price Index. Prices are nominal dollars of the time, so the game
            is as much about how uneven inflation has been (eggs and coffee have their own stories)
            as about the general drift upward.
          </p>
        </div>
      </div>
      <Section heading="How to play">
        <Prose>
          <p>
            Each day picks one everyday item, such as a dozen eggs, a pound of ground beef or a
            pound of coffee, and shows its average price in U.S. cities in the latest full year.
            Your job is to guess what the same item averaged in an earlier year named on screen.
          </p>
          <p>
            You get five guesses. After each one the game tells you whether the real price was
            higher or lower. A guess within 10% of the historical average wins. Your result and
            streak are saved in your browser, and you can share a spoiler-free grid.
          </p>
        </Prose>
      </Section>
      <Section heading="Method and sources">
        <Prose>
          <p>
            Prices come from the Bureau of Labor Statistics Average Price Data series (CPI
            average prices for U.S. city averages). We use the annual average of the monthly
            figures for each year, in nominal dollars of the time with no inflation adjustment,
            so the gap you are guessing is the full change shoppers saw at the register.
          </p>
          <p>
            Some series start later than others or have gaps; an item only appears for years the
            BLS actually published. Because these are national city averages, a price in your
            own town may differ, which is part of what makes the guess interesting.
          </p>
        </Prose>
      </Section>
      <Section heading="More daily games">
        <Prose>
          <p>
            <Link href="/" className="underline decoration-rule underline-offset-2 hover:text-ink">Pricele (world prices)</Link>{" · "}
            <Link href="/today" className="underline decoration-rule underline-offset-2 hover:text-ink">Today hub</Link>{" · "}
            <Link href="/games/rent-ratio" className="underline decoration-rule underline-offset-2 hover:text-ink">Rent Ratio</Link>{" · "}
            <Link href="/methodology" className="underline decoration-rule underline-offset-2 hover:text-ink">Methodology</Link>
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
