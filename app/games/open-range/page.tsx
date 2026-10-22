import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import OpenRange from "@/components/OpenRange";
import JsonLd from "@/components/JsonLd";
import ChallengeBanner from "@/components/ChallengeBanner";
import { breadcrumbJsonLd, dailyGameJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "A daily estimation game: give a price range for five everyday items in five countries. A hit scores more the narrower it is, a miss scores nothing. Score out of 500.";

export const metadata: Metadata = pageMetadata({
  path: "/games/open-range",
  title: "Open Range",
  description: DESCRIPTION,
  image: "/og/game/open-range",
});

export default function OpenRangePage() {
  return (
    <ContentPage
      title="Open Range"
      intro={
        <p>
          Five prices, each from a different country. Give a low and a high. If the real price lands
          inside, you score up to 100 points, more the narrower your range.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Games", path: "/games" }, { name: "Open Range" }]),
          dailyGameJsonLd({
            name: "Open Range",
            path: "/games/open-range",
            description: DESCRIPTION,
            genre: ["Puzzle", "Educational"],
          }),
        ]}
      />
      <div className="flex flex-col gap-8 lg:pl-64">
        <ChallengeBanner game="Open Range" />
        <OpenRange />
        <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
          <h2 className="display text-[1.6rem] text-ink">How scoring works</h2>
          <p>
            Width is the high divided by the low. A range of $2 to $4 is 2x wide and scores 67 if it
            lands. A 1.25x range scores 89. A range 8x wide or more scores the minimum of 10, and
            ranges wider than 12x are not allowed. A miss scores 0 however close it was, though we
            tell you how close.
          </p>
          <p>
            The skill here is knowing how sure you are. A range from the typical price divided by
            1.5 to the typical price times 1.5 lands about three times in five. Knowing that
            Switzerland runs dear and Egypt runs cheap is what lets you tighten the range.
          </p>
        </div>
      </div>
    </ContentPage>
  );
}
