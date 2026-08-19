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

17 items × 33 countries, 503 price rows. The table is deliberately **sparse**:
a pair exists only where there's a real sourced number, never padded with
invented ones. LPG appears in 16 countries because that is where it is sold as a
road fuel; natural gas in 25 because that is where households are on a gas grid.
An absent row is usually a fact about the country, not a gap in the research.

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

`data/rotation.ts` holds the ordered lists and a start date. The day's puzzle is:

```
country = countryOrder[daysSince(startDate) % 33]
item    = itemOrder   [(daysSince(startDate) - itemOrderFrom) % 17]
```

The lengths are **coprime**, so a pair only recurs every 561 days. `countryOrder`
is append-only: reordering or inserting silently rewrites which puzzle every past
day had, breaking the archive and every share card already posted.

`itemOrder` could not stay append-only, because the catalogue grew from 7 items
to 17 and *any* change of length moves `dayIndex % length` for every day at once.
So the seven-item schedule the game launched with is frozen in `legacyItemOrder`,
and the new list takes over at `itemOrderFrom`, a day index that was still in the
future when it was set. Days already played keep the item they were played with;
a test asserts it day by day. If the catalogue changes again, do the same thing
rather than editing `itemOrder` in place.

A test enforces the coprimality, another walks 400 days asserting every one
resolves to a real price row, and a third walks a full 561-day cycle asserting
that every one of the 503 rows is reachable.

When a country lacks the scheduled item, `getDailyPuzzle` walks forward through
`itemOrder` to the next item it does have. The substitution is a pure function of
the day index, so it's identical on every device and every rebuild.

### Where the prices come from

Every row carries its own `source` and `sourceDate`, both surfaced in the UI,
because the sources refresh at wildly different intervals.

| Items | Source | Refresh |
| --- | --- | --- |
| Big Mac | The Economist's [Big Mac Index](https://github.com/TheEconomist/big-mac-data) | `pnpm refresh-big-mac` |
| Diesel, LPG, electricity, natural gas | [GlobalPetrolPrices.com](https://www.globalpetrolprices.com/) | `pnpm refresh-open-prices` |
| Cigarettes, vape e-liquid, beer, spirits | [WHO Global Health Observatory](https://www.who.int/data/gho) tax surveys, 2024 | `pnpm refresh-open-prices` |
| Mobile data | [Cable.co.uk](https://www.cable.co.uk/mobiles/worldwide-data-pricing/) league table | `pnpm refresh-open-prices` |
| A day's healthy diet | World Bank / FAO Food Prices for Nutrition | `pnpm refresh-open-prices` |
| Cappuccino, milk, eggs, apples, gasoline | Numbeo country price rankings | by hand |
| Coca-Cola | hand-curated table from the original dataset | by hand |
| Wage figures | our own estimates, the weakest numbers here | by hand |

Notes worth knowing before editing any of it:

- **The Big Mac euro area** is published as a single price, so all 7 eurozone
  countries share it, labelled as such. A snapshot of the upstream CSV is
  committed at `data/sources/`.
- **The Numbeo and Coca-Cola rows are edited directly in `data/prices.json`.**
  No script touches them; Numbeo rate-limits, and bulk scraping is against their
  terms.
- **`pnpm refresh-open-prices` owns ten items wholesale** and rebuilds every row
  for them. It fetches one page per country from GlobalPetrolPrices (their
  robots.txt is `Allow: /`, and only the country pages carry the local-currency
  price), so a full run takes a couple of minutes. A normalised snapshot lands in
  `data/sources/open-prices.json`, and `--offline` rebuilds from it.
- **Electricity and natural gas are the only rescaled figures on the site**,
  stored per 100 kWh rather than the published per-kWh, because a price between
  $0.02 and $0.40 rounds to nothing readable. Every other figure is stored as
  published.
- **`priceLocal` is optional.** Cable.co.uk publishes dollars and nothing else,
  so those rows carry no local price rather than a back-converted one, and the UI
  omits the line. `formatLocal()` returns `null` for them.
- **Licensing is not uniform, and two sources are stricter than this site.**
  GlobalPetrolPrices is CC BY-NC-ND 3.0 and WHO data is CC BY-NC-SA 3.0 IGO; both
  carry a non-commercial condition, and the site runs AdSense. World Bank and FAO
  data is CC BY 4.0. `/methodology#reuse` states all of this in public.

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

### Being recommended, as distinct from being indexed

The list above is close to finished, and it is worth being blunt that it is not
what makes an AI assistant recommend the game. Published breakdowns of how the
major assistants choose put 41–68% of the weight on mentions in third-party
lists and directories — pages on domains we don't control. A site can have
flawless schema and still be invisible, which is currently the case here.

Two things follow. `/daily-games` (`app/daily-games/page.tsx`, from
`data/similar-games.ts`) exists to answer the question the genre is actually
discovered through, and to state our own comparison against the competing price
games in words we chose rather than leaving it to whoever writes the listicle.
It carries `ItemList` schema via `gameListJsonLd()`, and it names the games that
beat us, because a list page that flatters its author is worth nothing to a
reader or to anything summarising it.

The rest of the work is off-site and manual. **[`docs/visibility.md`](docs/visibility.md)**
holds the directory targets with their submission mechanics, the ready-to-paste
copy, the outreach list, and a status table to keep updated. Read it before
writing another guide: another guide has close to zero marginal effect on being
recommended, and a DleList entry has a large one.

`/llms.txt` (`app/llms.txt/route.ts`) is generated from the same data the pages
are. Read the comment at the top of that file before assuming it does anything;
it is cheap insurance against a convention that may not get adopted, not a
strategy.

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
pnpm test                       # 100 unit tests
pnpm build                      # production build
pnpm refresh-big-mac            # pull the latest Economist edition
pnpm refresh-big-mac --check    # CI guard: fail if Big Mac rows are stale
pnpm refresh-open-prices        # re-pull the ten openly-sourced items
pnpm refresh-open-prices --check   # CI guard: fail if any of them is stale
```

Prices are national averages published for general interest, not shopping advice.
