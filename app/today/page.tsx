import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import TodayHub from "@/components/TodayHub";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/today",
  image: "/og/game/hub",
  title: "Today's daily games",
  description:
    "Every Pricele daily game in one place: what you have played today, one streak across all games, and a single share line for the whole set.",
});

export default function TodayPage() {
  return (
    <ContentPage
      title="Today"
      intro={<p>Today&apos;s daily set. Finish at least one game a day to keep your streak.</p>}
    >
      <TodayHub />
    </ContentPage>
  );
}
