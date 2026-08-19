// Single source of truth for site-wide SEO: canonical origin, names, and the
// JSON-LD structured-data builders. Keeping these here means every page emits
// consistent metadata and schema, and the production URL is set in one place.

import type { Metadata } from "next";
import { ITEMS } from "@/data/items";
import { AUTHOR, PUBLISHER } from "@/lib/author";

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

/**
 * The share card. One image, one place.
 *
 * JPEG, and not the SVG this used to be. No major platform rasterises SVG for a
 * link preview — WhatsApp, Facebook, iMessage, LinkedIn and Slack all reject it
 * — so every share of this site arrived with no picture at all. `type` is
 * declared because some crawlers use it to decide whether to bother fetching.
 * Regenerate with `pnpm og`; see scripts/generate-og.mjs.
 */
const OG_IMAGE = {
  url: "/og.jpg",
  type: "image/jpeg",
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
 * Stable JSON-LD node identifiers.
 *
 * Every graph on the site refers to the publisher and the author by `@id`
 * rather than repeating the object. That way Google resolves one Organization
 * and one Person across the whole domain instead of treating the copy on each
 * page as a separate entity, which is what makes the author signal accumulate
 * rather than fragment. The fragments are arbitrary but must never change once
 * they have been crawled.
 */
export const ORG_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/#person`;

/** Reference to the publisher node, for embedding in any other schema. */
const orgRef = { "@id": ORG_ID } as const;

/**
 * The named human behind the site.
 *
 * This is the E-E-A-T node. An anonymous publisher is the single most common
 * trust deficiency flagged on sites that compile third-party data, because from
 * the outside a compilation and a scrape look identical until someone puts
 * their name on the compiling. `knowsAbout` is deliberately narrow: it claims
 * familiarity with the subject matter of this site and nothing else.
 */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: AUTHOR.name,
    jobTitle: AUTHOR.role,
    description: AUTHOR.bio.join(" "),
    email: `mailto:${AUTHOR.email}`,
    url: absoluteUrl("/about"),
    ...(AUTHOR.links.length > 0
      ? { sameAs: AUTHOR.links.map((l) => l.url) }
      : {}),
    knowsAbout: [
      "Consumer prices",
      "Cost of living comparisons",
      "Purchasing power parity",
      "Consumption taxes",
    ],
    worksFor: orgRef,
  };
}

/** The site as a publishing entity, tied to the person who runs it. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    email: `mailto:${SITE_EMAIL}`,
    foundingDate: String(PUBLISHER.foundedYear),
    founder: { "@id": PERSON_ID },
    description: SITE_DESCRIPTION,
    publishingPrinciples: absoluteUrl("/editorial"),
    // Points at the page that says how to report an error and what happens
    // next. Schema.org defines it for exactly this, and it is one of the few
    // machine-readable trust signals a small publisher can offer.
    correctionsPolicy: absoluteUrl("/editorial#corrections"),
    actionableFeedbackPolicy: absoluteUrl("/editorial#corrections"),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "editorial",
      email: `mailto:${SITE_EMAIL}`,
      url: absoluteUrl("/contact"),
      availableLanguage: "English",
    },
  };
}

export interface ArticleSchemaInput {
  slug: string;
  title: string;
  description: string;
  /** ISO publication date. */
  date: string;
  /** ISO date of the last substantive edit. Falls back to `date`. */
  updated?: string;
  citations?: string[];
  /** Rough length in words, which Google reads as a depth signal. */
  wordCount?: number;
}

/**
 * BlogPosting schema with a real author attached.
 *
 * The `author` used to be the Organization, which is technically valid and
 * practically worthless: it tells a rater the site wrote its own articles.
 * Pointing at the Person node instead is what connects each guide to a named,
 * contactable human with a biography on /about.
 */
