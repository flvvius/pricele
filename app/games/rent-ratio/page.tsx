import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import RentRatio from "@/components/RentRatio";
import JsonLd from "@/components/JsonLd";
import ChallengeBanner from "@/components/ChallengeBanner";
import { breadcrumbJsonLd, dailyGameJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "A daily rent game: five pairs of U.S. metro areas, pick the one with the higher HUD fair market rent for a two-bedroom. Sourced from HUD FY2026 Fair Market Rents.";

export const metadata: Metadata = pageMetadata({
  path: "/games/rent-ratio",
  title: "Rent Ratio",
  description: DESCRIPTION,
  image: "/og/game/rent-ratio",
});

export default function RentRatioPage() {
  return (
    <ContentPage
      title="Rent Ratio"
      intro={
        <p>
          Five matchups a day. Each one pits two U.S. metro areas against each other: which has the
          higher HUD fair market rent for a two-bedroom? The numbers appear after you pick.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Games", path: "/games" }, { name: "Rent Ratio" }]),
          dailyGameJsonLd({ name: "Rent Ratio", path: "/games/rent-ratio", description: DESCRIPTION, genre: ["Puzzle", "Trivia"] }),
        ]}
      />
      <ChallengeBanner game="Rent Ratio" />
      <RentRatio />
      <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
        <p>
          Every figure is a HUD Fair Market Rent for fiscal year 2026, published by the Department
          of Housing and Urban Development to set Housing Choice Voucher payment standards. Fair
          market rents include essential utilities and sit below the typical asking rent, so treat
          them as a consistent yardstick between places rather than what a listing will say.
        </p>
      </div>
    </ContentPage>
  );
}
