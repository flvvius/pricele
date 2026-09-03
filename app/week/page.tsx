import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import SharedWeekView from "@/components/SharedWeekView";
import { pageMetadata } from "@/lib/seo";

/**
 * Somebody else's week, decoded from the URL fragment.
 *
 * noindex, and it has to be: the page has no content of its own. Everything on
 * it arrives after the #, so the server renders the same empty shell every time
 * and a crawler would file a permanently blank page under a real URL. It is also
 * the only page on the site that exists to be opened once, by one person, from a
 * message.
 */
export const metadata: Metadata = pageMetadata({
  path: "/week",
  title: "A week of Pricele",
  description:
    "Someone shared their week of guesses: seven days, five bids each, and how far off they were.",
  index: false,
});

export default function WeekPage() {
  return (
    <ContentPage
      title="A week of guessing"
      intro={
        <p>
          Somebody sent you their week. The card below is built entirely from the
          link, which carries how far off they were and nothing else. No prices,
          no bids, nothing that would spoil a day you have not played.
        </p>
      }
    >
      <SharedWeekView />
    </ContentPage>
  );
}
