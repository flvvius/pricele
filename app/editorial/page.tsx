import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import {
  SITE_NAME,
  SITE_EMAIL,
  pageMetadata,
  breadcrumbJsonLd,
  personJsonLd,
  organizationJsonLd,
} from "@/lib/seo";
import { AUTHOR } from "@/lib/author";

export const dynamic = "force-static";

const LAST_UPDATED = "August 16, 2026";

export const metadata: Metadata = pageMetadata({
  path: "/editorial",
  title: "Editorial policy",
  description: `Who writes ${SITE_NAME}, how a price gets accepted or rejected, what we do when a figure turns out to be wrong, and where the money comes from.`,
});

const LINK =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

/**
 * The page that says how the sausage is made.
 *
 * /methodology says where a number came from. This says who decided it was good
 * enough to publish, on what test, and what happens when that decision turns out
 * to have been wrong. The two are deliberately separate: one is about data, this
 * one is about the people and the process, and readers arrive looking for one or
 * the other, rarely both.
 */
export default function EditorialPage() {
  return (
    <ContentPage
      title="Editorial policy"
      intro={
        <>
          <p>
            {SITE_NAME} publishes numbers about money, which means the only thing
            it really has to sell is whether you can trust them. This page sets
            out who decides what gets published, the test a figure has to pass,
            and what happens when one fails after the fact.
          </p>
          <p className="text-sm font-medium uppercase tracking-wide text-ink-meta">
            Last updated: {LAST_UPDATED}
          </p>
        </>
      }
    >
      <Section heading="Who writes this" id="who">
        <Prose>
          <p>
            One person: {AUTHOR.name}, who compiles the data, writes the guides,
            builds the site and answers the mail. There is no editorial team, no
            freelance pool and no content agency, and where a page carries a
            byline it is that person&rsquo;s.
          </p>
          <p>
            Saying so plainly is the point. A site that publishes compiled
            figures under no name at all is indistinguishable from a scraper, and
            you have no way to tell whether anyone checked anything. The{" "}
            <Link href="/about" className={LINK}>
              about page
            </Link>{" "}
            has the longer version and the contact routes.
          </p>
        </Prose>
      </Section>

      <Section heading="How a price gets published" id="sourcing">
        <Prose>
          <p>
            A figure has to clear four things before it goes into the table.
            Anything that fails one of them is left out rather than estimated,
            which is why the price grid has holes in it: several countries carry
            only a handful of the items in the catalogue.
          </p>
        </Prose>
        <ol className="flex max-w-prose list-decimal flex-col gap-2.5 pl-5 text-[16px] leading-[1.7] text-ink-body marker:text-ink-meta">
          <li>
            <strong className="font-semibold text-ink">
              It has a named public source.
            </strong>{" "}
            Not &ldquo;widely reported&rdquo;, not a figure lifted from another
            aggregator that does not say where it got it. A publication, an
            index, a statistics agency, something a reader can open.
          </li>
          <li>
            <strong className="font-semibold text-ink">
              The source is consistent across countries.
            </strong>{" "}
            One item is priced from one source for every country that has it. A
            Big Mac in Norway and a Big Mac in Egypt come from the same index, or
            neither goes in. Mixing sources within an item produces a comparison
            that measures the sources rather than the countries.
          </li>
          <li>
            <strong className="font-semibold text-ink">
              The unit is the same everywhere.
            </strong>{" "}
            A litre, a dozen, a kilo, one cup. Where a country sells an item in a
            different pack size, the figure is normalised to the site&rsquo;s
            unit and the normalisation is stated, or the row is dropped.
          </li>
          <li>
            <strong className="font-semibold text-ink">
              It survives a sanity check.
            </strong>{" "}
            Every row is compared with its neighbours and with the same
            country&rsquo;s other items. A figure that would make a country an
            outlier by a factor of two gets traced back to the source before it
            is allowed to stand, and is usually a unit error.
          </li>
        </ol>
        <Prose>
          <p>
            Which specific source sits behind each item, and when it was last
            pulled, is on the{" "}
            <Link href="/methodology" className={LINK}>
              methodology page
            </Link>
            .
          </p>
        </Prose>
      </Section>

      <Section heading="What we will not do" id="limits">
        <Prose>
          <p>
            These are standing rules rather than aspirations, and they are the
            reason the site is smaller than it could be.
          </p>
        </Prose>
        <ul className="flex max-w-prose list-disc flex-col gap-2.5 pl-5 text-[16px] leading-[1.7] text-ink-body marker:text-ink-meta">
          <li>
            <strong className="font-semibold text-ink">
              No invented rows.
            </strong>{" "}
            A missing price stays missing. Interpolating from a neighbouring
            country, or from the same country&rsquo;s other items, would produce
            a number that looks exactly as authoritative as a real one.
          </li>
          <li>
            <strong className="font-semibold text-ink">
              No auto-generated articles.
            </strong>{" "}
            Every guide on this site is written and edited by hand, by the person
            named above, and published only once it says something that is not
            already the first result for the same question. Drafts stay
            unindexed and off the guides index until then.
          </li>
          <li>
            <strong className="font-semibold text-ink">
              No pages built to be counted.
            </strong>{" "}
            The reference pages exist because a table of that shape is useful.
            None of them is spun up per keyword, and the country pages carry
            written notes precisely so that they are not the same page
            thirty-three times.
          </li>
          <li>
            <strong className="font-semibold text-ink">
              No paid placement.
            </strong>{" "}
            Nobody has ever paid to have an item, a country or a link included,
            and if that ever changes it will be labelled on the page it affects.
          </li>
        </ul>
      </Section>

      <Section heading="Corrections" id="corrections">
        <Prose>
          <p>
            If a figure here is wrong, we want to know, and the fastest route is
            an email to{" "}
            <a href={`mailto:${SITE_EMAIL}`} className={LINK}>
              {SITE_EMAIL}
            </a>{" "}
            naming the page and the number. A link to the source you think is
            right turns a week of checking into an afternoon.
          </p>
          <p>What happens then:</p>
        </Prose>
        <ol className="flex max-w-prose list-decimal flex-col gap-2.5 pl-5 text-[16px] leading-[1.7] text-ink-body marker:text-ink-meta">
          <li>
            Every report gets read by the person who compiled the data. Not a
            support queue.
          </li>
          <li>
            A figure that is clearly wrong, or that we cannot re-verify against
            its source, is pulled from the site rather than left up while it is
            investigated. An absent row is better than a wrong one.
          </li>
          <li>
            Corrections to a published guide are made in the text and the
            page&rsquo;s updated date changes with them. Where the correction
            changes what the piece argued rather than a detail, it is noted at
            the foot of the article instead of quietly rewritten.
          </li>
          <li>
            You get a reply either way, including when we conclude the original
            figure was right.
          </li>
        </ol>
      </Section>

      <Section heading="Updates and freshness" id="updates">
        <Prose>
          <p>
            Prices go stale. Each item is refreshed when its source publishes a
            new edition, which for the indices behind most of this site means
            once or twice a year rather than continuously. The methodology page
            names the edition each item currently uses, so a figure can always be
            dated.
          </p>
          <p>
            Guides carry the date they were published and, where they have been
            revised, the date of the revision. We do not re-date a piece to make
            it look current; a 2026 article that has not been touched still says
            2026.
          </p>
        </Prose>
      </Section>

      <Section heading="How the site is funded" id="funding">
        <Prose>
          <p>
            Advertising, served through Google AdSense, and nothing else. There
            are no affiliate links anywhere on the site, no sponsored posts, no
            paid inclusions and no data sold to anyone. Nobody buying an ad has
            any say over what the guides argue or which figures appear, and the
            ad network has no visibility into either before it runs.
          </p>
          <p>
            Ad units are kept off the game board while a puzzle is in play and
            are never placed where a mis-tap would register as a click. The data
            side of advertising is covered in the{" "}
            <Link href="/privacy" className={LINK}>
              privacy policy
            </Link>
            .
          </p>
        </Prose>
      </Section>

      <Section heading="Use of AI tools" id="ai">
        <Prose>
          <p>
            Stating this explicitly, because the honest answer is
            not &ldquo;none&rdquo;. Software-assisted tooling is used the way a
            spellchecker or a spreadsheet is: to draft the site&rsquo;s code, to
            cross-check arithmetic, and to catch clumsy sentences.
          </p>
          <p>
            It is not used to produce published text unsupervised, and it is
            never the source of a figure. Every number on this site is taken from
            the named source it cites and checked by hand, and every guide is
            read line by line by {AUTHOR.name} before it is published. A sentence
            no human has read does not go on the site.
          </p>
        </Prose>
      </Section>

      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Editorial policy", path: "/editorial" }]),
          organizationJsonLd(),
          personJsonLd(),
        ]}
      />
    </ContentPage>
  );
}
