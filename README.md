# Pricele

A daily price-guessing game. Each day pairs one everyday item with one country:
a Big Mac in Norway, a cappuccino in Japan, a litre of petrol in Egypt. You
guess the price in USD in up to 5 tries, with hotter/colder feedback on a log
scale. Both the item and the country change daily.

There's no backend. Game data is static JSON bundled at build time, and player
state (today's guesses and your streak) lives in `localStorage`, keyed by the
player's local date, so the puzzle resets at their own midnight. The site is
built with Next.js and statically generated, so it deploys to Vercel with no config.

## Content model

7 items × 33 countries, 226 price rows. The table is deliberately **sparse**:
a pair exists only where there's a real sourced number, never padded with
invented ones. Lebanon, for example, has only 2 of the 7 items.

| Concern            | Where                                                        |
| ------------------ | ------------------------------------------------------------ |
| Scoring            | `lib/scoring.ts` (+ `lib/scoring.test.ts`)                   |
| "Today" logic      | `lib/puzzle.ts` (+ `lib/puzzle.test.ts`)                      |
| Reference-page data| `lib/catalog.ts`                                             |
| Player state       | `lib/storage.ts`                                             |
| Share card         | `lib/share.ts`                                               |
| UI                 | `components/`                                                |
| Price data         | `data/prices.json`, `data/items.ts`, `data/rotation.ts`       |
| Editorial copy     | `data/countries.ts`, `data/articles.ts`                       |

### The daily rotation

`data/rotation.ts` holds two ordered lists and a start date. The day's puzzle is:

```
country = countryOrder[daysSince(startDate) % 33]
item    = itemOrder   [daysSince(startDate) % 7]
```

The lengths are **coprime**, so a pair only recurs every 231 days. Both lists are
append-only: reordering or inserting silently rewrites which puzzle every past
day had, breaking the archive and every share card already posted. A test
enforces the coprimality, and another walks 400 days asserting every one resolves
to a real price row.

When a country lacks the scheduled item, `getDailyPuzzle` walks forward through
`itemOrder` to the next item it does have. The substitution is a pure function of
the day index, so it's identical on every device and every rebuild.

### Where the prices come from

- **Big Mac.** The Economist's Big Mac Index, published openly at
  [TheEconomist/big-mac-data](https://github.com/TheEconomist/big-mac-data).
  Reproducible: `pnpm refresh-big-mac`. A snapshot of the upstream CSV is
  committed at `data/sources/`. The euro area is published as a single price, so
  all 7 eurozone countries share it, labelled as such.
- **Cappuccino, milk, eggs, apples, gasoline.** Numbeo country price rankings,
  retrieved by hand (they rate-limit, and bulk scraping is against their terms).
  Edited directly in `data/prices.json`.
- **Coca-Cola.** A hand-curated table carried over from the original dataset.
- **Wage figures.** Our own estimates, and the weakest numbers here. `/methodology`
  says so plainly rather than burying it.

Every row carries its own `source` and `sourceDate`, both surfaced in the UI.

## Answer suppression

The reference pages would otherwise be an answer key. Two rules keep them honest,
and tests assert the two agree:

- **`suppressedPairs()`** hides the (item, country) pairs for yesterday, today and
  tomorrow in UTC. The game rolls over at each player's *local* midnight but these
  pages are statically cached, so a three-day window covers UTC-12 to UTC+14.
  Suppressed rows render as "hidden, in play right now" rather than being dropped,
  since an absent row would itself be a hint.
- **`publishedArchiveDates()`** stops two days back, for the same reason. Recent
  dates 404 rather than rendering.

Because consecutive days are always different countries, at most one item is ever
hidden on a given country page.

## SEO

Everything is statically rendered for search engines and AI answer engines:

- **Structured data** (`lib/seo.ts`, `components/JsonLd.tsx`): site-wide
  `VideoGame` and `WebSite` schema, `FAQPage` on the home page, `Dataset` on the
  price and item pages, `Article` on archive entries, `BlogPosting` on guides.
  `Dataset` is built by `datasetJsonLd()` rather than inline, so every one of
  them carries the `license` Search Console asks for, pointing at the reuse
  terms in `/methodology#reuse`, since the underlying prices are third-party.
- **Crawlable content**: every reference page is server-rendered HTML. The home
  page ships copy and an FAQ below the (client-side) game, so crawlers get real
  text, not an empty shell.
- **Technical SEO**: dynamic `sitemap.xml` (which excludes anything noindexed),
  `robots.txt`, PWA `manifest`, canonical URLs, Open Graph / Twitter cards.
- **One canonical origin** (`CANONICAL_HOST` in `lib/seo.ts`): `www.pricele.online`,
  because that is the primary domain on Vercel and the apex 308s to it. Every
  canonical tag, `og:url`, sitemap `<loc>` and JSON-LD `url` derives from it, so
  they cannot drift apart, and none of them can end up naming a URL that
  redirects, which is not a thing a canonical is allowed to be.

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com        # falls back to www.pricele.online
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...            # optional
NEXT_PUBLIC_BING_SITE_VERIFICATION=...              # optional
```

> **Changing the domain.** Change the primary domain in Vercel first, then set
> `CANONICAL_HOST` in `lib/seo.ts` to match. The two have to agree: a canonical
> URL must answer `200`, and the apex/`www` pair only ever has one host that
> does. `lib/seo.test.ts` fails if the canonical origin goes back to the apex,
> and `canonicalOrigin()` rewrites a `NEXT_PUBLIC_SITE_URL` that points there.
>
> In Search Console, use a **Domain property** rather than a URL-prefix one.
> A URL-prefix property registered on the apex reports on URLs the site no
> longer serves.

### Guides

`data/articles.ts` holds 10 article scaffolds. Each starts as `status: "draft"`:
reachable by direct URL, but `noindex`, absent from the sitemap, and unlisted on
`/blog`. Fill in `body`, drop the `outline`, flip `status` to `"published"`, and
the index, sitemap and robots tag all follow automatically. Nothing half-written is
ever offered to a crawler.

## Ads

Monetization is Google AdSense, placed manually for the best revenue-to-UX
ratio rather than intrusive Auto Ads. The loader script and the
`google-adsense-account` verification meta ship on every page, and `/ads.txt`
is generated from the publisher id (`app/ads.txt/route.ts`), all driven by
`lib/ads.ts`. The publisher id defaults to the site's account and is
overridable per-deploy.

Ad **units** are opt-in and never appear during play. The one labeled unit
sits on the post-game Reveal screen, with space reserved so a slow ad never
shifts the layout (`components/AdSlot.tsx`). A unit renders only once its slot
id is set, so there are never empty placeholder boxes:

```bash
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX   # optional; overrides the default
NEXT_PUBLIC_ADSENSE_SLOT_REVEAL=1234567890           # unit id for the Reveal screen
```

Setting `NEXT_PUBLIC_ADSENSE_CLIENT` to a blank/malformed value turns everything
off and the build is byte-for-byte ad-free.

## Develop

```bash
pnpm install
pnpm dev                        # http://localhost:3000
pnpm test                       # 60 unit tests
pnpm build                      # production build
pnpm refresh-big-mac            # pull the latest Economist edition
pnpm refresh-big-mac --check    # CI guard: fail if Big Mac rows are stale
```

Prices are national averages published for general interest, not shopping advice.
