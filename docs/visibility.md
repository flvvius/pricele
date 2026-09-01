# Being findable

Notes on getting Pricele recommended by search engines and AI assistants, and a
running record of what has actually been submitted where.

This is a checklist with reasoning attached, not a marketing plan. Update the
tables as you go — the value of this file is knowing what has already been done
so nobody submits twice or forgets a directory that rejected us for a fixable
reason.

## The finding that should drive everything

The on-site work is essentially finished, and it is not the bottleneck.

Pricele already has: server-rendered content on every route, canonical URLs that
resolve to 200, `Organization` / `Person` / `WebSite` / `Game` / `Dataset` /
`FAQPage` / `BlogPosting` schema with stable `@id`s, a generated sitemap and
`robots.txt`, twenty sourced long-form guides, a named author, an editorial
policy and a corrections policy. That is more technical SEO than most sites in
this genre will ever have.

It has produced no visibility, because none of it is what decides
recommendations. Published analyses of how the major assistants pick what to
recommend put the weight overwhelmingly on **third-party mentions**:

| Assistant | Dominant factor | Weight |
| --------- | --------------- | ------ |
| ChatGPT | Authoritative list mentions | ~41% |
| Gemini | Authoritative list mentions | ~49% |
| Perplexity | Authoritative list mentions | ~64% |
| Claude | Traditional databases & directories | ~68% |

Every one of those is a page on **someone else's** domain. A site can be
perfectly marked up and still be invisible, because the question "what daily
games are good" is answered from listicles and directories, and a game absent
from all of them does not exist as far as that question is concerned.

The corollary is uncomfortable but clarifying: **almost all remaining work is
off-site, manual, and cannot be done by editing this repository.** Writing
another guide has close to zero marginal effect on being recommended. Getting
listed on DleList has a large one.

### Baseline, for comparison later

Searched August 2026, before any submissions: the query "Pricele daily price
guessing game" returned Spendle, PricedIn, PriceGame, Price Games, Costcodle and
guesstheprice.net. It did not return Pricele. Zero of the ten results were this
site. Assistants asked the same question named the same competitors.

That is the number to beat, and it is a low bar: the competitors above are on
the directories, and that is the entire difference between them and us.

## What this repo now does about it

| Asset | Where | Why |
| ----- | ----- | --- |
| `/daily-games` | `app/daily-games/page.tsx`, `data/similar-games.ts` | The list page for the query the whole genre is discovered through. Ours won't outrank a third-party listicle, but it captures the query, states our own comparison in words we chose, and gives directories something substantive to link to. |
| `/vs/<game>` | `app/vs/[slug]/page.tsx`, `data/comparisons.ts` | One head-to-head page per competitor. `/daily-games` answers "what else is there"; these answer "which of these two should I play", which is a different query and the one people put to an assistant rather than to a search box. Comparison pages are also the most quotable page shape there is — a stated question, a matched table, a verdict — which is why they get cited out of proportion to their traffic. |
| `ItemList` schema | `gameListJsonLd` in `lib/seo.ts` | Makes `/daily-games` parse as a list of named games with URLs rather than an article that mentions some. |
| Recommendation FAQs | `lib/faq.ts` | Three entries phrased as chatbot questions ("what should I play instead of Wordle", "how is Pricele different from other price games"). Renders as visible copy and as `FAQPage` JSON-LD. |
| `/llms.txt` | `app/llms.txt/route.ts` | Cheap insurance, honestly of marginal value — see the header comment in that file before putting any faith in it. |

### Why the comparison pages concede rows

`data/comparisons.ts` enforces four editorial rules in its type signature and in
`lib/comparisons.test.ts`: every fact about a competitor is checked by playing
their game, a dimension nobody verified is marked unverified rather than
guessed at, `edge` is adjudicated per row and may say "them", and
`theirStrengths` is a non-empty tuple so no page can ship without conceding
something real.

The tally under each table is computed from the rows rather than written down,
so it cannot drift from the table above it, and it is allowed to come out
against us. That is not modesty, it is the mechanism. A comparison page that
wins every row is read as an advert by people and discounted as one by anything
summarising it, which makes it worth less than no page at all. The pages that
get cited are the ones that name the competitor's advantages in the
competitor's favour, and then say what makes ours different anyway.

