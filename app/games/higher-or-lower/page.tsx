import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";
import PriceChain from "@/components/PriceChain";
import JsonLd from "@/components/JsonLd";
import GameFaq from "@/components/GameFaq";
import ChallengeBanner from "@/components/ChallengeBanner";
import { breadcrumbJsonLd, dailyGameJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "A daily higher or lower game with real prices: a chain of ten everyday items from around the world. Call whether each price is higher or lower than the last, then share your score.";

export const metadata: Metadata = pageMetadata({
  path: "/games/higher-or-lower",
  title: "Higher or Lower Daily",
  description: DESCRIPTION,
  image: "/og/game/higher-or-lower",
});

export default function HigherOrLowerDailyPage() {
  return (
    <ContentPage
      title="Higher or Lower Daily"
      intro={
        <p>
          Ten prices in a chain, the same chain for everyone today. You see one price and the next
          item; call whether the next one costs more or less. Nine calls, one score.
        </p>
      }
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Games", path: "/games" }, { name: "Higher or Lower Daily" }]),
          dailyGameJsonLd({
            name: "Higher or Lower Daily",
            path: "/games/higher-or-lower",
            description: DESCRIPTION,
            genre: ["Puzzle", "Trivia"],
          }),
        ]}
      />
      <div className="flex flex-col gap-8 lg:pl-64">
        <ChallengeBanner game="Higher or Lower Daily" />
        <PriceChain />
        <div className="flex max-w-prose flex-col gap-3.5 text-[16px] leading-[1.7] text-ink-body">
          <p>
            The chain crosses items and countries, so a call is rarely as simple as &quot;Norway is
            expensive&quot;. A Big Mac costs more in Uruguay than in Norway, and a pack of
            cigarettes in Australia, at over $24, is the dearest pack in the table. If you want to keep going after
            today&apos;s nine calls, the{" "}
            <Link href="/higher-or-lower" className="underline decoration-rule underline-offset-2">
              unlimited higher or lower
            </Link>{" "}
            runs until you miss.
          </p>
        </div>
        <GameFaq
          name="Higher or Lower Daily"
          description={DESCRIPTION}
          source="Prices come from The Economist's Big Mac Index, Numbeo, GlobalPetrolPrices.com and other published surveys, across 61 countries"
        />
      </div>
    </ContentPage>
  );
}
