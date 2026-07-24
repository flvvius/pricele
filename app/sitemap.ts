import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Only the game itself is indexable. Per-country price pages were removed on
// purpose so the day's answer can't be looked up.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
