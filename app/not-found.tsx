import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";

/**
 * The 404 page, for both unmatched URLs and the notFound() calls in the
 * archive, item, country and article routes.
 *
 * The point of the file is what it does *not* say: no canonical. Before it
 * existed the layout's canonical was inherited here, so every 404 on the site
 * announced itself as a copy of the home page — a duplicate signal sent by
 * pages that should be telling Google nothing at all.
 *
 * The noindex below is belt and braces; Next emits one of its own for this
 * boundary. Two identical directives cost nothing, and pinning it here means a
 * change in that behaviour can't quietly make 404s indexable.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <ContentPage
      title="Page not found"
      intro={
        <p>
          There is nothing at this address. It may have been a typo, or a link
          to a puzzle that has not entered the archive yet.
        </p>
      }
    >
      <Section heading="Where to go instead">
        <Prose>
          <ul>
            <li>
              <Link href="/">Today&apos;s puzzle</Link> — a new item and country
              every day.
            </li>
            <li>
              <Link href="/archive">The archive</Link> — every past puzzle with
              its answer. Puzzles from the last couple of days are held back
              until the day has finished everywhere.
            </li>
            <li>
              <Link href="/prices">Prices by country</Link> and{" "}
              <Link href="/items">prices by item</Link> — the full tables behind
              the game.
            </li>
            <li>
              <Link href="/blog">Guides</Link> — longer pieces on what everyday
              prices actually measure.
            </li>
          </ul>
        </Prose>
      </Section>
    </ContentPage>
  );
}
