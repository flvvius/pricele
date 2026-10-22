import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import InflationLadder from "@/components/InflationLadder";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/games/inflation-ladder",
  title: "Inflation Ladder",
  description:
    "A daily inflation game: put four everyday U.S. groceries in order of how much their price rose since a given year. Three tries, sourced from BLS average price data.",
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
      <InflationLadder />
      <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
        <p>
          Inflation is an average, and the items inside it move very differently. Over the same
          thirty years, eggs and ground beef have more than quadrupled in price while bananas have
          barely moved. The ladder is built from the Bureau of Labor Statistics Average Price Data,
          the survey that feeds the Consumer Price Index, so every percentage is a published number.
        </p>
      </div>
    </ContentPage>
  );
}
