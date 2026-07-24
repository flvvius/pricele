import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";
import { allCountrySlugs } from "@/lib/catalog";

// Lists every indexable route: the daily game, the prices index, and one entry
// per country page. Adding a country to prices.json extends the sitemap here.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/prices"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const countryRoutes: MetadataRoute.Sitemap = allCountrySlugs().map((slug) => ({
    url: absoluteUrl(`/prices/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...countryRoutes];
}
