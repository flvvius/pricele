import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { COUNTRIES, publishedArchiveDates } from "@/lib/catalog";
import { ITEMS } from "@/data/items";
import { PUBLISHED_ARTICLES } from "@/data/articles";
import { dateFromISO } from "@/lib/puzzle";

// Regenerated hourly so newly-archived days enter the sitemap without a deploy.
export const revalidate = 3600;

/**
 * Everything indexable, and nothing that isn't.
 *
 * Two deliberate omissions:
 *  - Puzzles from the last two days. Their answers are still live somewhere in
 *    the world (see publishedArchiveDates), so those pages 404 until they age in.
 *  - Unwritten guides. Draft articles carry a noindex tag; listing them here
 *    would contradict that and advertise empty pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = (
    [
      { url: SITE_URL, changeFrequency: "daily", priority: 1 },
      { url: `${SITE_URL}/prices`, changeFrequency: "weekly", priority: 0.9 },
      { url: `${SITE_URL}/items`, changeFrequency: "weekly", priority: 0.9 },
      { url: `${SITE_URL}/archive`, changeFrequency: "daily", priority: 0.8 },
      { url: `${SITE_URL}/methodology`, changeFrequency: "monthly", priority: 0.7 },
      {
        url: `${SITE_URL}/daily-games`,
        changeFrequency: "monthly",
        priority: 0.7,
      },
      { url: `${SITE_URL}/editorial`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
      { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ] satisfies MetadataRoute.Sitemap
  ).map((p) => ({ ...p, lastModified: now }));

  const countryPages: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
    url: `${SITE_URL}/prices/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const itemPages: MetadataRoute.Sitemap = ITEMS.map((i) => ({
    url: `${SITE_URL}/items/${i.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const archivePages: MetadataRoute.Sitemap = publishedArchiveDates().map(
    (date) => ({
      url: `${SITE_URL}/archive/${date}`,
      lastModified: dateFromISO(date),
      changeFrequency: "yearly",
      priority: 0.4,
    })
  );

  const articlePages: MetadataRoute.Sitemap = PUBLISHED_ARTICLES.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: dateFromISO(a.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // The guides index only earns a place once something is on it.
  const blogIndex: MetadataRoute.Sitemap =
    PUBLISHED_ARTICLES.length > 0
      ? [
          {
            url: `${SITE_URL}/blog`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
          },
        ]
      : [];

  return [
    ...staticPages,
    ...blogIndex,
    ...itemPages,
    ...countryPages,
    ...articlePages,
    ...archivePages,
  ];
}