The `/daily-games` page names competitors and says where they beat us. That is
deliberate. A page that names no alternative is the exact shape of copy that
gets discounted, and the page has to be worth citing by someone who does not
work here.

### The August 2026 pass: what was actually missing

The claim above that the on-site work was "essentially finished" was true of
*search* SEO and not quite true of answer-engine visibility, which turns on a
partly different set of things. Published 2026 analyses of what separates pages
answer engines cite from pages they don't put the weight on three structural
properties, and this site was short on all three despite being well marked up:

| Finding | State before | Now |
| ------- | ------------ | --- |
| Pages carrying 3-4 complementary schema types are cited about twice as often as single-schema pages, and `Article` + `FAQPage` + `BreadcrumbList` is the combination that recurs. | Reference pages carried a lone `Dataset`. No page on the site had a breadcrumb. | Price and item pages carry `WebPage` + `BreadcrumbList` + `Dataset` + `FAQPage`. Breadcrumbs sitewide. |
| `FAQPage` has by far the highest citation rate of any schema type, roughly 41% of marked-up pages against 15% without. | On the home page only. | Per-country and per-item FAQs, generated from the rows, asking the question in the words it is actually asked in. |
| Around 55% of AI Overview citations come from the first 30% of the cited page; a 40-60 word direct answer at the top is the single most-cited structure. | Item pages opened with `item.blurb`, the best writing on the page, which buried the two figures anyone arriving from "which country has the cheapest X" came for. | The standfirst leads with the range and the endpoints. `data-answer` marks it, `speakable` points at it, and the blurb follows immediately. |

The FAQ entries are the substantial part. This site publishes the answer to
"how much does a Big Mac cost in Norway" in a table cell, and never once asked
the question — the match had to be inferred from a column header. Each answer
now repeats the country and the item rather than leaning on the surrounding
page, because an extracted answer arrives without one.

Two smaller things closed in the same pass:

- **Publisher identity on the archive pages.** `lib/seo.ts` explains why every
  schema on the site references the publisher and author by `@id`; the archive
  day pages each minted a fresh `Organization` stub with nothing but a name, so
  that signal stopped dead at several hundred URLs.
- **`robots.ts` names the AI crawlers explicitly.** The wildcard already allowed
  them. `Google-Extended` is not a crawler though — it is the opt-out token
  governing whether Google may use already-fetched content for Gemini and for
  grounding AI answers, and a site whose whole problem is not being cited by
  assistants should not leave that to a default nobody has looked at.

One thing deliberately *not* done: `dateModified` is derived from the
`sourceDate` of the rows a page actually shows, never from the build. Wiring it
to the deploy would let a CSS change assert that the prices were re-checked that
morning, which is exactly the aggregator behaviour `/methodology` criticises.
Source dates are month- or year-precision, so they are widened to the first day
of the period — which understates freshness by up to a year and never overstates
it.

None of this changes the conclusion above. It is on-site work, and on-site work
is not what decides recommendations. It is worth having done because it is the
part that *can* be done from this repository. Expect the effect to show up over
four to twelve weeks if at all, fastest on Perplexity, which retrieves at query
time, and slowest on ChatGPT, which does not.

### The September 2026 pass: the heading nobody had read

The August pass called the on-site work finished. It was not, and what it
missed was the largest single on-page signal there is.

**The home page `h1` was the word "Pricele".** Nothing else. Every other page
on the site gets a descriptive `h1` through `components/ContentPage.tsx`; the
one page that has to rank for the genre — the page that *is* the game — spent
its entire heading budget on the brand name. That is a precise, mechanical
explanation for the symptom this whole document was written about: the site
ranks first for "pricele" and nowhere for "guess the price game", because the
home page had never once said the second thing in a heading.

The masthead is still a masthead. This screen is sized to fit exactly one
viewport and a visible subtitle would push the guess input off a short phone, so
the heading continues past the brand word in text that is read by screen readers
and by anything parsing the document, and is not painted. It says what the
prose below the fold and the meta description already say. If it is ever edited,
keep it a description — the moment it becomes a list of keywords it is the kind
of hidden text that is worth a penalty rather than a ranking.

Closed in the same pass, all of them small and none of them a substitute for the
section below:

