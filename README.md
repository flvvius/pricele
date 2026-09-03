# Pricele

A daily price-guessing game. Each day pairs one everyday item with one country:
a Big Mac in Norway, a cappuccino in Japan, a litre of petrol in Egypt. You
guess the price in USD in up to 5 tries, with hotter/colder feedback on a log
scale. Both the item and the country change daily.

Game data is static JSON bundled at build time, and player state (today's
guesses, your streak, your history) lives in `localStorage`, keyed by the
player's local date, so the puzzle resets at their own midnight. The site is
built with Next.js and every page is statically rendered.

Three server routes exist and all three are optional: `/api/crowd` for the daily
counters, and `/api/room` plus `/api/room/[code]` for classrooms. Without
`DATABASE_URL` set they return `{ enabled: false }`, the crowd figures and the
classroom disappear, and the daily game is byte-for-byte what it was before. See
[Crowd statistics](#crowd-statistics) and [Classrooms](#classrooms).

## Content model

17 items × 49 countries, 641 price rows. The table is deliberately **sparse**:
a pair exists only where there's a real sourced number, never padded with
invented ones. LPG appears in 24 countries because that is where it is sold as a
road fuel; natural gas in 31 because that is where households are on a gas grid.
The Numbeo-sourced groceries stop at the 33 countries the game launched with,
because they are collected by hand. An absent row is usually a fact about the
country rather than a gap in the research, and the country pages say which.

| Concern            | Where                                                        |
| ------------------ | ------------------------------------------------------------ |
| Scoring            | `lib/scoring.ts` (+ `lib/scoring.test.ts`)                   |
| "Today" logic      | `lib/puzzle.ts` (+ `lib/puzzle.test.ts`)                      |
| Reference-page data| `lib/catalog.ts`                                             |
| Player state       | `lib/storage.ts` (totals), `lib/history.ts` (per-day tape)   |
| Share card         | `lib/share.ts` (the Receipt), `lib/weekshare.ts`             |
| Reveal copy        | `lib/verdict.ts`, `data/facts.ts`, `lib/hints.ts`            |
| The baseline model | `lib/bot.ts`                                                 |
| Crowd stats        | `lib/db.ts`, `lib/crowd.ts`, `app/api/crowd`, `db/schema.sql` |
| Classrooms         | `lib/room.ts`, `app/api/room`                                |
| Side modes         | `lib/higherlower.ts`, `lib/whereintheworld.ts`               |
| UI                 | `components/`                                                |
| Price data         | `data/prices.json`, `data/items.ts`, `data/rotation.ts`       |
| Country roster     | `COUNTRY_META` in `data/countries.ts`                         |
| Editorial copy     | `data/countries.ts`, `data/articles.ts`                       |

### The daily rotation

`data/rotation.ts` holds the ordered lists and a start date. The day's puzzle is:

```
country = countryOrder[(daysSince(startDate) - countryOrderFrom) % 49]
item    = itemOrder   [(daysSince(startDate) - itemOrderFrom)    % 17]
```

The lengths are **coprime**, so a pair only recurs every 833 days.

Neither list can be edited in place, and the reason is worth understanding before
touching either. *Any* change of length moves `dayIndex % length` for every day
at once, so growing the catalogue from 7 items to 17, or the roster from 33
countries to 49, would have silently rewritten which puzzle every past day had —
breaking the archive and every share card already posted.

So each list has a frozen twin. `legacyCountryOrder` and `legacyItemOrder` hold
the schedules the game was actually played on, and the live lists take over at
`countryOrderFrom` / `itemOrderFrom`, day indices that were still in the future
when they were set. Days already played keep the country and the item they were
played with, and tests assert both, day by day, against the frozen lists.

That is also what makes the live lists free to *reorder*, which append-only never
was. Both are arranged against two things at once:

- **Variety.** Consecutive days move between price tiers and between item
  categories, rather than running three groceries or three rich countries
  together.
- **Fallback collisions.** When a country doesn't stock the scheduled item the
  puzzle falls through to the next one it does have, so two thinly-stocked
  countries in a row can land on the same fallback and show the same item twice
  running. That is *entirely* a function of the two orderings: an unconsidered
  arrangement put it at 17% of days, and the current pair holds it under 2.5%.
  A test measures it, so a well-meant reshuffle cannot quietly undo it.

`countryOrder` is a cycle, so it is also rotated to start clear of the countries
that came up in the last week of the old schedule. Without that the seam at the
changeover showed the UAE twice inside seven days.

**Changing either list again** means pushing the current one onto the legacy
chain and setting a new `...From` in the future — not editing a live list whose
changeover day has passed.

A test enforces the coprimality, another walks 400 days asserting every one
resolves to a real price row, and a third walks a full 833-day cycle asserting
that every one of the 641 rows is reachable.

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
| Wage figures | ILO average hourly earnings where published, in-house estimates otherwise | by hand |

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
- **Wages come in two kinds, and `COUNTRY_META` says which.** The 33 launch
  countries carry in-house estimates; countries added since carry the ILO's
  published average hourly earnings for the year named. Migrating the rest would
  move every work-time figure on the site at once, including on already-played
  archive pages, so it is a separate decision. The ILO publishes no hourly figure
  for six of the originals, so some estimates survive any migration.
- **Adding a country** means an entry in `COUNTRY_META`, `COUNTRY_TAX` and
  `COUNTRY_NOTES`, the publisher aliases in both refresh scripts, and an append
  to `countryOrder`. Then run both scripts. Tests fail if any of those is missed.
- **Licensing is not uniform, and two sources are stricter than this site.**
  GlobalPetrolPrices is CC BY-NC-ND 3.0 and WHO data is CC BY-NC-SA 3.0 IGO; both
  carry a non-commercial condition, and the site runs AdSense. World Bank and FAO
  data is CC BY 4.0. `/methodology#reuse` states all of this in public.

## Site structure

Every route the site serves. Counts are deliberately absent: the sitemap is
generated from `data/`, so the number of country, item, archive and guide pages
moves whenever the data does, and a number written here would be wrong within a
week. `app/sitemap.ts` is the authority, and it lists exactly the indexable set —
drafts carry `noindex` and are excluded from it.

| Route                  | What it is                                                        |
| ---------------------- | ----------------------------------------------------------------- |
| `/`                    | The game. One item in one country, five guesses, FAQ and copy below |
| `/prices`              | Every country priced, with the full basket                         |
| `/prices/[country]`    | One country: what each item costs, in USD, local currency and work time |
| `/items`               | Every item in the catalogue, with its price range                  |
| `/items/[item]`        | One item priced across every country, cheapest first               |
| `/archive`             | Past puzzles, published two days in arrears                        |
| `/archive/[date]`      | One past puzzle with its answer                                    |
| `/blog`, `/blog/*`     | Long reads on what everyday prices measure (`data/articles.ts`)    |
| `/vs`, `/vs/[slug]`    | Head-to-head pages against the closest daily games                 |
| `/daily-games`         | The genre list page, for the query the whole category is found by  |
| `/methodology`         | Where every price comes from, and the ways it can be wrong         |
| `/editorial`           | Who writes this and to what standards                              |
| `/about`, `/contact`   | What the site is, and how to reach it                              |
| `/privacy`, `/terms`   | Policies, including the AdSense and EEA consent disclosures        |
| `/data`                | Every price source, its licence, and why there is no bulk download |
| `/support`             | How the site is funded, and reader support if configured           |
| `/sponsor`             | The sponsorship offer, and what is refused outright                |
| `/higher-or-lower`     | Side mode: two prices, pick the dearer. Unlimited                  |
| `/where-in-the-world`  | Side mode: the price is given, name the country                    |
| `/classroom`           | Room codes, and the page teachers land on                          |
| `/week`                | Somebody's shared week, decoded from the URL fragment. `noindex`   |
| `/api/crowd`           | The day's counters. Not prerendered                                |
| `/api/room`, `/api/room/[code]` | Create a classroom, and read its board. Not prerendered   |
| `/not-found`           | 404. Deliberately `noindex` and deliberately without a canonical   |

Generated at build time rather than written: `/sitemap.xml`, `/robots.txt`,
`/llms.txt`, `/feed.xml`, `/ads.txt`, `/manifest.webmanifest`, `/icon.svg`, and
`/og.jpg`
(from `scripts/generate-og.mjs`, committed rather than rendered per request).

`components/ContentPage.tsx` is the shell for everything that is not the game
(`SiteHeader` + title block + `SiteFooter`), so a reader arriving from search
lands on the same paper the game is set in.

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

## Scoring and the reveal

Bands are unchanged: win within 5%, yellow within 30%, warmth floors at 5x, all
on the log ratio so "twice too high" means the same thing on a $0.30 litre of
petrol and an $8 Big Mac.

**Points** sit alongside win/lose. `pointsFor` is `1000·e^(−|ln(guess/actual)|/0.18)`,
the same shape GeoGuessr scores distance on, and the shape is the point: the
curve is steep where players are good and flat where they are guessing, so
closing from 40% to 30% is worth almost nothing while closing from 10% to 5% is
worth a lot. A 5% pass/fail cannot rank the regulars against each other; this
can. `roundScore` then subtracts 40 per bid after the first, so solving in two
beats brute-forcing it on the last guess.

The reveal arrives as four cards rather than one page, and tapping through is the
point: a pause turns a number into a small event.

1. **The price, the score and the best bid.** On a loss this leads with the bid
   that went well ("your 2nd bid was 10% off") rather than with "out of guesses".
2. **What the price means.** Minutes of work, the in-your-money line, the rank,
   the baseline model, and whatever the crowd counters support.
3. **The verdict.** A persona read off the shape of the round, a roast pitched to
   the closest bid, and a generated line naming a country the opening bid would
   have been right about.
4. **The paperwork.** Source, streak, the Receipt, one sourced fact.

### Verdicts, roasts and the lookalike line

`personaFor` reads the pattern of the five bids: "The Oligarch" for someone
pricing a different economy entirely, "The Haggler" for five bids that all came
in under, "The Auctioneer" for a round that surrounded the price without ever
converging on it.

> **Distances in `lib/verdict.ts` are measured in log space, never in percent.**
> Percent error is asymmetric: bidding double is "100% off" but bidding half is
> only 50%, and bidding a tenth is still only 90%. A threshold written as
> `best >= 100%` can therefore only be met by overbidding, which meant The
> Backpacker sat below two rules that catch every overbidder first and could
> never fire at all. Half and double have to be the same distance. There is a
> test for it.

`lookalikeLine` is the "you just paid Hong Kong prices for Iranian petrol" joke,
and it is generated rather than written: it finds the country whose price for
today's item is nearest the player's opening bid. That is why it works for all
seventeen items instead of the two or three anyone would get round to writing
copy for, and why it stays true when the table is refreshed. It withholds itself
for any country inside the suppression window.

> **The one rule for every string in that file:** the joke is the bid or the
> price, never the player. Half the readers of this site are using it in a
> classroom.

### The Receipt

```
🧾 PRICELE #214
CAPPUCCINO · JAPAN 🇯🇵
──────────────
🟥⬇ 🟧⬆ 🟩
──────────────
BIDS 3/5 · BEST 4% · SCORE 870
"The Tourist" · 🔥12
║▏│▍│▎│▋│║
```

One line item per bid, a warmth block and a direction arrow, and a barcode that
really does encode the puzzle number. A grid of squares is Wordle's and every
game that copies it looks like a game that copied Wordle; this is a game about
what things cost, so the artefact is the thing you get when you buy something.

> **The Receipt must never contain a bid or the price.** That is the property
> that made Wordle's grid work and the easiest thing to lose while making a slip
> look convincing: `3  $3.10  🟩` gives the answer away to every reader. The line
> items carry a block and an arrow and nothing else, and the only figures on the
> card are about the player. A test asserts it.

### Beat the bot

`lib/bot.ts` multiplies two things the site already publishes: what an item
costs in a typical country, and how expensive this country is in general. Nearly
all the variance in the table is those two effects, which is exactly why beating
it is a real achievement rather than a formality: you have to know something the
model does not, like that fuel is subsidised here or that this country grows its
own apples.

It never sees the answer. The country's price level is computed with the target
item excluded, so the prediction is genuinely out of sample.

## Crowd statistics

`/api/crowd` keeps counters (`db/schema.sql`) on Neon, over the HTTP driver.
Every request here is a serverless invocation lasting a few hundred
milliseconds, and a connection pool in that shape is a liability; the HTTP driver
has no sockets and no pool, so the whole backend is one environment variable.

```bash
DATABASE_URL=postgres://...   # optional. Unset, every crowd figure is withheld.
psql "$DATABASE_URL" -f db/schema.sql
```

What it buys, all in `lib/crowd.ts` and all silent below a minimum sample: the
Ego Gap ("players overestimate a cappuccino in Japan by 36% on their opening
bid"), which way the crowd leaned, home-country bias, and where the reader placed.

> **Opening bids are summed in log space, not in dollars.** Prices here span four
> orders of magnitude, and the arithmetic mean of a set of dollar guesses is
> decided by whoever typed the largest number. The mean of their logs is the
> geometric mean, which is the right centre for a quantity people misjudge
> multiplicatively: someone who bids double and someone who bids half cancel out,
> which is what "unbiased" should mean. There is a test that one absurd bid in a
> hundred barely moves the figure.

Three rules this code does not bend. **The client is never trusted with the
answer**: a submission says what was bid, and the route looks up what the price
actually was from the same rotation the game is built on. **Nothing stored
describes a person**: no IP, no user agent, no bid history, no accounts. **A
withheld figure beats a shaky one**: every line returns null below `MIN_CROWD`
players rather than printing a percentage computed from four people.

## Classrooms

The feature that changes distribution rather than retention. A teacher is not one
player, they are thirty players and a reason to come back every term, and the
thing standing between a daily game and a classroom is almost never the game. It
is that joining requires an account.

So a room is a four-character code and a date. No sign-up, no email, no roster,
no password: the teacher reads the code out, and that is the access control. Room
codes use no vowels and no `I`, `O`, `0` or `1`, because they get read off a
projector at the back of a room.

The board is scored on The Price Is Right's One Bid rule, **closest without going
over**, run on everyone's opening bid. It is fifty years old, everybody's parents
know it, and a room where every bid went over has no winner at all, which happens
more often than you would expect and is the best teaching moment the mode
produces.

> **The board is not public, and `app/api/room/[code]/route.ts` is the only thing
> enforcing it.** A room's bids bracket the real price between the highest bid
> under it and the lowest bid over it, and with a class of thirty that bracket is
> the answer. An open board endpoint would be a way to read today's price out of
> the game without playing it, for anybody holding a code that is by design read
> out loud. So the board unlocks per person once they have bid; until then the
> response is a headcount and nothing else.

Display names are the only user-typed text on the site another person sees. They
are stripped of control characters and capped, and deliberately not run through a
profanity filter: a word list would fail at policing thirty teenagers across
every language this site is read in, while breaking real names. A room has a
teacher in it and lasts one lesson.

## Modes and side games

The daily stays at one puzzle. Wardle said the cap was the defining reason Wordle
spread, and his unlimited 2013 prototype bored people inside twenty minutes.
Everything that wants to keep playing gets sent elsewhere.

- **Higher or Lower** (`/higher-or-lower`). Two prices, pick the dearer, chain a
  run. Pairs cross items as well as countries, which is the trick that makes them
  hard: "a Big Mac in Norway or a cappuccino in Japan" cannot be answered by
  knowing which country is richer, because both are. Gated to a ratio between
  1.05x and 3x, which transfers directly from Seekdle here (unlike on the sister
  site, where the figures span 1.54x end to end and a ratio gate would admit
  everything or nothing). Drawn by rejection sampling rather than by enumerating:
  the full cross product of 641 rows is over 200,000 pairs.
- **Where in the World** (`/where-in-the-world`). The inverse mode: here is the
  item and the price, name the country, five guesses, a clue after each miss.
  This is the mode that decides what kind of game Pricele is. Guessing a number
  is a shopping game; being handed a price and working out where you are is a
  geography game, and geography is the genre that travels.
- **A clue before the last bid** (`lib/hints.ts`), about the policy behind the
  price rather than the figure: whether this country taxes it, subsidises it,
  imports it or makes it. That is the explanation a teacher wants on screen
  anyway.

> No number in a hint may be confusable with the figure the hint is about. The
> coverage clue is given as a proportion rather than a count for exactly this
> reason: it used to read "48 of the countries in the game", which sat next to an
> electricity answer of $48.31 and looked precisely like the answer.

## Retention

- **Rain checks** (`lib/storage.ts`). One earned per ten days of streak, two
  banked at most, spent automatically to cover a single missed day. The cap is
  the part that matters: a player sitting on ten passes does not have a streak,
  they have a number that cannot go down. Passes are earned *before* the miss,
  because a lapsed player is not on the site to claim anything.
- **Named milestones**, 3 through 365, each with a title. "Frequent Flyer" is a
  thing to be; 30 is an integer.
- **The calibration profile.** Mean opening error per item category: "you
  overestimate food by 22% and underestimate energy by 15%". Win rate stops
  separating regulars once they are all winning; this never does, and it is the
  only figure in the panel that improves on a day you lose. Averaged in log
  space, so someone twice too high half the time and half too low the rest reads
  as unbiased rather than 25% high.
- **The passport.** One page per country, one stamp per item bought there. 49 by
  17, and a pair only recurs every 833 days, so the collection has a real long
  tail that a streak cannot have.
- **Weekly wrapped**, on Sundays, with a share link that puts the week in a URL
  fragment. The fragment carries the player's *errors* and never a price or a
  bid, so a friend opening it learns how badly you did and learns no answers.

> **Never reset a stored streak.** Spotify wiped Heardle's streaks in a migration
> and traffic was down 85% eight months later. There are no accounts here, so a
> player's entire relationship with the game is a handful of `localStorage` keys.
> `migrateStats()` merges every read forward onto the current shape and is tested
> for exactly this. Adding a field is safe. Renaming one is not.

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
  `robots.txt`, an RSS `feed.xml` of the guides, PWA `manifest`, canonical URLs,
  Open Graph / Twitter cards.
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
pnpm test                       # unit tests: scoring, verdicts, crowd copy, board rules
pnpm build                      # production build
pnpm refresh-big-mac            # pull the latest Economist edition
pnpm refresh-big-mac --check    # CI guard: fail if Big Mac rows are stale
pnpm refresh-open-prices        # re-pull the ten openly-sourced items
pnpm refresh-open-prices --check   # CI guard: fail if any of them is stale
```

The crowd figures and the classroom need one variable in `.env.local`, and
everything else runs without it:

```bash
DATABASE_URL=postgres://...   # a Neon connection string
```

Prices are national averages published for general interest, not shopping advice.
