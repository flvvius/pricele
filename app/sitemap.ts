import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// The game is the primary indexable page. The About/Privacy/Contact pages are
// static supporting content (expected for an ad-supported site) and are listed
// so crawlers discover them. Per-country price pages were removed on purpose so
// the day's answer can't be looked up.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
