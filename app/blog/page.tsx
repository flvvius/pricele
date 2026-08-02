import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { PUBLISHED_ARTICLES } from "@/data/articles";
import { formatArchiveDate } from "@/lib/format";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

const HAS_ARTICLES = PUBLISHED_ARTICLES.length > 0;

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Long reads on what everyday prices actually measure — viral grocery receipts, why official inflation misses your cart, time prices, the two-income trap, and how to fix your own price instincts.",
  alternates: { canonical: "/blog" },
  // An empty index is not worth indexing. This flips on by itself as soon as
  // the first article is published.
  robots: HAS_ARTICLES ? undefined : { index: false, follow: true },
};

export default function BlogIndex() {
  return (
    <ContentPage
      title="Guides"
      intro={
        <p className="text-base leading-7 text-neutral-200 sm:text-lg sm:leading-8">
          Longer pieces on what prices actually measure: why a receipt from 1997
          says something the official inflation figure doesn&apos;t, what the same
          phone costs in days of work around the world, and why almost everyone
          is carrying a mental price list that stopped updating years ago.
        </p>
      }
    >
      {HAS_ARTICLES ? (
        <Section heading={`${PUBLISHED_ARTICLES.length} guides`}>
          <ul className="flex flex-col gap-2">
            {PUBLISHED_ARTICLES.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/blog/${a.slug}`}
                  className="flex flex-col gap-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition hover:border-neutral-600 hover:bg-neutral-800"
                >
                  <h3 className="text-base font-bold leading-snug text-neutral-50 sm:text-lg">
                    {a.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-300">
                    {a.description}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatArchiveDate(a.date)} · {a.readingMinutes} min read
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : (
        <Section heading="Nothing published yet">
          <Prose>
            <p>
              The first guides are being written. In the meantime, the{" "}
              <Link
                href="/methodology"
                className="underline hover:text-neutral-300"
              >
                methodology page
              </Link>{" "}
              covers where every price comes from, and the{" "}
              <Link href="/items" className="underline hover:text-neutral-300">
                item pages
              </Link>{" "}
              explain what drives the spread for each product.
            </p>
          </Prose>
        </Section>
      )}

      {HAS_ARTICLES && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Pricele Guides",
            url: absoluteUrl("/blog"),
            blogPost: PUBLISHED_ARTICLES.map((a) => ({
              "@type": "BlogPosting",
              headline: a.title,
              description: a.description,
              datePublished: a.date,
              url: absoluteUrl(`/blog/${a.slug}`),
            })),
          }}
        />
      )}
    </ContentPage>
  );
}
