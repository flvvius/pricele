import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import { SITE_NAME, SITE_URL, SITE_EMAIL, pageMetadata } from "@/lib/seo";
import { AUTHOR, PUBLISHER } from "@/lib/author";

export const dynamic = "force-static";

// Last substantive change to these terms. Bump it when the text changes, not
// when the file is touched: readers use this date to decide whether to re-read.
const LAST_UPDATED = "August 16, 2026";

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  title: "Terms of Use",
  description: `The terms you agree to by using ${SITE_NAME}: what the price figures are and are not, how the data may be reused, and the limits of what a free daily game can promise.`,
});

/** Inline link styling, shared by the internal and outbound links below. */
const LINK =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

export default function TermsPage() {
  const host = SITE_URL.replace(/^https?:\/\//, "");

  return (
    <ContentPage
      title="Terms of Use"
      intro={
        <>
          <p>
            These terms cover your use of {SITE_NAME} at {host}. They are written
            to be read rather than skipped, so they are shorter than the genre
            usually allows.
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-meta">
            Last updated: {LAST_UPDATED}
          </p>
        </>
      }
    >
      <Section heading="Who you are agreeing with" id="operator">
        <Prose>
          <p>
            {SITE_NAME} is operated by {AUTHOR.name}, an individual based in{" "}
            {PUBLISHER.location}, reachable at{" "}
            <a href={`mailto:${SITE_EMAIL}`} className={LINK}>
              {SITE_EMAIL}
            </a>
            . There is no company behind it and no team. When these terms say
            &ldquo;we&rdquo;, that is who they mean.
          </p>
          <p>
            By loading any page on this site you accept the terms below. If you
            do not accept them, stop using the site; there is nothing to cancel
            and no account to close, because there are no accounts.
          </p>
        </Prose>
      </Section>

      <Section heading="What the site is" id="service">
        <Prose>
          <p>
            {SITE_NAME} is a free daily puzzle. Each day it pairs one everyday
            item with one country and asks you to guess what that item costs
            there. Alongside the game it publishes reference tables of the same
            price data and a set of written guides about how prices behave.
          </p>
          <p>
            The game is offered as it is, for entertainment and general interest.
            We do not promise that it will be available without interruption,
            that a given day&rsquo;s puzzle will be solvable by you, or that your
            saved streak will survive a browser that clears its own storage. Game
            progress lives only in your browser; nothing is backed up anywhere,
            because nothing is sent anywhere.
          </p>
        </Prose>
      </Section>

      <Section heading="The prices are not advice" id="no-advice">
        <Prose>
          <p>
            This is the clause that matters most, so it gets its own heading.
          </p>
          <p>
            Every figure on this site is a{" "}
            <strong className="font-semibold text-ink">national average</strong>{" "}
            compiled from a public source named on the{" "}
            <Link href="/methodology" className={LINK}>
              methodology page
            </Link>
            . Averages are not quotes. The price of a given item, in a given
            shop, in a given city, on a given day will differ from the number
            shown here, sometimes by a lot. Currency conversions use a rate
            captured when the data was compiled and will have moved since.
          </p>
          <p>
            Nothing here is financial, investment, tax, travel, relocation or
            purchasing advice, and none of it should be used to make a decision
            that costs you money. If you need a real number for a real decision,
            check the price where you intend to buy it.
          </p>
        </Prose>
      </Section>

      <Section heading="Accuracy and corrections" id="accuracy">
        <Prose>
          <p>
            We compile carefully and we still get things wrong. Sources revise
            their own figures, exchange rates drift, and transcription errors
            happen. Where a number could not be traced to a source we could name,
            it is labelled as such rather than published as though it were
            confirmed.
          </p>
          <p>
            If you find an error, tell us and it gets fixed. The{" "}
            <Link href="/editorial#corrections" className={LINK}>
              corrections policy
            </Link>{" "}
            explains what we do with a report and how quickly.
          </p>
        </Prose>
      </Section>

      <Section heading="Using our material" id="reuse">
        <Prose>
          <p>
            The written guides, page copy, layout, code and artwork on this site
            are ours. You may quote a reasonable extract with attribution and a
            link. You may not republish a guide in full, mirror the site, or feed
            it wholesale into a product that reproduces it.
          </p>
          <p>
            The underlying price data is a different matter, because we have no
            right to license it. It is compiled from third-party sources that keep
            their own terms, so the compilation is published under the reuse
            terms set out on the{" "}
            <Link href="/methodology#reuse" className={LINK}>
              methodology page
            </Link>
            . If you want to reuse a table, read that first and go to the
            original source where its terms require it.
          </p>
          <p>
            Automated bulk collection, scraping at a rate that degrades the site
            for other people, and any attempt to work around the measures that
            keep the day&rsquo;s answer hidden are all out of bounds.
          </p>
        </Prose>
      </Section>

      <Section heading="Advertising" id="advertising">
        <Prose>
          <p>
            The site is free and is supported by advertising served through
            Google AdSense. Ads are labelled where the ad network labels them and
            are kept out of the way of the game itself; no ad unit is placed so
            that a mis-tap registers as a click.
          </p>
          <p>
            We do not control which specific ads Google serves, and an ad
            appearing here is not an endorsement of the advertiser. What data
            advertising involves, and the choices you have about it, is set out
            in the{" "}
            <Link href="/privacy" className={LINK}>
              privacy policy
            </Link>
            .
          </p>
        </Prose>
      </Section>

      <Section heading="Links to other sites" id="links">
        <Prose>
          <p>
            The guides and the methodology page link out to the sources they
            draw on. Those sites are not ours, we do not control what they
            publish, and a link is a citation rather than an endorsement.
          </p>
        </Prose>
      </Section>

      <Section heading="Liability" id="liability">
        <Prose>
          <p>
            The site is provided &ldquo;as is&rdquo;, without warranties of any
            kind, to the fullest extent the law allows. We are not liable for
            loss arising from your use of the site or from reliance on any figure
            published on it.
          </p>
          <p>
            Nothing in these terms limits liability that cannot lawfully be
            limited, including liability for fraud or for death or personal
            injury caused by negligence. If you are a consumer, you keep every
            statutory right your local law gives you, whatever this page says.
          </p>
        </Prose>
      </Section>

      <Section heading="Changes to these terms" id="changes">
        <Prose>
          <p>
            We may revise these terms. When we do, the &ldquo;last updated&rdquo;
            date at the top of this page changes with them, and continuing to use
            the site afterwards means you accept the revision. We do not keep a
            public archive of previous versions; if you need one, save the page.
          </p>
        </Prose>
      </Section>

      <Section heading="Governing law" id="law">
        <Prose>
          <p>
            These terms are governed by the law of {PUBLISHER.location}, and the
            courts there have jurisdiction over any dispute. If you are a
            consumer resident elsewhere in the European Union, this does not
            deprive you of the protection of the mandatory rules of your own
            country.
          </p>
        </Prose>
      </Section>

      <Section heading="Contact" id="contact">
        <Prose>
          <p>
            Questions about these terms, corrections, takedown requests and
            anything else go to{" "}
            <a href={`mailto:${SITE_EMAIL}`} className={LINK}>
              {SITE_EMAIL}
            </a>
            , or through the{" "}
            <Link href="/contact" className={LINK}>
              contact page
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
