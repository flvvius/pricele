# Pricele

A daily price-guessing game. Each day you guess the price of a fixed item (this
month, a 330ml Coca-Cola can) in a different country, in up to 5 tries, with
hotter/colder feedback on a log scale. The country changes daily; the item
changes monthly.

There's no backend. Game data is static JSON bundled at build time, and player
state (today's guesses and your streak) lives in `localStorage`, keyed by UTC
date. The site is built with Next.js and statically generated, so it deploys to
Vercel with no config.

## SEO

Everything is statically rendered for search engines and AI answer engines:

- **Structured data** (`lib/seo.ts`, `components/JsonLd.tsx`): site-wide
  `VideoGame`, `WebSite`, and `Organization` schema, `FAQPage` on the home and
  country pages, `ItemList` on `/prices`, and `BreadcrumbList` on reference pages.
- **Crawlable content**: the home page ships server-rendered copy and an FAQ
  below the (client-side) game, so crawlers get real text, not an empty shell.
- **Compounding reference pages** (`/prices`, `/prices/[country]`): one static,
  indexable page per country targeting "how much does a … cost in <country>",
  generated straight from `data/prices.json`. Add a country and it appears in the
  nav, the sitemap, and its own page automatically.
- **Technical SEO**: dynamic `sitemap.xml`, `robots.txt`, PWA `manifest`,
  canonical URLs, rich Open Graph / Twitter cards, and a theme color.

Set the canonical origin and (optional) search-console verification via env vars:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com        # falls back to the Vercel URL
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...            # optional
NEXT_PUBLIC_BING_SITE_VERIFICATION=...              # optional
```

## Ads

Monetization is Google AdSense, placed manually for the best revenue-to-UX
ratio rather than intrusive Auto Ads. There is exactly one labeled unit per
view, and **never during active play** — ads only appear on the post-game
Reveal screen and on the `/prices` reference pages (long-dwell, high commercial
intent). Space is reserved so a slow ad never shifts the layout.

Everything is env-gated: with no publisher ID the site renders **completely
ad-free** — no loader script, no placeholders, no `ads.txt`. To go live, set:

```bash
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX   # your AdSense publisher ID
NEXT_PUBLIC_ADSENSE_SLOT_REVEAL=1234567890           # unit id for the Reveal screen
NEXT_PUBLIC_ADSENSE_SLOT_CONTENT=0987654321          # unit id for the /prices pages
```

Create the two display ad units in the AdSense dashboard to get their slot ids.
The loader script (`app/layout.tsx`), the `google-adsense-account` meta tag, and
`/ads.txt` (`app/ads.txt/route.ts`) are all wired from `NEXT_PUBLIC_ADSENSE_CLIENT`.
Config and the `<AdSlot>` component live in `lib/ads.ts` and `components/AdSlot.tsx`.

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
`countryOrder[daysSinceUTC(startDate, today) % length]`, so reordering the list
changes the difficulty curve without touching any dates.

The seed `prices.json` ships with about ten hand-entered countries marked
`"source": "Seed estimate"`. Replace them with verified numbers and add more
before launch. See `scripts/collect-prices.ts` for a starting point.

Prices are rough estimates for a daily game, not shopping advice.