export function articleJsonLd({
  slug,
  title,
  description,
  date,
  updated,
  citations,
  wordCount,
}: ArticleSchemaInput) {
  const url = absoluteUrl(`/blog/${slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: date,
    dateModified: updated ?? date,
    url,
    isAccessibleForFree: true,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    editor: { "@id": PERSON_ID },
    publisher: orgRef,
    image: absoluteUrl("/og.jpg"),
    ...(wordCount ? { wordCount } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(citations && citations.length > 0 ? { citation: citations } : {}),
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
    image: absoluteUrl("/og.jpg"),
    inLanguage: "en",
    genre: ["Puzzle", "Trivia", "Educational"],
    gamePlatform: "Web browser",
    applicationCategory: "Game",
    operatingSystem: "Any (web browser)",
    playMode: "SinglePlayer",
    isAccessibleForFree: true,
    keywords:
      "price guessing game, daily game, wordle-like, cost of living game, guess the price",
    publisher: orgRef,
    author: { "@id": PERSON_ID },
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
    publisher: orgRef,
  };
}

export interface ListedGame {
  name: string;
  url: string;
  description: string;
}

/**
 * `ItemList` of games, for a page that recommends some.
 *
 * The point is not the rich result — a list of outbound links doesn't earn one.
 * It's that a list page's whole value to an answer engine is being parsed as a
 * list: named items, in order, each resolving to a URL. Prose alone leaves that
 * to be inferred from the markup, and inference is where a page like this gets
 * read as an article that happens to mention some games.
 *
 * `position` is 1-based, per schema.org. Each entry is a `Game` rather than a
 * bare `Thing` so the type survives into whatever consumes it, and `url` sits on
 * the item, not the `ListItem`, so the URL belongs to the game rather than to
 * its slot in the ranking.
 */
export function gameListJsonLd({
  name,
  description,
  path,
  games,
}: {
  name: string;
  description: string;
  path: string;
  games: ListedGame[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url: absoluteUrl(path),
    numberOfItems: games.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: games.map((game, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Game",
        name: game.name,
        url: game.url,
        description: game.description,
      },
    })),
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
  /** ISO 3166-1 alpha-2, when the dataset covers exactly one country. */
  countryCode?: string;
  /** ISO date of the newest source behind these rows. */
  dateModified?: string;
  /** The sources the rows are drawn from, as free-text references. */
  citations?: string[];
  /** Number of rows the page publishes. */
  size?: number;
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
  countryCode,
  dateModified,
  citations,
  size,
}: DatasetInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: absoluteUrl(path),
    license: DATA_LICENSE_URL,
    isAccessibleForFree: true,
    creator: orgRef,
    // Who compiled the table, as distinct from who publishes it. On a dataset
    // assembled by hand from third-party sources this is the property that says
    // a person did the assembling.
    maintainer: { "@id": PERSON_ID },
    inLanguage: "en",
    variableMeasured: {
      "@type": "PropertyValue",
      name: "Retail price",
      unitCode: "USD",
      unitText: "US dollars",
    },
    ...(spatialCoverage
      ? { spatialCoverage: countryJsonLd(spatialCoverage, countryCode) }
      : {}),
    // From the rows' own sourceDate, never from the build. A price table's
    // freshness belongs to its sources; a build timestamp would let a CSS
    // change assert that the prices were re-checked this morning.
    ...(dateModified ? { dateModified } : {}),
    ...(size ? { size: `${size} rows` } : {}),
    ...(citations && citations.length > 0 ? { citation: citations } : {}),
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

/**
 * `BreadcrumbList` for a nested page.
 *
 * Absent from this site until now, and it is the cheapest of the schema types
 * that recur on pages answer engines cite. The value is not the breadcrumb
 * strip Google draws in a result. It is that a price page read cold is a table
 * with no indication of what publishes it; the trail says Pricele → Prices →
 * Norway, which is what lets a figure be attributed to a publication rather
 * than to a loose page.
 *
 * The home crumb is added here so no caller can forget it and so the trail
 * always resolves to the canonical origin. Pass the rest in order, ending with
 * the page itself.
 */
export interface Crumb {
  name: string;
  /** Site-relative path. The last crumb may omit it; it is the current page. */
  path?: string;
}

export function breadcrumbJsonLd(trail: Crumb[]) {
  const full: Crumb[] = [{ name: SITE_NAME, path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: full.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      // `item` is omitted on the final crumb, per Google's guidance: the last
      // entry is the current page and pointing it at itself adds nothing.
      ...(crumb.path && i < full.length - 1
        ? { item: crumb.path === "/" ? SITE_URL : absoluteUrl(crumb.path) }
        : {}),
    })),
  };
}

/**
 * A `Country` node with its ISO code attached, for the `about` of a page that
 * is about one country.
 *
 * The bare `{ "@type": "Country", name }` is ambiguous in exactly the cases it
 * matters — Georgia the country and Georgia the state resolve to one string —
 * and anything deciding whether this page answers a question about a country
 * has nothing but that string to go on. The alpha-2 code is already on every
 * row, so this costs nothing and is not a guess.
 */
export function countryJsonLd(name: string, countryCode?: string) {
  return {
    "@type": "Country",
    name,
    ...(countryCode
      ? {
          identifier: {
            "@type": "PropertyValue",
            propertyID: "ISO 3166-1 alpha-2",
            value: countryCode,
          },
        }
      : {}),
  };
}

/**
 * `WebPage` for a reference page, carrying the two properties a reference page
 * has and an `Article` does not comfortably claim: when its figures were last
 * refreshed, and which part of it is the answer.
 *
 * `speakable` names the selectors holding the direct answer. It was specified
 * for voice assistants and is read more widely than that now; either way the
 * cost is one property, and the effect is to point at the lead rather than
 * leaving the whole document to be ranked for extractability paragraph by
 * paragraph. The selectors must exist on the page — see `data-answer` in
 * components/ContentPage.tsx.
 *
 * `dateModified` is derived from the `sourceDate` of the rows the page actually
 * shows, never from the build. A price table's freshness is a property of its
 * sources, and a build timestamp would let a deploy that changed a stylesheet
 * assert that the prices were re-checked that morning.
 */
export interface WebPageInput {
  name: string;
  description: string;
  path: string;
  /** ISO date, from the newest source behind the figures on this page. */
  dateModified?: string;
  /** The primary entity the page is about, if it is about one thing. */
  about?: object;
}

export function webPageJsonLd({
  name,
  description,
  path,
  dateModified,
  about,
}: WebPageInput) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", url: SITE_URL, name: SITE_NAME },
    publisher: orgRef,
    ...(dateModified ? { dateModified } : {}),
    ...(about ? { about } : {}),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-answer]"],
    },
  };
}