| Gap | Why it mattered | Now |
| --- | --------------- | --- |
| No `HowTo` anywhere. | "How do you play X" is asked of assistants far more than of a search box. The answer was on the site twice — the How to play dialog and an FAQ entry — and neither was typed as a procedure, so the steps had to be inferred from prose. | `howToPlayJsonLd()` in `lib/seo.ts`, on the home page. A test asserts it still states the five guesses and the 5% band, so it cannot drift from `lib/scoring.ts`. |
| `Organization.logo` was a bare SVG URL. | Logo guidance is written around rasters, and a bare string leaves the format and the dimensions to be discovered by fetching the file. | An `ImageObject` pointing at the 180×180 PNG that already existed for the touch icon, dimensions stated. |
| The publisher had no `sameAs`, no `alternateName`, no stated location. | The `Person` node was doing all the entity-resolution work alone. An organisation with no external reference is hard to resolve to a real operator. | All three, built from `lib/author.ts`. Only links that actually resolve go in `sameAs` — an unverifiable one is worse than none, and a test enforces it. |
| The game was typed `VideoGame` only. | `SoftwareApplication` is the type a consumer reaches for on "is there a free browser app that does X", which is the shape of the recommendation queries this site wants to be an answer to. | Multi-typed `["VideoGame", "SoftwareApplication"]`, which is valid schema.org and true of the same object. Still no `aggregateRating`, because there is no rating to report and inventing one is exactly the unearned signal the rest of `lib/seo.ts` refuses to emit. |
| No feed. | A feed is the one machine-readable way a site says it publishes on an ongoing basis rather than having been written once and abandoned. Several of the directories in the table below ask for a feed URL on the submission form. | `/feed.xml`, RSS 2.0, published guides only, regenerated hourly like the sitemap. Linked from every page — it has to be re-declared in `pageMetadata()` because Next.js replaces `alternates` rather than merging it, which would otherwise have stripped it from every page on the site. |
| `robots.ts` named the assistants but not all of their fetchers. | `Applebot` (Siri and Spotlight), `meta-externalfetcher` and `Google-CloudVertexBot` are retrieval agents that were missing, and the link-preview bots were unnamed entirely. | Both lists extended, preview fetchers named separately with a comment saying why they are not crawlers. |

A thing considered and **not** done: per-item-per-country pages, one for each of
the 641 sourced rows. It looks like 641 long-tail pages answering "how much does
a Big Mac cost in Norway" and it is really 641 pages that each restate one cell
of a table. The country pages already carry a generated FAQ asking exactly that
question in exactly those words, so the combination pages would compete with the
pages that already answer the query, and thin programmatic pages are a known way
to lose the pages you already have. Not worth it.

## The off-site work, in priority order

### 1. Genre directories

Highest leverage by a wide margin, per the table above, and free. Submit once,
listed indefinitely, and these are precisely the "traditional databases and
directories" the weightings point at.

