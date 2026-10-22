import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import PriceYear from "@/components/PriceYear";
import JsonLd from "@/components/JsonLd";
import ChallengeBanner from "@/components/ChallengeBanner";
import { breadcrumbJsonLd, dailyGameJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "A daily price history game: five receipts of real U.S. grocery and gas prices from 1980 to today. Guess the year of each and score out of 1,000. Sourced from BLS average price data.";

export const metadata: Metadata = pageMetadata({
  path: "/games/price-year",
  title: "Price Year",
  description: DESCRIPTION,
  image: "/og/game/price-year",
});

export default function PriceYearPage() {
  return (
    <ContentPage
      title="Price Year"
      intro={
        <p>
          Each receipt shows three real U.S. average prices from one year between 1980 and today.
          Slide to the year you think it is. Five receipts, up to 200 points each.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Games", path: "/games" }, { name: "Price Year" }]),
          dailyGameJsonLd({
            name: "Price Year",
            path: "/games/price-year",
            description: DESCRIPTION,
            genre: ["Puzzle", "Educational"],
          }),
        ]}
      />
      <div className="flex flex-col gap-8 lg:pl-64">
        <ChallengeBanner game="Price Year" />
        <PriceYear />
        <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
          <h2 className="display text-[1.6rem] text-ink">How to read a receipt</h2>
          <p>
            No single price gives the year away. Eggs spiked in 2015, fell back, and spiked again
            from 2022. Gas stayed under $1.40 a gallon through the 1980s and 1990s, averaged over $3
            in 2008 and over $4 in 2022. Coffee was cheaper in 1993 than in 1980. Read the three
            prices together and the year narrows fast.
          </p>
          <p>
            Every receipt is picked so that no year four or more away from the answer has similar
            prices on all three lines, so the year can be worked out, not just guessed. A guess one
            year off scores 175 of 200; eight or more years off scores nothing.
          </p>
          <h2 className="display text-[1.6rem] text-ink">Minutes of work</h2>
          <p>
            After each receipt you see how long it took to earn that basket at the average hourly
            wage for production and nonsupervisory workers, then and now. Prices have risen, but for
            most groceries pay rose faster: a pound of coffee took about 27 minutes of work in 1980
            and about 11 in 2020.
          </p>
        </div>
      </div>
    </ContentPage>
  );
}
