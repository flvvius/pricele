import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
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
    </ContentPage>
  );
}
