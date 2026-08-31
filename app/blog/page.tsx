import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { PUBLISHED_ARTICLES } from "@/data/articles";
import { formatArchiveDate } from "@/lib/format";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

const HAS_ARTICLES = PUBLISHED_ARTICLES.length > 0;

export const metadata: Metadata = pageMetadata({
  path: "/blog",
  title: "Guides",
  description:
    "Long reads on what everyday prices actually measure: viral grocery receipts, why official inflation misses your cart, time prices, the two-income trap, and how to fix your own price instincts.",
  // An empty index is not worth indexing. This flips on by itself as soon
  // as the first article is published.
  index: HAS_ARTICLES,
});

export default function BlogIndex() {
  return (
    <ContentPage
      title="Guides"
      intro={
        <p className="text-lg leading-7 text-ink-body sm:text-xl sm:leading-8">
          Longer pieces on what prices actually measure: why a receipt from 1997
          says something the official inflation figure doesn&apos;t, what the same
          phone costs in days of work around the world, and why almost everyone
          is carrying a mental price list that stopped updating years ago.
        </p>
      }
    >
      {HAS_ARTICLES ? (
        <Section heading={`${PUBLISHED_ARTICLES.length} guides`}>
          <ul className="border-t border-rule">
            {PUBLISHED_ARTICLES.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/blog/${a.slug}`}
                  className="flex flex-col gap-1 border-b border-rule-soft px-1 py-3.5 transition-[background-color,color] duration-fast ease-out hover:bg-paper-raised"
                >
                  <h3 className="text-lg font-bold leading-snug text-ink sm:text-xl">
                    {a.title}
                  </h3>
                  <p className="text-base leading-relaxed text-ink-body">
                    {a.description}
                  </p>
                  <p className="label">
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
                className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
              >
                methodology page
              </Link>{" "}
              covers where every price comes from, and the{" "}
              <Link
                href="/items"
                className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
              >
                item pages
              </Link>{" "}
              explain what drives the spread for each product.
            </p>
          </Prose>
        </Section>
      )}

      {HAS_ARTICLES && (
        <JsonLd
          data={[
            breadcrumbJsonLd([{ name: "Guides", path: "/blog" }]),
            {
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
            },
          ]}
        />
      )}
    </ContentPage>
  );
}
