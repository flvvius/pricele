import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import { SITE_NAME, SITE_EMAIL } from "@/lib/seo";
import { COUNTRIES } from "@/lib/catalog";
import { ITEMS } from "@/data/items";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Contact",
  description: `How to reach ${SITE_NAME} — report a price that looks wrong, suggest a country or item, or get in touch about anything else.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      intro={
        <p>
          {SITE_NAME} is run by one person, and email is the only channel. Every
          message gets read; most get a reply within a few days.
        </p>
      }
    >
      <Section heading="Email">
        <Prose>
          <p>
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="inline-block border border-rule px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-body transition-[border-color,background-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-raised active:scale-[0.97]"
            >
              {SITE_EMAIL}
            </a>
          </p>
        </Prose>
      </Section>

      <Section heading="Reporting a price that looks wrong">
        <Prose>
          <p>
            This is the most useful thing you can send. The prices here are
            national averages from public datasets, and if you live somewhere and
            shop there regularly, you know things the dataset doesn&apos;t.
          </p>
          <p>
            To make a correction actionable, include the country, the item, what
            you actually see locally, and roughly where — a supermarket chain and
            a city is plenty. If it&apos;s a big discrepancy rather than a small
            one, say so; that usually points at a unit or currency problem rather
            than ordinary regional variation.
          </p>
          <p>
            Before writing, it&apos;s worth checking the{" "}
            <Link
              href="/methodology"
              className="underline hover:text-neutral-300"
            >
              methodology page
            </Link>
            . Some gaps are expected rather than errors: local-currency figures
            for most items are converted from US dollars at the collection-date
            exchange rate, the Big Mac figure for eurozone countries is a
            euro-area average rather than a national price, and the work-time
            figures rest on wage estimates that are deliberately rough.
          </p>
        </Prose>
      </Section>

      <Section heading="Suggesting a country or an item">
        <Prose>
          <p>
            There are currently {ITEMS.length} items across {COUNTRIES.length}{" "}
            countries. Both lists can grow, and suggestions are welcome — the
            main constraint is source data. An item needs a public dataset that
            covers most of the country list on a consistent definition, otherwise
            it can&apos;t be compared fairly. A country needs coverage across
            enough items to be worth a page.
          </p>
          <p>
            If you know of a well-maintained public price dataset that would fit,
            that&apos;s an especially useful email.
          </p>
        </Prose>
      </Section>

      <Section heading="Everything else">
        <Prose>
          <p>
            Bug reports, accessibility problems, questions about how the game
            works, press enquiries, advertising and partnership questions, and
            privacy or data requests all go to the same address. For privacy
            requests specifically, the{" "}
            <Link href="/privacy" className="underline hover:text-neutral-300">
              privacy policy
            </Link>{" "}
            sets out what is and isn&apos;t stored — in short, your game results
            never leave your own browser, so there is usually nothing on our side
            to delete.
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
