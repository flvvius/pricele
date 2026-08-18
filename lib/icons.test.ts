import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// These guard the three icon files that crawlers fetch by convention rather
// than by following a link. Shipping only app/icon.svg left /favicon.ico,
// /apple-touch-icon.png and /apple-touch-icon-precomposed.png answering 404 on
// every request, and Search Console reported the pile as "Not found (404)"
// against the site. The files are build artefacts of scripts/generate-icons.mjs
// and are committed, so nothing at request time can catch it if they go
// missing — hence checking them here.
//
// The paths are asserted rather than the pixels: what broke was the absence of
// bytes at a URL, not the design.

const root = join(__dirname, "..");

/** Where each file has to sit for Next to serve it at the URL crawlers ask for. */
const ICONS = [
  { file: "app/favicon.ico", url: "/favicon.ico", kind: "ico" },
  { file: "app/icon.svg", url: "/icon.svg", kind: "svg" },
  { file: "public/apple-touch-icon.png", url: "/apple-touch-icon.png", kind: "png" },
  {
    file: "public/apple-touch-icon-precomposed.png",
    url: "/apple-touch-icon-precomposed.png",
    kind: "png",
  },
] as const;

describe("icon files", () => {
  for (const { file, url } of ICONS) {
    it(`ships ${file}, so ${url} is not a 404`, () => {
      expect(existsSync(join(root, file))).toBe(true);
    });
  }
});

describe("icon file formats", () => {
  it("favicon.ico is a real ICO carrying the three sizes browsers ask for", () => {
    const buf = readFileSync(join(root, "app/favicon.ico"));

    // ICONDIR: reserved 0, type 1 (icon), then the image count.
    expect(buf.readUInt16LE(0)).toBe(0);
    expect(buf.readUInt16LE(2)).toBe(1);
    const count = buf.readUInt16LE(4);
    expect(count).toBe(3);

    const sizes: number[] = [];
    for (let i = 0; i < count; i++) {
      const entry = 6 + i * 16;
      // A 0 in the dimension byte means 256; nothing here is that large.
      sizes.push(buf.readUInt8(entry) || 256);

      const bytes = buf.readUInt32LE(entry + 8);
      const offset = buf.readUInt32LE(entry + 12);
      expect(offset + bytes).toBeLessThanOrEqual(buf.length);

      // Each payload is a whole PNG, which is what makes the file readable by
      // browsers without a BMP encoder in the generator.
      const png = buf.subarray(offset, offset + 8);
      expect([...png]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    }
    expect(sizes).toEqual([16, 32, 48]);
  });

  it("the apple icons are 180x180 PNGs, the size current iOS asks for", () => {
    for (const file of [
      "public/apple-touch-icon.png",
      "public/apple-touch-icon-precomposed.png",
    ]) {
      const buf = readFileSync(join(root, file));
      expect([...buf.subarray(0, 8)]).toEqual([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      // IHDR is always the first chunk: 8 bytes of signature, 4 of length, 4 of
      // type, then width and height as big-endian 32-bit ints.
      expect(buf.subarray(12, 16).toString("ascii")).toBe("IHDR");
      expect(buf.readUInt32BE(16)).toBe(180);
      expect(buf.readUInt32BE(20)).toBe(180);
    }
  });

  it("serves the precomposed variant from the same bytes as the plain one", () => {
    const plain = readFileSync(join(root, "public/apple-touch-icon.png"));
    const pre = readFileSync(
      join(root, "public/apple-touch-icon-precomposed.png")
    );
    // Compared as a plain Uint8Array rather than Buffer-to-Buffer: recent
    // @types/node parameterises Buffer over its backing ArrayBuffer, so
    // Buffer.equals(Buffer) no longer typechecks even though it runs fine.
    expect(pre.equals(new Uint8Array(plain))).toBe(true);
  });
});
