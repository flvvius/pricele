import { describe, it, expect } from "vitest";
import { statSync, readFileSync } from "node:fs";
import { pageMetadata } from "./seo";

// The share card was an SVG for the site's whole life, and no major platform
// rasterises SVG for a link preview — WhatsApp, Facebook, iMessage, LinkedIn and
// Slack all reject it — so every shared link arrived with no picture at all.
// Nothing in the type system stops that being reintroduced, so it is checked here.

const OG = "public/og.jpg";

/** Width/height straight out of the JPEG's SOF0 marker. */
function jpegSize(path: string): { width: number; height: number } {
  const buf = readFileSync(path);
  expect(buf.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8])); // SOI
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error("not a JPEG segment");
    const marker = buf[i + 1];
    // SOF0/1/2 carry the frame dimensions.
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error("no SOF marker");
}

describe("the share card", () => {
  it("is a raster, because no platform previews an SVG", () => {
    const images = pageMetadata({ path: "/" }).openGraph?.images;
    const url = JSON.stringify(images);
    expect(url).toContain("/og.jpg");
    expect(url).not.toContain(".svg");
  });

  it("declares the dimensions every crawler reads, and they are true", () => {
    const [image] = pageMetadata({ path: "/" }).openGraph?.images as {
      width: number;
      height: number;
      type: string;
    }[];
    expect(image.type).toBe("image/jpeg");
    // 1200x630 is the 1.91:1 shape Facebook, WhatsApp and X all crop to.
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(jpegSize(OG)).toEqual({ width: image.width, height: image.height });
  });

  it("stays inside WhatsApp's size budget", () => {
    // Previews start failing above ~300KB, worst on mobile data. The editorial
    // design lands an order of magnitude under; this catches a heavy redesign.
    expect(statSync(OG).size).toBeLessThan(300 * 1024);
  });

  it("ships a twitter:image too, since X does not read og:image", () => {
    expect(JSON.stringify(pageMetadata({ path: "/" }).twitter)).toContain("/og.jpg");
  });
});
