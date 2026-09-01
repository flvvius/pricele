import { PUBLISHED_ARTICLES } from "@/data/articles";
import { AUTHOR } from "@/lib/author";
import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
  absoluteUrl,
} from "@/lib/seo";

/**
 * `/feed.xml`: an RSS 2.0 feed of the guides.
 *
 * Worth having for a reason that is not "some people still use readers",
 * though some do. A feed is the one machine-readable way a site announces that
 * it publishes on an ongoing basis rather than having been written once and
 * left. Aggregators, newsletter tools and the several directories that ask for
 * a feed URL on their submission form all consume it, and every one of those is
 * an off-site mention, which is the thing docs/visibility.md identifies as the
 * actual bottleneck.
 *
 * Only published guides go in. Drafts carry a noindex tag and are absent from
 * the sitemap; putting them in a feed would push a half-written page straight
 * into somebody's reader, which is worse than merely contradicting the sitemap.
 *
 * Regenerated on the same hourly cycle as the sitemap so a newly published
 * guide appears without a deploy.
 */
export const revalidate = 3600;

/** Escape the five characters XML cannot carry literally in text or attributes. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RFC 822 date, which is what RSS requires and what `toUTCString` produces —
 * with one exception: it ends in "GMT" where RFC 822 wants a numeric offset.
 * Readers accept both, but validators complain, so it is normalised here.
 *
 * Article dates are bare `YYYY-MM-DD`, which parses as UTC midnight. That is
 * the right reading: a publication date is a day, not an instant.
 */
function rfc822(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toUTCString().replace(/GMT$/, "+0000");
}

export function GET() {
  // Newest first. The source list is authored in publication order, and a feed
  // that arrives oldest-first reads as a backlog rather than as new writing.
  const items = [...PUBLISHED_ARTICLES].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const newest = items[0]?.date;

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(SITE_NAME)}</title>
    <link>${xml(SITE_URL)}</link>
    <description>${xml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <copyright>${xml(`© ${new Date().getUTCFullYear()} ${SITE_NAME}`)}</copyright>
    <managingEditor>${xml(`${AUTHOR.email} (${AUTHOR.name})`)}</managingEditor>
    <webMaster>${xml(`${AUTHOR.email} (${AUTHOR.name})`)}</webMaster>
    <atom:link href="${xml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${xml(absoluteUrl("/og.jpg"))}</url>
      <title>${xml(SITE_NAME)}</title>
      <link>${xml(SITE_URL)}</link>
    </image>
${newest ? `    <lastBuildDate>${xml(rfc822(newest))}</lastBuildDate>\n` : ""}${items
    .map((a) => {
      const url = absoluteUrl(`/blog/${a.slug}`);
      return `    <item>
      <title>${xml(a.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      <description>${xml(a.description)}</description>
      <pubDate>${xml(rfc822(a.updated ?? a.date))}</pubDate>
      <author>${xml(`${AUTHOR.email} (${AUTHOR.name})`)}</author>
    </item>`;
    })
    .join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