| Directory | How to submit | Status |
| --------- | ------------- | ------ |
| [DleList](https://dlelist.com/) | Submission form on site | Submitted 19 Aug 2026 — awaiting approval |
| [Listdle](https://listdle.com/) | "Suggest a Game" page, or `contact@listdle.com`. Has a **Price** category with ~12 games — a small pond to be visible in | Submitted 19 Aug 2026 — awaiting approval |
| [The Dles](https://dles.aukspot.com/) | "Suggest a dle" form; also has a GitHub repo and a Discord | Submitted 19 Aug 2026 — awaiting approval |
| [Wordle Today game list](https://wordle.today/games) | Contact via site | Submitted 19 Aug 2026 — awaiting approval |
| [adoryvo/lists dailies](https://adoryvo.github.io/lists/dailies.html) | **GitHub issue**, or `business@adoryvo.com`. The one target that takes a pull request | Submitted 19 Aug 2026 — awaiting approval |
| [AlternativeTo](https://alternativeto.net/) | Account required, must be 7 days old, then "Suggest new application". List Pricele as an alternative to Wordle and to Costcodle | Submitted 19 Aug 2026 — awaiting approval |

**All six went out on 19 August 2026 and are pending.** These are moderated
queues rather than automated ones, so approval takes anywhere from a few days to
a few weeks, and some will simply never reply — that is the normal shape of
this, not a sign the submission failed. Update a row to "Listed &lt;date&gt;" as
each one appears, and treat a row still pending after a month as declined rather
than chasing it. Nothing else in this document depends on the outcome: the
listings are a bet placed, and the next section is where the remaining effort
should go regardless of how many land.

Copy to submit with is in [Submission copy](#submission-copy) below. Use it
verbatim so the description of the game is identical everywhere; consistency
across sources is itself a signal, and it means a model summarising several
directories sees one coherent entity rather than three different games.

### 2. Listicles

The "N games like Wordle" articles are where the ChatGPT 41% actually lives.
These are editorial, so this is outreach rather than submission: a short, plain
email to the author of a piece that is already ranking, saying what the game is
and why it is a fit for their list. Most will not reply. Enough do.

Live targets as of August 2026 — check each is still updated before writing:

- PC Gamer, "The best games like Wordle to play daily"
- Thinky Games, "Tired of Wordle and Connections?"
- Crosswordle blog, "25 Best Wordle Alternatives"
- Summer Engine, "15 Daily Games Like Wordle"
- Drawdle, "11 Best Wordle Alternatives"
- thathappening.com, "Free Games Like Wordle"

Several of those are other indie daily games running a blog for exactly this
reason. They are the likeliest to say yes, and reciprocating with a slot on
`/daily-games` is a fair trade — the page has room and the list should grow.

### 3. Reddit and communities

The Cal playbook counted 200+ Reddit mentions. Reddit is heavily weighted in AI
training and retrieval and is the one place where a single good post can produce
dozens of citable mentions.

It is also the fastest way to get a domain blacklisted. Rules, in order of
importance:

1. Read each subreddit's self-promotion rule first, and follow it exactly.
2. Post as a person who made a thing, never as a brand.
3. Answer "what daily games do you play" threads honestly, including
   recommending other games. That is the behaviour that survives moderation.

Reasonable places to start: r/WordleGames, r/dailygames, r/webgames,
r/InternetIsBeautiful, r/geography, r/Economics-adjacent subs for the price
angle, r/teachers for the classroom use case.

### 4. The dataset as a citable object

Cal's 45,000-star repository was not a marketing asset, it was a **thing worth
citing** that happened to carry the brand. The equivalent asset here is the
price table: `data/prices.json`, 641 sourced rows across 49 countries and 17
items, with provenance on every one.

Published as a standalone open-data repository — CSV plus JSON, sources named,
licensing constraints stated honestly (the underlying Economist and Numbeo terms
travel with the numbers, and a compilation cannot relicense its sources) — it
becomes something a person can cite, fork and link. That is a different and more
durable kind of visibility than a directory listing, and it is the one item on
this list with real upside beyond the genre.

Not started. It is a bigger piece of work than everything above combined, and
everything above should be done first.

## Submission copy

Reuse verbatim. Consistency is the point.

**Name:** Pricele

**URL:** https://www.pricele.online

**One line (≤80 chars):** Guess what everyday things cost around the world. New country daily.

**Short (≤200 chars):** A free daily game: guess the price of one everyday item in one country, in five tries, with hotter/colder feedback. Every figure is a published statistic with its source shown.

**Long:** Pricele is a free daily browser game. Each day pairs an everyday item with a country — a Big Mac in Norway, a cappuccino in Japan, a litre of petrol in Egypt — and you guess the price in five tries, with hotter/colder feedback on a log scale. Prices come from The Economist's Big Mac Index, Numbeo's country price rankings, GlobalPetrolPrices, the WHO's tobacco and alcohol tax surveys and the World Bank, and every one shows its source. No account, no install, and the puzzle resets at your own midnight. Alongside the game there are price tables for 49 countries and long-form guides on purchasing power, exchange rates and why the same product costs different amounts in different places.

**Categories:** Price · Geography · Trivia · Educational

**Tags:** daily game, price guessing, geography, economics, cost of living, wordle-like, educational

## Measuring whether any of it worked

Track the outcome, not the activity. Monthly, ask several assistants the
questions a player would actually ask, and log which games get named:

- "what are the best daily games like Wordle"
- "is there a daily game about prices or the cost of living"
- "what should I play after Wordle and Connections"
- "daily games to use in an economics class"

Being named at all is the first milestone. Being named in the first three is the
goal. Vercel Analytics referrers will show the directory traffic separately, and
Search Console will show whether the brand query "pricele" starts returning this
site rather than the competitors it currently returns.

Expect months, not weeks. Directory listings are near-instant; the assistants
only re-weight once the listings have been crawled and folded into an index.
