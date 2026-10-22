import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
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
          dailyGameJsonLd({
            name: "Rent Ratio",
            path: "/games/rent-ratio",
            description: DESCRIPTION,
            genre: ["Puzzle", "Trivia"],
          }),
        ]}
      />
      <div className="flex flex-col gap-8 lg:pl-64">
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
      </div>
      <Section heading="How to play">
        <Prose>
          <p>
            Each day brings five matchups. Every matchup shows two U.S. metropolitan areas; tap
            the one you think has the higher Fair Market Rent for a two-bedroom home. The actual
            figures for both appear as soon as you pick, so you learn as you go.
          </p>
          <p>
            Your score is how many of the five you got right. Pairs are chosen so the rents
            differ by at least $40 a month, which rules out coin flips. Results are kept
            in your browser and the share line shows only right and wrong, not the answers.
          </p>
        </Prose>
      </Section>
      <Section heading="Method and sources">
        <Prose>
          <p>
            Figures are HUD Fair Market Rents for fiscal year 2026, published annually by the U.S.
            Department of Housing and Urban Development. A Fair Market Rent is normally the 40th
            percentile gross rent (rent plus essential utilities) paid by recent movers for a
            standard-quality unit in that area, used to set Housing Choice Voucher payments.
          </p>
          <p>
            Because the method is identical everywhere, Fair Market Rents are a fair way to
            compare places, even though they sit below typical asking rents in listings.
          </p>
        </Prose>
      </Section>
      <Section heading="More daily games">
        <Prose>
          <p>
            <Link href="/" className="underline decoration-rule underline-offset-2 hover:text-ink">Pricele (world prices)</Link>{" · "}
            <Link href="/today" className="underline decoration-rule underline-offset-2 hover:text-ink">Today hub</Link>{" · "}
            <Link href="/games/then-and-now" className="underline decoration-rule underline-offset-2 hover:text-ink">Then &amp; Now</Link>{" · "}
            <Link href="/methodology" className="underline decoration-rule underline-offset-2 hover:text-ink">Methodology</Link>
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
