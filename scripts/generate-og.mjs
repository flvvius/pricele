// Renders public/og.jpg, the social share card.
//
// WHY THIS EXISTS AS A SCRIPT AND NOT AS AN SVG:
//   The card used to be public/og.svg. No major platform renders SVG in a link
//   preview — WhatsApp, Facebook, iMessage, LinkedIn and Slack all require a
//   raster image — so every share of this site arrived with no picture at all.
//   The card has to ship as a raster, and a raster has to be produced by
//   something. That something is this script, so the design stays in reviewable
//   source rather than in a binary nobody can diff.
//
// WHY JPEG RATHER THAN PNG:
//   The printed-paper grain is the one part of this design PNG cannot compress
//   — it is noise by construction, so PNG's predictors have nothing to predict,
//   and the same card weighs 650KB as a PNG against ~%s as a JPEG. JPEG is
//   also the safer format for a share card in its own right: it cannot carry
//   transparency, and a transparent PNG composites against black in several
//   messaging clients. Opaque is the only correct thing for a preview.
//
// HOW IT RENDERS:
//   Chromium via Playwright, at exactly 1200x630. That gets the real brand
//   faces (Instrument Serif and IBM Plex Mono, the same two the site loads)
//   with real kerning and real letter-spacing, which an SVG with a font-family
//   list does not — it silently falls back to whatever the rasteriser has.
//
// RUN:  node scripts/generate-og.mjs
//   Needs network on first run to fetch the two fonts, and Playwright's
//   Chromium. The output PNG is committed, so this only runs when the design
//   changes. It prints the file size, because the size is a hard requirement
//   and not a curiosity: see the budget note below.

import { writeFileSync, mkdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const OUT = "public/og.jpg";
const CACHE = ".cache/og-fonts";

// WhatsApp is the tightest constraint of any platform and therefore the one
// worth designing to: previews reliably fail above ~300KB, especially for
// recipients on mobile data. A flat editorial design compresses far below that.
const SIZE_BUDGET_BYTES = 300 * 1024;

const FONTS = {
  serif:
    "https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-2zI.ttf",
  mono: "https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n5ig.ttf",
  monoBold:
    "https://fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3vAO8lc.ttf",
};

async function font(name, url) {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, `${name}.ttf`);
  if (!existsSync(file)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`font ${name}: ${res.status} ${res.statusText}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return readFileSync(file).toString("base64");
}

// The site's own palette, copied rather than imported so this script stays
// runnable without the Next/Tailwind toolchain in the way.
const PAPER = "#F2EDE1";
const INK = "#1A1613";
const MUTED = "#6B6055";
const FAINT = "#8C8175";
const RULE = "#D5CCB8";
// Cold to hot, the warmth meter's five tiers. The only colour in the piece,
// which is what makes it read as a guessing game at thumbnail size.
const WARMTH = ["#3E6E96", "#6E93A8", "#C09338", "#D2662A", "#C4321C"];

function html({ serif, mono, monoBold }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:'Display';src:url(data:font/ttf;base64,${serif}) format('truetype');font-weight:400}
  @font-face{font-family:'Mono';src:url(data:font/ttf;base64,${mono}) format('truetype');font-weight:400}
  @font-face{font-family:'Mono';src:url(data:font/ttf;base64,${monoBold}) format('truetype');font-weight:600}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:${PAPER};font-family:'Mono';
       position:relative;overflow:hidden;-webkit-font-smoothing:antialiased}

  /* Printed-paper grain. Very low opacity: at preview size it reads as warmth
     rather than as noise, and it keeps the card from looking like a flat
     template built in five minutes. */
  .grain{position:absolute;inset:0;opacity:.055;pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E")}
  /* Warm vignette, so the edges sit back and the centre carries. */
  .vig{position:absolute;inset:0;pointer-events:none;
    background:radial-gradient(120% 85% at 50% 42%, rgba(255,255,255,.5) 0%, rgba(255,255,255,0) 55%, rgba(120,100,70,.09) 100%)}

  .frame{position:absolute;inset:0;padding:46px 80px;display:flex;
         flex-direction:column;align-items:center}

  .kicker{font-size:19px;font-weight:600;letter-spacing:.34em;color:${FAINT};
          text-transform:uppercase;line-height:1.25}
  .rules{width:100%;margin-top:22px}
  .rule-heavy{height:5px;background:${INK}}
  .rule-thin{height:2px;background:${INK};margin-top:7px}

  .mark{font-family:'Display';font-size:150px;line-height:.92;color:${INK};
        margin-top:26px;letter-spacing:-.012em}
  .tag{font-size:27px;font-weight:600;letter-spacing:.3em;color:${MUTED};
       text-transform:uppercase;margin-top:14px;line-height:1.2}

  /* The hook. A figure with its digits struck out is the whole proposition of
     the game in one glyph-run: there is a real published number here and you
     do not know it. It is the largest mono element on the card for that reason. */
  .hero{display:flex;align-items:center;gap:14px;margin-top:30px}
  .hero .digit{font-size:78px;font-weight:600;color:${INK};line-height:1}
  .block{width:48px;height:64px;background:${INK};border-radius:3px}

  .chips{display:flex;gap:12px;margin-top:30px}
  .chip{width:96px;height:26px;border-radius:2px}

  .foot{width:100%;margin-top:auto}
  .foot .hair{height:2px;background:${RULE}}
  .foot .line{margin-top:16px;text-align:center;font-size:21px;font-weight:600;
              letter-spacing:.26em;color:${FAINT};text-transform:uppercase;line-height:1.2}
  </style></head><body>
  <div class="grain"></div><div class="vig"></div>
  <div class="frame">
    <div class="kicker">The Daily Edition</div>
    <div class="rules"><div class="rule-heavy"></div><div class="rule-thin"></div></div>
    <div class="mark">Pricele</div>
    <div class="tag">Guess the price</div>
    <div class="hero">
      <span class="digit">$</span><div class="block"></div>
      <span class="digit">.</span><div class="block"></div><div class="block"></div>
    </div>
    <div class="chips">${WARMTH.map((c) => `<div class="chip" style="background:${c}"></div>`).join("")}</div>
    <div class="foot"><div class="hair"></div>
      <div class="line">A new item &amp; country daily &middot; 5 tries</div></div>
  </div></body></html>`;
}

const fonts = {
  serif: await font("instrument-serif", FONTS.serif),
  mono: await font("plex-mono", FONTS.mono),
  monoBold: await font("plex-mono-600", FONTS.monoBold),
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html(fonts), { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
// Quality 92: high enough that the serif wordmark shows no ringing at full
// size, low enough to land an order of magnitude inside the budget.
await page.screenshot({ path: OUT, type: "jpeg", quality: 92 });
await browser.close();

const bytes = statSync(OUT).size;
console.log(`${OUT}  ${(bytes / 1024).toFixed(1)} KB  1200x630`);
if (bytes > SIZE_BUDGET_BYTES) {
  console.error(
    `FAIL: over the ${SIZE_BUDGET_BYTES / 1024} KB budget — WhatsApp previews start failing here.`
  );
  process.exit(1);
}
