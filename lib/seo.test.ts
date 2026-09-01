import { describe, it, expect } from "vitest";
import {
  SITE_URL,
  canonicalOrigin,
  absoluteUrl,
  pageMetadata,
  titleFor,
  breadcrumbJsonLd,
  countryJsonLd,
  datasetJsonLd,
  webPageJsonLd,
  howToPlayJsonLd,
  organizationJsonLd,
  gameJsonLd,
  DATA_LICENSE_URL,
} from "./seo";

// These guard the canonical origin, which is the one piece of SEO config the
// site cannot self-correct. A canonical URL that redirects is not a canonical
// URL, and when this file previously named the apex, which 308s to www,
// Search Console stopped indexing on the strength of it.

describe("canonicalOrigin", () => {
  it("defaults to the host the site is actually served from", () => {
    expect(canonicalOrigin()).toBe("https://www.pricele.online");
  });

  it("upgrades the apex, which only ever redirects", () => {
    expect(canonicalOrigin("https://pricele.online")).toBe(
      "https://www.pricele.online"
    );
  });

  it("strips trailing slashes", () => {
    expect(canonicalOrigin("https://www.pricele.online/")).toBe(
      "https://www.pricele.online"
    );
    expect(canonicalOrigin("https://example.test///")).toBe(
      "https://example.test"
    );
  });

  it("leaves other hosts alone, so previews and localhost still work", () => {
    expect(canonicalOrigin("http://localhost:3000")).toBe(
      "http://localhost:3000"
    );
    expect(canonicalOrigin("https://pricele-abc123.vercel.app")).toBe(
      "https://pricele-abc123.vercel.app"
    );
  });

  it("falls back rather than emitting a malformed canonical", () => {
    expect(canonicalOrigin("not a url")).toBe("https://www.pricele.online");
    expect(canonicalOrigin("")).toBe("https://www.pricele.online");
  });
});

describe("SITE_URL", () => {
  it("is an https origin with no trailing slash", () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });

  it("is never the bare apex", () => {
    expect(new URL(SITE_URL).hostname).not.toBe("pricele.online");
  });
});

describe("absoluteUrl", () => {
  it("builds URLs on the canonical origin", () => {
    expect(absoluteUrl("/items/big-mac")).toBe(`${SITE_URL}/items/big-mac`);
  });
});

describe("pageMetadata", () => {
  it("keeps the canonical and og:url in agreement", () => {
    const meta = pageMetadata({ path: "/prices/norway", title: "Prices in Norway" });
    expect(meta.alternates?.canonical).toBe("/prices/norway");
    expect(meta.openGraph?.url).toBe(`${SITE_URL}/prices/norway`);
  });

  it("does not disagree with itself over the home page's trailing slash", () => {
    const meta = pageMetadata({ path: "/" });
    expect(meta.alternates?.canonical).toBe("/");
    expect(meta.openGraph?.url).toBe(SITE_URL);
  });

  it("carries the share image every page needs, since Next replaces openGraph wholesale", () => {
    const meta = pageMetadata({ path: "/blog/a-post", type: "article" });
    expect(meta.openGraph?.images).toHaveLength(1);
    expect(meta.openGraph).toMatchObject({ siteName: "Pricele", type: "article" });
  });

  it("noindexes only when asked", () => {
    expect(pageMetadata({ path: "/blog" }).robots).toBeUndefined();
    expect(pageMetadata({ path: "/blog", index: false }).robots).toEqual({
      index: false,
      follow: true,
    });
  });
});

describe("titleFor", () => {
  it("applies the same template Next applies", () => {
    expect(titleFor("About")).toBe("About · Pricele");
    expect(titleFor()).toContain("Pricele");
  });
});

// The structured-data builders added for answer-engine visibility. What is
// worth testing about JSON-LD is not that a property exists — that is what the
// builder is — but the few rules that break silently later: the last breadcrumb
// must not link to itself, a Dataset must carry a licence, and freshness must
// never be asserted from nothing.

describe("breadcrumbJsonLd", () => {
  it("puts the site at the root of every trail", () => {
    const crumbs = breadcrumbJsonLd([{ name: "Prices", path: "/prices" }])
      .itemListElement;
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0]).toMatchObject({
      position: 1,
      name: "Pricele",
      item: SITE_URL,
    });
  });

  it("numbers positions from one, in order", () => {
    const crumbs = breadcrumbJsonLd([
      { name: "Prices", path: "/prices" },
      { name: "Norway", path: "/prices/norway" },
    ]).itemListElement;
    expect(crumbs.map((c) => c.position)).toEqual([1, 2, 3]);
    expect(crumbs.map((c) => c.name)).toEqual(["Pricele", "Prices", "Norway"]);
  });

  it("omits the item URL on the final crumb, which is the current page", () => {
    const crumbs = breadcrumbJsonLd([
      { name: "Prices", path: "/prices" },
      { name: "Norway", path: "/prices/norway" },
    ]).itemListElement;
    expect(crumbs[1]).toHaveProperty("item", absoluteUrl("/prices"));
    expect(crumbs[2]).not.toHaveProperty("item");
  });
});

