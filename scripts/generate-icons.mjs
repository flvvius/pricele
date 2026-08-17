// Renders the icon files that browsers and crawlers fetch by convention:
//
//   app/favicon.ico                        -> /favicon.ico
//   public/apple-touch-icon.png            -> /apple-touch-icon.png
//   public/apple-touch-icon-precomposed.png-> /apple-touch-icon-precomposed.png
//
// WHY THESE EXIST AS FILES AND NOT JUST AS app/icon.svg:
//   app/icon.svg alone gets a <link rel="icon"> into the HTML, and that is
//   enough for a browser rendering a page. It is not enough for the crawlers,
//   because they do not read the link tag first. A user agent that wants a
//   site's icon asks for /favicon.ico at the root, and iOS asks for
//   /apple-touch-icon.png and /apple-touch-icon-precomposed.png, whether or not
//   anything links to them. With only the SVG shipped, all three answered 404
//   on every request, and Search Console reported the pile as "Not found (404)"
//   against the site. Serving the bytes is the whole fix.
//
// WHY A SCRIPT AND NOT HAND-DRAWN BINARIES:
//   Same reasoning as scripts/generate-og.mjs, which this follows: the design
//   stays in reviewable source rather than in a binary nobody can diff, and the
//   mark stays in step with app/icon.svg and the share card because all three
//   are built from the same palette and the same display face.
//
// RUN:  node scripts/generate-icons.mjs   (or `pnpm icons`)
//   Needs Playwright's Chromium. The font comes from .cache/og-fonts, which
//   scripts/generate-og.mjs populates; if it isn't there this fetches it once.
//   The outputs are committed, so this only runs when the mark changes.

import {
  writeFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const ICO_OUT = "app/favicon.ico";
const APPLE_OUT = "public/apple-touch-icon.png";
const APPLE_PRECOMPOSED_OUT = "public/apple-touch-icon-precomposed.png";
const CACHE = ".cache/og-fonts";

// The palette, copied rather than imported so this script stays runnable
// without the Next/Tailwind toolchain in the way. Matches app/icon.svg.
const PAPER = "#F2EDE1";
const INK = "#1A1613";
const ACCENT = "#C4321C";

/** The wordmark's first letter. The whole mark at 16px is this glyph. */
const LETTER = "P";

const SERIF_URL =
  "https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-2zI.ttf";

async function serifFont() {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, "instrument-serif.ttf");
  if (!existsSync(file)) {
    const res = await fetch(SERIF_URL);
    if (!res.ok) throw new Error(`font: ${res.status} ${res.statusText}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return readFileSync(file).toString("base64");
}

/**
 * One square tile of the mark at an arbitrary size.
 *
 * Everything scales off `size` rather than being drawn once and resampled: a
 * 16px favicon downscaled from 180px turns the accent bar to mud and the serif
 * to a smudge. Rendering each size natively keeps the bar a crisp whole number
 * of pixels and lets Chromium hint the glyph at the size it will actually be
 * seen at.
 *
 * `radius` is 0 for the .ico (Windows and browser tabs mask their own) and
 * non-zero for the Apple icon, which iOS composites onto the home screen as-is.
 */
function tile(font, size, radius = 0) {
  // The bar is 1/8 of the tile, floored to whole pixels so it never lands on a
  // half-pixel and blurs across two rows.
  const bar = Math.max(1, Math.round(size / 8));
  const fontSize = size * 0.74;
  // Optical centring for the cap: the serif's baseline sits high in the em box,
  // and the accent bar takes a bite out of the bottom, so the glyph is nudged
  // up off the geometric centre of the tile.
  const shift = bar / 2;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:'Display';src:url(data:font/ttf;base64,${font}) format('truetype');font-weight:400}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${size}px;height:${size}px;background:transparent}
  .tile{width:${size}px;height:${size}px;background:${INK};position:relative;
        overflow:hidden;border-radius:${radius}px;
        display:flex;align-items:center;justify-content:center}
  .letter{font-family:'Display';font-size:${fontSize}px;color:${PAPER};
          line-height:1;transform:translateY(-${shift}px);
          -webkit-font-smoothing:antialiased}
  .bar{position:absolute;left:0;right:0;bottom:0;height:${bar}px;background:${ACCENT}}
  </style></head><body>
  <div class="tile"><span class="letter">${LETTER}</span><div class="bar"></div></div>
  </body></html>`;
}

/**
 * Pack PNGs into an .ico.
 *
 * The format is a 6-byte header, one 16-byte directory entry per image, then
 * the image payloads. Every entry here is a whole PNG rather than the older BMP
 * encoding: PNG-in-ICO has been read by every browser since IE6 and by Windows
 * since Vista, and it means the payload is exactly what Chromium screenshotted.
 * A dimension of 256 is stored as 0, which is why the byte is masked.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + images.length * 16;

  for (const { size, png } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size & 0xff, 0); // width  (256 -> 0)
    entry.writeUInt8(size & 0xff, 1); // height (256 -> 0)
    entry.writeUInt8(0, 2); // palette size, 0 for truecolour
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

const font = await serifFont();
const browser = await chromium.launch();

async function render(size, radius = 0) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await page.setContent(tile(font, size, radius), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png", omitBackground: true });
  await page.close();
  return png;
}

// 16 for the browser tab, 32 for the bookmark bar and Windows taskbar, 48 for
// the desktop shortcut. Google's favicon crawler takes the largest it finds.
const ICO_SIZES = [16, 32, 48];
const icoImages = [];
for (const size of ICO_SIZES) {
  icoImages.push({ size, png: await render(size) });
}
mkdirSync("app", { recursive: true });
writeFileSync(ICO_OUT, ico(icoImages));

// 180x180 is the size current iOS asks for, and the one every smaller device
// downsamples from. Rounded to match the way iOS masks a home-screen icon.
const apple = await render(180, 40);
mkdirSync("public", { recursive: true });
writeFileSync(APPLE_OUT, apple);
// Older iOS, and a number of crawlers, ask for the "-precomposed" name instead
// and take a 404 for an answer otherwise. Same bytes, second name.
writeFileSync(APPLE_PRECOMPOSED_OUT, apple);

await browser.close();

for (const out of [ICO_OUT, APPLE_OUT, APPLE_PRECOMPOSED_OUT]) {
  console.log(`${out}  ${(statSync(out).size / 1024).toFixed(1)} KB`);
}
