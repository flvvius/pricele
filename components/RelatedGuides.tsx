import Link from "next/link";
import { Section } from "./ContentPage";
import { PUBLISHED_ARTICLES } from "@/data/articles";

/**
 * "Why this costs what it costs" — guides chosen for the page they sit on.
 *
 * WHY THE SLUGS ARE PASSED IN.
 *   The reference pages are the thinnest thing on the site by construction: a
 *   generated table with a country or item name swapped in. The written notes
 *   on the country pages exist to fix that, and this is the other half of it.
 *   A fuel page that links to the piece on fuel taxation, and an egg page that
 *   links to the piece on avian influenza, are two different pages. A "related
 *   reading" block showing the same four newest guides everywhere is one page
 *   printed forty times, which is the problem rather than the fix.
 *
 *   So callers name the slugs. An unknown or unpublished slug is dropped rather
 *   than rendered as a dead link, and the block disappears entirely if nothing
 *   survives, because an empty heading is worse than no heading.
 */
export default function RelatedGuides({
  slugs,
  heading = "Why this costs what it costs",
}: {
  /** Article slugs, most relevant first. */
  slugs: string[];
  heading?: string;
}) {
  const articles = slugs
    .map((slug) => PUBLISHED_ARTICLES.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  if (articles.length === 0) return null;

  return (
    <Section heading={heading}>
      <ul className="border-t border-rule">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/blog/${a.slug}`}
              className="flex flex-col gap-1 border-b border-rule-soft px-1 py-3.5 transition-[background-color,color] duration-fast ease-out hover:bg-paper-raised"
            >
              <span className="text-base font-bold text-ink-strong">{a.title}</span>
              <span className="text-[16px] leading-[1.7] text-ink-body">
                {a.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * Which guides belong on which item page, keyed by item id.
 *
 * Hand-assigned on purpose. Deriving this from tags or keywords produces the
 * generic block described above; the whole value is that the fuel page and the
 * egg page recommend different things because different things explain them.
 */
export const GUIDES_BY_ITEM: Record<string, string[]> = {
  "big-mac": [
    "purchasing-power-parity-explained",
    "why-poor-countries-are-cheap",
    "why-the-same-thing-costs-different-amounts",
  ],
  cappuccino: [
    "what-you-pay-for-in-a-cup-of-coffee",
    "why-poor-countries-are-cheap",
    "vat-the-price-rise-nobody-argues-about",
  ],
  "gasoline-1l": [
    "petrol-prices-are-a-political-decision",
    "vat-the-price-rise-nobody-argues-about",
    "why-the-same-thing-costs-different-amounts",
  ],
  "eggs-12": [
    "why-eggs-went-insane",
    "why-the-same-thing-costs-different-amounts",
    "official-inflation-vs-your-receipt",
  ],
  "milk-1l": [
    "why-eggs-went-insane",
    "why-the-same-thing-costs-different-amounts",
    "shrinkflation-the-price-rise-in-the-packaging",
  ],
  "coke-330ml": [
    "vat-the-price-rise-nobody-argues-about",
    "shrinkflation-the-price-rise-in-the-packaging",
    "why-the-same-thing-costs-different-amounts",
  ],
  "apples-1kg": [
    "why-the-same-thing-costs-different-amounts",
    "how-to-compare-cost-of-living",
    "the-things-that-quietly-got-cheaper",
  ],
};

/** The set that explains a whole country's basket rather than one item. */
export const GUIDES_FOR_COUNTRY = [
  "why-poor-countries-are-cheap",
  "vat-the-price-rise-nobody-argues-about",
  "purchasing-power-parity-explained",
  "how-to-compare-cost-of-living",
];
