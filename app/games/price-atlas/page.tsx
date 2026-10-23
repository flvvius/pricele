import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import PriceAtlas from "@/components/PriceAtlas";
import JsonLd from "@/components/JsonLd";
import GameFaq from "@/components/GameFaq";
import ChallengeBanner from "@/components/ChallengeBanner";
import { breadcrumbJsonLd, dailyGameJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "A daily geography game played with prices: see a basket of everyday prices from a mystery country and name it in six guesses, with distance and price-level clues after each miss and a compass arrow for the last guesses.";

export const metadata: Metadata = pageMetadata({
  path: "/games/price-atlas",
  title: "Price Atlas",
  description: DESCRIPTION,
  image: "/og/game/price-atlas",
});

export default function PriceAtlasPage() {
  return (
    <ContentPage
      title="Price Atlas"
      intro={
        <p>
          A basket of everyday prices from one mystery country. Name the country in six guesses.
          Each miss tells you how far away you are and whether prices there are higher or lower,
          and adds another price to the basket. From the fourth guess you also get a compass arrow.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Games", path: "/games" }, { name: "Price Atlas" }]),
          dailyGameJsonLd({
            name: "Price Atlas",
            path: "/games/price-atlas",
            description: DESCRIPTION,
            genre: ["Puzzle", "Geography", "Educational"],
          }),
        ]}
      />
      <div className="flex flex-col gap-8 lg:pl-64">
        <ChallengeBanner game="Price Atlas" />
        <PriceAtlas />
        <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
          <p>
            If you play Worldle or Globle, the distance will feel familiar. The difference
            is the clue: instead of a map outline you get what a Big Mac, a cappuccino or a litre of
            petrol costs there. Cheap petrol points to an oil producer, dear beer to high alcohol
            duty, and a cheap Big Mac to a weak currency. The price comparison after each guess is
            the typical gap across every item both countries have. The compass arrow is held back
            until the fourth guess on purpose: with it from the start, two guesses and a map solved
            the puzzle and the prices stopped mattering.
          </p>
        </div>
        <GameFaq
          name="Price Atlas"
          description={DESCRIPTION}
          source="Prices come from The Economist's Big Mac Index, Numbeo, GlobalPetrolPrices.com and other published surveys, across 61 countries"
        />
      </div>
    </ContentPage>
  );
}
