// Single source of truth for site-wide SEO: canonical origin, names, and the
// JSON-LD structured-data builders. Keeping these here means every page emits
// consistent metadata and schema, and the production URL is set in one place.

import { ACTIVE_ITEM } from "@/data/item";

/**
 * Canonical origin, no trailing slash. Defaults to the production custom domain
 * so canonical tags, Open Graph URLs, the sitemap, and JSON-LD always point at
 * pricele.online — never at a Vercel per-deployment URL, which must never be
 * treated as canonical. Override per-deploy with NEXT_PUBLIC_SITE_URL if needed.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://pricele.online"
).replace(/\/$/, "");

export const SITE_NAME = "Pricele";
export const SITE_TAGLINE = "Guess the price. New country daily.";
/** Public contact address, surfaced on the Contact page and in policies. */
export const SITE_EMAIL = "flaviuscojocaru19@gmail.com";
export const SITE_DESCRIPTION =
  "Pricele is a free daily game where you guess the price of an everyday item somewhere in the world in 5 tries. New country every day. See how well you actually know what things cost.";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * VideoGame schema for the game itself. Powers rich understanding of what
 * Pricele is (a free, browser-based daily game) across Search and AI answers.
 */
export function gameJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: SITE_NAME,
    alternateName: "Pricele: guess the price",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: absoluteUrl("/og.svg"),
    inLanguage: "en",
    genre: ["Puzzle", "Trivia", "Educational"],
    gamePlatform: "Web browser",
    applicationCategory: "Game",
    operatingSystem: "Any (web browser)",
    playMode: "SinglePlayer",
    isAccessibleForFree: true,
    keywords:
      "price guessing game, daily game, wordle-like, cost of living game, guess the price",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl("/icon.svg"),
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

/** WebSite schema, ties the domain to the brand entity. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl("/icon.svg"),
    },
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** FAQPage schema. Feeds Q&A understanding and AI Overviews. */
export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** The canonical item name, for reuse in copy and titles. */
export const ITEM_NAME = ACTIVE_ITEM.name;
