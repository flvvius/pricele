import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/ArticleBody";
import AuthorCard, { Byline } from "@/components/AuthorCard";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import {
  ARTICLES,
  countWords,
  getArticle,
  isPublished,
  PUBLISHED_ARTICLES,
} from "@/data/articles";
import { formatArchiveDate } from "@/lib/format";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

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
  return pageMetadata({
    path: `/blog/${article.slug}`,
    title: article.title,
    description: article.description,
    type: "article",
    publishedTime: article.date,
    // Unwritten drafts stay out of the index. Flipping status to "published"
    // (with a body) is all it takes to make a page indexable.
    index: live,
  });
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
          <p className="text-lg leading-7 text-ink-body sm:text-xl sm:leading-8">
            {article.description}
          </p>
          {live && (
            <Byline
              published={article.date}
              updated={article.updated}
              readingMinutes={article.readingMinutes}
              format={formatArchiveDate}
            />
          )}
        </>
      }
    >
      {live ? (
        <>
          <ArticleBody blocks={article.body!} />

          <AuthorCard />

          {article.sources && article.sources.length > 0 && (
            <Section heading="Sources">
              <ul className="border-t border-rule">
                {article.sources.map((s) => (
                  <li key={s.url} className="text-base leading-relaxed">
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
                      <span className="text-base font-bold text-ink-strong">
                        {a.title}
                      </span>
                      <span className="text-[16px] leading-[1.7] text-ink-body">
                        {a.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <JsonLd
            data={[
              breadcrumbJsonLd([
                { name: "Guides", path: "/blog" },
                { name: article.title, path: `/blog/${article.slug}` },
              ]),
              articleJsonLd({
                slug: article.slug,
                title: article.title,
                description: article.description,
                date: article.date,
                updated: article.updated,
                citations: article.sources?.map((s) => s.url),
                wordCount: countWords(article.body!),
              }),
            ]}
          />
        </>
      ) : (
        // Placeholder state. Deliberately says nothing about the topic beyond
        // the description above. A stub padded out with filler is exactly the
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
