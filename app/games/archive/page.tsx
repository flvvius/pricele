import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";
import GameArchive from "@/components/GameArchive";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/games/archive",
  title: "Games archive",
  description:
    "Replay any past day of every Pricele daily game: Price Atlas, Higher or Lower, Price Year, Then & Now, Open Range, Rent Ratio, Inflation Ladder and Pricele 1000. Archive plays never touch your streak.",
});

export default function GamesArchivePage() {
  return (
    <ContentPage
      title="Games archive"
      intro={
        <p>
          Missed a day? Every daily game keeps its past puzzles. Archive plays are saved apart from
          today&apos;s, so they never change your streak or today&apos;s set. The original Pricele
          puzzles have{" "}
          <Link href="/archive" className="underline decoration-rule underline-offset-2">
            their own archive
          </Link>
          .
        </p>
      }
    >
      <GameArchive />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Games", path: "/games" },
            { name: "Archive", path: "/games/archive" },
          ]),
        ]}
      />
    </ContentPage>
  );
}
