import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import Pricele1000 from "@/components/Pricele1000";
import JsonLd from "@/components/JsonLd";
import GameFaq from "@/components/GameFaq";
import ChallengeBanner from "@/components/ChallengeBanner";
import { breadcrumbJsonLd, dailyGameJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "The scored version of Pricele: five prices from five countries, one guess each on a slider, scored by how close you get. Later rounds count more. Out of 1,000, new every day.";

export const metadata: Metadata = pageMetadata({
  path: "/games/pricele-1000",
  title: "Pricele 1000",
  description: DESCRIPTION,
  image: "/og/game/pricele-1000",
});

export default function Pricele1000Page() {
  return (
    <ContentPage
      title="Pricele 1000"
      intro={
        <p>
          Five items, five countries, one guess each. No hints, just a slider and a score for how
          close you land. Round three counts double and the last two count triple.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Games", path: "/games" }, { name: "Pricele 1000" }]),
          dailyGameJsonLd({
            name: "Pricele 1000",
            path: "/games/pricele-1000",
            description: DESCRIPTION,
            genre: ["Puzzle", "Educational"],
          }),
        ]}
      />
      <div className="flex flex-col gap-8 lg:pl-64">
        <ChallengeBanner game="Pricele 1000" />
        <Pricele1000 />
        <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
          <h2 className="display text-[1.6rem] text-ink">How it differs from Pricele</h2>
          <p>
            The daily Pricele gives you five tries and a hotter or colder after each, so most days
            end in a win. Here you get one shot per item and a number for how close it was. Within
            10% scores at least 81 of 100. Two players who both &quot;won&quot; Pricele can still be
            300 points apart here.
          </p>
          <p>
            The slider starts at the typical price across every country we have the item for. Your
            job is to move it the right way and the right distance for the country in front of you.
          </p>
        </div>
        <GameFaq
          name="Pricele 1000"
          description={DESCRIPTION}
          source="Prices come from The Economist's Big Mac Index, Numbeo, GlobalPetrolPrices.com and other published surveys, across 49 countries"
        />
      </div>
    </ContentPage>
  );
}
