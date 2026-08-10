import { describe, it, expect } from "vitest";
import { SITE_URL, canonicalOrigin, absoluteUrl, pageMetadata, titleFor } from "./seo";

// These guard the canonical origin, which is the one piece of SEO config the
// site cannot self-correct. A canonical URL that redirects is not a canonical
// URL, and when this file previously named the apex — which 308s to www —
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