describe("datasetJsonLd", () => {
  const base = { name: "Prices in Norway", description: "…", path: "/prices/norway" };

  it("always carries a licence and a creator, the two Search flags as missing", () => {
    const d = datasetJsonLd(base);
    expect(d.license).toBe(DATA_LICENSE_URL);
    expect(d.creator).toBeDefined();
    expect(d.maintainer).toBeDefined();
  });

  it("points the licence at a real section, not a bare page", () => {
    // /methodology#reuse has to exist; a licence URL landing on no section is
    // a claim the site does not make.
    expect(DATA_LICENSE_URL).toBe(absoluteUrl("/methodology#reuse"));
  });

  it("attaches the ISO country code as an entity anchor when given one", () => {
    const d = datasetJsonLd({ ...base, spatialCoverage: "Norway", countryCode: "NO" });
    expect(d.spatialCoverage).toMatchObject({
      "@type": "Country",
      name: "Norway",
      identifier: { propertyID: "ISO 3166-1 alpha-2", value: "NO" },
    });
  });

  it("never claims a modification date it was not given", () => {
    // A price table's freshness belongs to its sources. If this ever defaults
    // to the build date, every deploy asserts a price refresh that never
    // happened, which is precisely the aggregator behaviour this site exists
    // to be better than.
    expect(datasetJsonLd(base)).not.toHaveProperty("dateModified");
    expect(
      datasetJsonLd({ ...base, dateModified: "2026-07-01" })
    ).toHaveProperty("dateModified", "2026-07-01");
  });
});

describe("countryJsonLd", () => {
  it("disambiguates by ISO code, which a bare name cannot do", () => {
    // "Georgia" is the case that motivates this: the name alone does not say
    // whether the page is about the country or the US state.
    expect(countryJsonLd("Georgia", "GE")).toMatchObject({
      "@type": "Country",
      identifier: { value: "GE" },
    });
  });

  it("degrades to a bare name when no code is available", () => {
    expect(countryJsonLd("Norway")).toEqual({ "@type": "Country", name: "Norway" });
  });
});

describe("webPageJsonLd", () => {
  it("names the speakable selector the pages actually render", () => {
    // Paired with `data-answer` in components/ContentPage.tsx. Rename that
    // attribute and this selector points at nothing.
    const page = webPageJsonLd({ name: "n", description: "d", path: "/x" });
    expect(page.speakable.cssSelector).toContain("[data-answer]");
  });
});

describe("howToPlayJsonLd", () => {
  const howTo = howToPlayJsonLd() as {
    "@type": string;
    step: { "@type": string; position: number; name: string; text: string }[];
  };

  it("is a HowTo with ordered steps", () => {
    expect(howTo["@type"]).toBe("HowTo");
    expect(howTo.step.length).toBeGreaterThan(0);
    expect(howTo.step.map((s) => s.position)).toEqual(
      howTo.step.map((_, i) => i + 1)
    );
    for (const step of howTo.step) expect(step["@type"]).toBe("HowToStep");
  });

  it("states the two rules the game is actually scored on", () => {
    // If the win band or the guess count ever changes in lib/scoring.ts, this
    // fails — which is the point. A HowTo that disagrees with the game is worse
    // than no HowTo, because it is confidently wrong in a machine-readable way.
    const text = howTo.step.map((s) => s.text).join(" ");
    expect(text).toContain("five guesses");
    expect(text).toContain("5%");
  });
});

describe("organizationJsonLd", () => {
  const org = organizationJsonLd() as {
    logo: { "@type": string; url: string; width: number; height: number };
    sameAs: string[];
  };

  it("gives the logo as a raster with its dimensions stated", () => {
    // A bare SVG URL leaves both the format and the size to be discovered by
    // fetching the file. Every logo validator wants neither.
    expect(org.logo["@type"]).toBe("ImageObject");
    expect(org.logo.url).toMatch(/\.png$/);
    expect(org.logo.width).toBeGreaterThan(112);
    expect(org.logo.height).toBeGreaterThan(112);
  });

  it("only claims profiles that resolve", () => {
    // Guards the rule in lib/author.ts: an unverifiable sameAs is worse than an
    // absent one, so every entry must be a real absolute URL.
    for (const url of org.sameAs) expect(() => new URL(url)).not.toThrow();
  });
});

describe("gameJsonLd", () => {
  it("is typed as software as well as a game", () => {
    const game = gameJsonLd() as { "@type": string[] };
    expect(game["@type"]).toContain("VideoGame");
    expect(game["@type"]).toContain("SoftwareApplication");
  });

  it("claims no rating, because there is none to claim", () => {
    expect(gameJsonLd()).not.toHaveProperty("aggregateRating");
  });
});

describe("pageMetadata feed link", () => {
  it("re-declares the feed on every page", () => {
    // Next.js replaces `alternates` wholesale rather than merging it, so the
    // layout's copy is stripped from any page that sets a canonical — which is
    // every page. Without this the feed link would ship on none of them.
    const meta = pageMetadata({ path: "/prices" });
    expect(meta.alternates?.types).toEqual({
      "application/rss+xml": absoluteUrl("/feed.xml"),
    });
    expect(meta.alternates?.canonical).toBe("/prices");
  });
});
