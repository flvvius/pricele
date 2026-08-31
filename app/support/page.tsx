import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { SUPPORT_LINKS } from "@/lib/support";
import { adsEnabled } from "@/lib/ads";
import { COUNTRIES } from "@/lib/catalog";
import { ITEMS } from "@/data/items";
import {
  breadcrumbJsonLd,
  pageMetadata,
  SITE_NAME,
  webPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

const DESCRIPTION = `How ${SITE_NAME} is paid for, what that does and does not buy, and how to support it if you want to.`;

export const metadata: Metadata = pageMetadata({
  path: "/support",
  title: "Support this site",
  description: DESCRIPTION,
});

const OUT =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

export default function SupportPage() {
  return (
    <ContentPage
      title="Support this site"
      intro={
        <p data-answer>
          {SITE_NAME} is free, has no account, no paywall and no newsletter to
          escape from. It is paid for by advertising, and if you want to help
          more directly than that, this page is how.
        </p>
      }
    >
      <JsonLd
        data={[
          webPageJsonLd({
            name: "Support this site",
            description: DESCRIPTION,
            path: "/support",
          }),
          breadcrumbJsonLd([
            { name: SITE_NAME, path: "/" },
            { name: "Support", path: "/support" },
          ]),
        ]}
      />

      <Section heading="What it costs to run">
        <Prose>
          <p>
            Almost nothing to serve and a great deal to keep honest. The site is
            static, so hosting is close to free. The expensive part is the
            price data: {ITEMS.length} items across {COUNTRIES.length}{" "}
            countries, from sources that refresh at wildly different intervals,
            several of which have to be collected and checked by hand because
            bulk scraping is against their terms.
          </p>
          <p>
            A price that is eighteen months old is not a price. Keeping the
            table current is the work.
          </p>
        </Prose>
      </Section>

      {SUPPORT_LINKS.length > 0 && (
        <Section heading="If you want to chip in">
          <Prose>
            <p>
              No tiers, no rewards, nothing behind a login. Everything here is
              free and stays free whether or not anyone gives anything.
            </p>
          </Prose>
          <ul className="mt-4 flex flex-col gap-3">
            {SUPPORT_LINKS.map((l) => (
              <li key={l.id} className="border border-rule bg-paper-raised p-4">
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink underline decoration-rule underline-offset-2 hover:decoration-ink"
                >
                  {l.label}
                </a>
                <p className="mt-1 text-base leading-relaxed text-ink-muted">
                  {l.note}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section heading="Ways to help that cost nothing">
        <Prose>
          <ul>
            <li>
              <strong className="font-semibold text-ink">
                Tell us when a price is wrong.
              </strong>{" "}
              You live somewhere. We mostly do not. A reader saying &ldquo;milk
              has not cost that here since last year&rdquo; is the single most
              useful message this site receives.{" "}
              <Link href="/contact" className={OUT}>
                Get in touch
              </Link>
              .
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Point at a better source.
              </strong>{" "}
              Several items are hand-collected because no open dataset covers
              them. An official series we have missed would replace an estimate
              with a fact — see{" "}
              <Link href="/data" className={OUT}>
                the data page
              </Link>{" "}
              for what each item currently rests on.
            </li>
            <li>
              <strong className="font-semibold text-ink">
                Tell someone who would find it useful.
              </strong>{" "}
              A link from a person beats anything that can be bought.
            </li>
          </ul>
        </Prose>
      </Section>

      <Section heading="What money does not buy">
        <Prose>
          <p>
            No price on this site is for sale. No brand pays to appear in the
            item list, no country pays to look cheap, and no sponsor sees a
            figure before it is published. If that ever changes it will be
            disclosed on this page before it happens, not after.
          </p>
          {adsEnabled() && (
            <p>
              Advertising is Google AdSense, bounded on purpose: never during
              play, never mid-article. Where your data goes and how to refuse it
              is in the{" "}
              <Link href="/privacy" className={OUT}>
                privacy policy
              </Link>
              , and the consent controls are reachable from every page.
            </p>
          )}
          <p>
            The standards behind that are in the{" "}
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
