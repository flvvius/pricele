# Pricele

A daily price-guessing game. Each day you guess the price of a fixed item (this
month, a 330ml Coca-Cola can) in a different country, in up to 5 tries, with
hotter/colder feedback on a log scale. The country changes daily; the item
changes monthly.

There's no backend. Game data is static JSON bundled at build time, and player
state (today's guesses and your streak) lives in `localStorage`, keyed by the
player's local date, so the puzzle resets at their own midnight. The site is
built with Next.js and statically generated, so it deploys to Vercel with no config.

## SEO

Everything is statically rendered for search engines and AI answer engines:

- **Structured data** (`lib/seo.ts`, `components/JsonLd.tsx`): site-wide
  `VideoGame` and `WebSite` schema, plus `FAQPage` on the home page.
- **Crawlable content**: the home page ships server-rendered copy and an FAQ
  below the (client-side) game, so crawlers get real text, not an empty shell.
- **Technical SEO**: dynamic `sitemap.xml`, `robots.txt`, PWA `manifest`,
  canonical URLs, rich Open Graph / Twitter cards, and a theme color.

> Note: there are intentionally **no** per-country price pages. Listing every
> country's price would let players look up the day's answer, so those reference
> pages were removed.

Set the canonical origin and (optional) search-console verification via env vars:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com        # falls back to the Vercel URL
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...            # optional
NEXT_PUBLIC_BING_SITE_VERIFICATION=...              # optional
```

## Ads

Monetization is Google AdSense. The loader script and the
`google-adsense-account` verification meta ship on every page, and `/ads.txt`
is generated from the publisher id (`app/ads.txt/route.ts`) — all driven by
`lib/ads.ts`. The publisher id defaults to the site's account and is
overridable per-deploy.

Ad **units** are opt-in and never appear during play — the one labeled unit
sits on the post-game Reveal screen, with space reserved so a slow ad never
shifts the layout (`components/AdSlot.tsx`). A unit renders only once its slot
id is set, so there are never empty placeholder boxes:

```bash
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX   # optional; overrides the default
NEXT_PUBLIC_ADSENSE_SLOT_REVEAL=1234567890           # unit id for the Reveal screen
```

Create the display ad unit in the AdSense dashboard to get its slot id. Setting
`NEXT_PUBLIC_ADSENSE_CLIENT` to a blank/malformed value turns everything off and
the build is byte-for-byte ad-free.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # scoring unit tests
pnpm build      # production build
```

## Layout

| Concern           | Where                                                  |
| ----------------- | ------------------------------------------------------ |
| Scoring           | `lib/scoring.ts` (+ `lib/scoring.test.ts`)             |
| "Today" logic     | `lib/puzzle.ts`                                        |
| Player state      | `lib/storage.ts`                                       |
| Share card        | `lib/share.ts`                                         |
| UI                | `components/`                                          |
| Content           | `data/prices.json`, `data/rotation.ts`, `data/item.ts` |

### Content

`data/item.ts` holds the active item for the month. `data/prices.json` has one
row per country: the price in USD and local currency, plus the average local
hourly wage that drives the reveal stat. `data/rotation.ts` is an ordered list
of country codes and a start date; the day's country is
`countryOrder[daysSince(startDate, today) % length]` in the player's local time,
so reordering the list changes the difficulty curve without touching any dates.

`prices.json` ships with 33 countries. Most prices come from a per-country
Coca-Cola 330ml comparison (marked `"source": "Burger Parity, 2026"`); a few
low-price countries are marked `"source": "Seed estimate"`. The average wage
figures are estimates. Verify before launch; see `scripts/collect-prices.ts`.

Prices are rough estimates for a daily game, not shopping advice.
