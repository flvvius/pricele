import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/ArticleBody";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import {
  ARTICLES,
  getArticle,
  isPublished,
  PUBLISHED_ARTICLES,
} from "@/data/articles";
import { formatArchiveDate } from "@/lib/format";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-static";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const article = getArticle(params.slug);
  if (!article) return {};
  const live = isPublished(article);
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    // Unwritten drafts stay out of the index. Flipping status to "published"
    // (with a body) is all it takes to make a page indexable.
    robots: live ? undefined : { index: false, follow: false },
    openGraph: live
      ? {
          type: "article",
          title: article.title,
          description: article.description,
          publishedTime: article.date,
          url: absoluteUrl(`/blog/${article.slug}`),
        }
      : undefined,
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const live = isPublished(article);
  const others = PUBLISHED_ARTICLES.filter((a) => a.slug !== article.slug).slice(
    0,
    4
  );

  return (
    <ContentPage
      title={article.title}
      // The description doubles as the standfirst, so it gets lead treatment
      // rather than the small grey intro the reference pages use.
      intro={
        <>
          <p className="text-base leading-7 text-ink-body sm:text-lg sm:leading-8">
            {article.description}
          </p>
          {live && (
            <p className="text-xs font-medium uppercase tracking-wide text-ink-meta">
              {formatArchiveDate(article.date)} · {article.readingMinutes} min
              read
            </p>
          )}
        </>
      }
    >
      {live ? (
        <>
          <ArticleBody blocks={article.body!} />

          {article.sources && article.sources.length > 0 && (
            <Section heading="Sources">
              <ul className="border-t border-rule">
                {article.sources.map((s) => (
                  <li key={s.url} className="text-sm leading-relaxed">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-body underline decoration-rule underline-offset-4 transition-colors duration-fast ease-out hover:text-ink"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {others.length > 0 && (
            <Section heading="More guides">
              <ul className="border-t border-rule">
                {others.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/blog/${a.slug}`}
                      className="flex flex-col gap-1 border-b border-rule-soft px-1 py-3.5 transition-[background-color,color] duration-fast ease-out hover:bg-paper-raised"
                    >
                      <span className="text-sm font-bold text-ink-strong">
                        {a.title}
                      </span>
                      <span className="text-[15px] leading-[1.7] text-ink-body">
                        {a.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: article.title,
              description: article.description,
              datePublished: article.date,
              dateModified: article.date,
              url: absoluteUrl(`/blog/${article.slug}`),
              isAccessibleForFree: true,
              author: { "@type": "Organization", name: SITE_NAME },
              publisher: { "@type": "Organization", name: SITE_NAME },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": absoluteUrl(`/blog/${article.slug}`),
              },
              ...(article.sources && article.sources.length > 0
                ? { citation: article.sources.map((s) => s.url) }
                : {}),
            }}
          />
        </>
      ) : (
        // Placeholder state. Deliberately says nothing about the topic beyond
        // the description above — a stub padded out with filler is exactly the
        // kind of page this scaffolding exists to avoid shipping.
        <Section heading="Not published yet">
          <Prose>
            <p>
              This guide hasn&apos;t been written yet. It isn&apos;t listed on the
              guides index and search engines are asked not to index it.
            </p>
            <p>
              In the meantime, the{" "}
              <Link
                href="/methodology"
                className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
              >
                methodology page
              </Link>{" "}
              explains where the price data comes from, and the{" "}
              <Link
                href="/items"
                className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
              >
                item pages
              </Link>{" "}
              cover what drives the price spread for each product.
            </p>
          </Prose>
        </Section>
      )}
    </ContentPage>
  );
}
