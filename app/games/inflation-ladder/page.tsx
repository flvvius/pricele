import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import InflationLadder from "@/components/InflationLadder";
import JsonLd from "@/components/JsonLd";
import GameFaq from "@/components/GameFaq";
import ChallengeBanner from "@/components/ChallengeBanner";
import { breadcrumbJsonLd, dailyGameJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "A daily inflation game: put four everyday U.S. groceries in order of how much their price rose since a given year. Three tries, sourced from BLS average price data.";

export const metadata: Metadata = pageMetadata({
  path: "/games/inflation-ladder",
  title: "Inflation Ladder",
  description: DESCRIPTION,
  image: "/og/game/inflation-ladder",
});

export default function InflationLadderPage() {
  return (
    <ContentPage
      title="Inflation Ladder"
      intro={
        <p>
          Four items, one starting year. Sort them from the biggest price rise to the smallest. You
          get three tries, and after each one you see which rungs are right.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Games", path: "/games" }, { name: "Inflation Ladder" }]),
          dailyGameJsonLd({
            name: "Inflation Ladder",
            path: "/games/inflation-ladder",
            description: DESCRIPTION,
            genre: ["Puzzle", "Educational"],
          }),
        ]}
      />
      <div className="flex flex-col gap-8 lg:pl-64">
        <ChallengeBanner game="Inflation Ladder" />
        <InflationLadder />
        <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
          <p>
            Inflation is an average, and the items inside it move very differently. Over the same
            thirty years, eggs and ground beef have more than quadrupled in price while bananas have
            barely moved. The ladder is built from the Bureau of Labor Statistics Average Price Data,
            the survey that feeds the Consumer Price Index, so every percentage is a published number.
          </p>
        </div>
        <GameFaq
          name="Inflation Ladder"
          description={DESCRIPTION}
          source="Prices are U.S. city averages from the Bureau of Labor Statistics average price series"
        />
      </div>
    </ContentPage>
  );
}
