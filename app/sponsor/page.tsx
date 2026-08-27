import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { COUNTRIES } from "@/lib/catalog";
import { PRICES } from "@/lib/puzzle";
import { ITEMS } from "@/data/items";
import { PUBLISHED_ARTICLES } from "@/data/articles";
import {
  breadcrumbJsonLd,
  pageMetadata,
  SITE_EMAIL,
  SITE_NAME,
  webPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

const DESCRIPTION = `Sponsorship on ${SITE_NAME}: who reads it, what can be bought, and what is refused outright.`;

export const metadata: Metadata = pageMetadata({
  path: "/sponsor",
  title: "Sponsorship",
  description: DESCRIPTION,
});

const OUT =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

export default function SponsorPage() {
  return (
    <ContentPage
      title="Sponsorship"
      intro={
        <>
          <p data-answer>
            {SITE_NAME} takes sponsorship, within limits it will not move. This
            page is the whole offer: what the site is, who reads it, what a
            sponsor gets, and what is refused however much they pay.
          </p>
          <p>
            The short version of the limit: the prices are not for sale. Nothing
            else here is worth anything if they are.
          </p>
        </>
      }
    >
      <JsonLd
        data={[
          webPageJsonLd({
            name: "Sponsorship",
            description: DESCRIPTION,
            path: "/sponsor",
          }),
          breadcrumbJsonLd([
            { name: SITE_NAME, path: "/" },
            { name: "Sponsorship", path: "/sponsor" },
          ]),
        ]}
      />

      <Section heading="What this is">
        <Prose>
          <p>
            A daily game that pairs one everyday item with one country and asks
            what it costs there. Around it sit {COUNTRIES.length} country pages
            and {ITEMS.length} item pages built from{" "}
            {PRICES.length.toLocaleString("en-US")} sourced price rows, plus{" "}
            {PUBLISHED_ARTICLES.length} long reads on what prices actually
            measure and a{" "}
            <Link href="/methodology" className={OUT}>
              methodology
            </Link>{" "}
            page naming every source and its refresh interval.
          </p>
          <p>
            Every figure carries the source it came from and the date it was
            collected, printed next to the number rather than buried. That is
            the whole proposition, and it is why the audience is worth
            something.
          </p>
        </Prose>
      </Section>

      <Section heading="Who reads it">
        <Prose>
          <p>
            Players who come back daily out of habit, and a much larger group
            arriving from search on a specific question: what a Big Mac costs in
            Norway, what petrol costs in Egypt, how far a wage goes somewhere
            they are thinking of moving to. That second group is unusually
            commercially interesting — people comparing countries are often
            about to move money, travel, or relocate.
          </p>
          <p>
            <strong className="font-semibold text-ink">
              Traffic figures are not published on this page, on purpose.
            </strong>{" "}
            The site is young and any number here would be stale within a month
            and unverifiable while it lasted. Current analytics and search data
            go out in full on request, as screenshots from the source rather
            than as a claim.{" "}
            <a href={`mailto:${SITE_EMAIL}`} className={OUT}>
              Ask
            </a>
            .
          </p>
        </Prose>
      </Section>

      <Section heading="What can be bought">
        <Prose>
          <ul>
            <li>
              <strong className="font-semibold text-ink">
                A placement on the reveal screen
              </strong>{" "}
              — after a player finishes, the one moment in the game where
              attention is not on a guess. Never during play.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                A placement at the foot of a long read
              </strong>{" "}
              — after the piece, before the sources. Never mid-article.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Funding a country or an item
              </strong>{" "}
              — several items are hand-collected because no open dataset covers
              them, and that work is the site&apos;s real cost. Sponsoring it is
              acknowledged on{" "}
              <Link href="/methodology" className={OUT}>
                the methodology page
              </Link>{" "}
              next to the source it paid for. This is the ask worth making
              first: it visibly improves the thing being sponsored.
            </li>
          </ul>
          <p>
            Every placement is labelled as advertising in the copy and the
            markup, and links carry <code>rel=&quot;sponsored&quot;</code>.
          </p>
        </Prose>
      </Section>

      <Section heading="What is refused">
        <Prose>
          <ul>
            <li>
              <strong className="font-semibold text-ink">
                Any influence over a price.
              </strong>{" "}
              A figure, its source, its collection date, or a country&apos;s
              position in a ranking is not for sale, and neither is the removal
              of one. A brand that dislikes what its product costs somewhere is
              welcome to send a better source; that is a correction, not a
              transaction.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Placement inside the price tables.
              </strong>{" "}
              The tables rank by price. They will never rank by who paid, and
              there is no &ldquo;featured&rdquo; row for sale.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Anything requiring an undisclosed relationship.
              </strong>{" "}
              If it cannot be labelled on the page, it is not taken.
            </li>
          </ul>
        </Prose>
      </Section>

      <Section heading="How to ask">
        <Prose>
          <p>
            Email{" "}
            <a href={`mailto:${SITE_EMAIL}`} className={OUT}>
              {SITE_EMAIL}
            </a>{" "}
            with what you sell and where you want it. A direct answer comes back
            either way.
          </p>
          <p>
            Reader support is deliberately separate: see{" "}
            <Link href="/support" className={OUT}>
              support this site
            </Link>
            . The standards a sponsorship cannot override are in the{" "}
            <Link href="/editorial" className={OUT}>
              editorial policy
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
