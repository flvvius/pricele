// Single source of truth for site-wide SEO: canonical origin, names, and the
// JSON-LD structured-data builders. Keeping these here means every page emits
// consistent metadata and schema, and the production URL is set in one place.

import type { Metadata } from "next";
import { ITEMS } from "@/data/items";

/**
 * The host the site is actually served from.
 *
 * This is the www subdomain, because that is the primary domain on Vercel: the
 * apex 308-redirects to it. That distinction is the whole reason this constant
 * exists. This file used to declare the apex as canonical, which pointed every
 * <link rel="canonical">, every og:url, every sitemap <loc> and the robots.txt
 * Sitemap line at a URL that redirects, and a canonical URL has to answer 200.
 * Search Console reported the consequences twice over:
 *
 *   - "Page with redirect", because every URL in the submitted sitemap 308'd
 *     instead of serving the page it was supposed to index; and
 *   - "Duplicate without user-selected canonical", because a canonical that
 *     redirects is not a usable canonical, so Google was left with the apex and
 *     the www copy of every page and no declared preference between them.
 *
 * If the primary domain in Vercel ever moves to the apex, change it there
 * first, then change this to match. Nothing else needs touching: the sitemap,
 * robots.txt, canonicals, og:url and JSON-LD all derive from here.
 */
const CANONICAL_HOST = "www.pricele.online";

/** Hosts that 308 to CANONICAL_HOST, and so can never be canonical themselves. */
const REDIRECTING_HOSTS = ["pricele.online"];

/**
 * Normalise an origin to the one that serves 200s: no trailing slash, and never
 * a host that only redirects.
 *
 * The redirect check is not paranoia. NEXT_PUBLIC_SITE_URL is set per
 * environment, and one left pointing at the apex would quietly re-create the
 * exact indexing bug this replaced. Hosts that aren't the apex (preview
 * deployments, localhost) are left alone.
 */
export function canonicalOrigin(raw?: string): string {
  const fallback = `https://${CANONICAL_HOST}`;
  if (!raw) return fallback;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return fallback;
  }

  if (REDIRECTING_HOSTS.includes(url.hostname)) url.hostname = CANONICAL_HOST;
  return `${url.protocol}//${url.host}${url.pathname}`.replace(/\/+$/, "");
}

/**
 * Canonical origin, no trailing slash. Every canonical tag, Open Graph URL,
 * sitemap entry and JSON-LD url on the site is built from this, so it must
 * always be an origin that serves the site directly, never a Vercel
 * per-deployment URL, and never a host that redirects.
 */
export const SITE_URL = canonicalOrigin(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = "Pricele";
export const SITE_TAGLINE = "Guess the price. New item and country daily.";
/** Public contact address, surfaced on the Contact page and in policies. */
export const SITE_EMAIL = "flaviuscojocaru19@gmail.com";
export const SITE_DESCRIPTION =
  "Pricele is a free daily game where you guess what an everyday item costs in a different country each day: a Big Mac in Norway, a cappuccino in Japan, a litre of petrol in Egypt. Five tries, real price data, a new puzzle every day.";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

/** Home page title, and the template every other page's title runs through. */
export const TITLE_DEFAULT = "Pricele — Guess the Price, a New Country Daily";
export const TITLE_TEMPLATE = `%s · ${SITE_NAME}`;

/** The full title a page ends up with, template included. */
export function titleFor(title?: string): string {
  return title ? TITLE_TEMPLATE.replace("%s", title) : TITLE_DEFAULT;
}

/** The share card. One image, one place. */
const OG_IMAGE = {
  url: "/og.svg",
  width: 1200,
  height: 630,
  alt: "Pricele: guess the price",
};

export interface PageMetaInput {
  /** Site-relative path of this page, no trailing slash. e.g. "/items/big-mac". */
  path: string;
  /** Page title, without the site suffix; the template adds that. */
  title?: string;
  description?: string;
  /** "article" for blog posts. Everything else is a "website". */
  type?: "website" | "article";
  /** ISO date, for articles. */
  publishedTime?: string;
  /** Set false to keep a page (an empty index, a draft) out of the index. */
  index?: boolean;
}

/**
 * The metadata block for a page, canonical URL included.
 *
 * Every page goes through this for two reasons.
 *
 * The first is that the three things Google reads as canonicalisation signals,
 * <link rel="canonical">, og:url and the sitemap <loc>, have to agree, and
 * agree on a URL that serves a 200. Deriving all of them from one `path` is
 * what keeps them from drifting apart.
 *
 * The second is that Next.js does not deep-merge `openGraph`: a page that
 * declares one of its own replaces the layout's wholesale. Writing
 * `openGraph: { url }` inline therefore looks like it sets one field, and
 * silently drops the share image, the locale and the site name with it. Build
 * the whole object here and that can't happen.
 */
export function pageMetadata({
  path,
  title,
  description,
  type = "website",
  publishedTime,
  index = true,
}: PageMetaInput): Metadata {
  const fullTitle = titleFor(title);
  const desc = description ?? SITE_DESCRIPTION;
  // Next renders `canonical: "/"` as the bare origin, and the sitemap lists the
  // home page the same way. Match that here so og:url doesn't disagree with the
  // canonical over a trailing slash.
  const url = path === "/" ? SITE_URL : absoluteUrl(path);

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: path },
    ...(index ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type,
      locale: "en_US",
      siteName: SITE_NAME,
      url,
      title: fullTitle,
      description: desc,
      images: [OG_IMAGE],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [OG_IMAGE.url],
    },
  };
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

/**
 * Reuse terms for the price tables, as required by `Dataset` schema (Search
 * Console flags a Dataset with no `license`). It points at the methodology page
 * rather than at a blanket open licence because the underlying numbers are
 * third-party. The Economist's Big Mac Index and Numbeo's rankings keep their
 * own terms, and a compilation can't relicense its sources.
 */
export const DATA_LICENSE_URL = absoluteUrl("/methodology#reuse");

export interface DatasetInput {
  name: string;
  description: string;
  /** Site-relative path of the page the dataset is published on. */
  path: string;
  /** Country name, when the dataset covers exactly one. */
  spatialCoverage?: string;
}

/**
 * Dataset schema for the reference pages that publish price tables. Built in
 * one place so every Dataset on the site carries the same creator and licence
 * These are the two properties Search flags when they go missing.
 */
export function datasetJsonLd({
  name,
  description,
  path,
  spatialCoverage,
}: DatasetInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: absoluteUrl(path),
    license: DATA_LICENSE_URL,
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(spatialCoverage
      ? { spatialCoverage: { "@type": "Country", name: spatialCoverage } }
      : {}),
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

/** "a Big Mac, a cappuccino, a litre of milk…": item names for prose. */
export const ITEM_LIST = ITEMS.map((i) => i.shortName.toLowerCase());

/** "Big Mac, Coca-Cola, cappuccino and 4 more": compact list for meta copy. */
export function itemSummary(max = 3): string {
  const names = ITEMS.map((i) => i.shortName);
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max).join(", ")} and ${names.length - max} more`;
}

export const ITEM_COUNT = ITEMS.length;
