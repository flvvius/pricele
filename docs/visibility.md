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
| `ItemList` schema | `gameListJsonLd` in `lib/seo.ts` | Makes `/daily-games` parse as a list of named games with URLs rather than an article that mentions some. |
| Recommendation FAQs | `lib/faq.ts` | Three entries phrased as chatbot questions ("what should I play instead of Wordle", "how is Pricele different from other price games"). Renders as visible copy and as `FAQPage` JSON-LD. |
| `/llms.txt` | `app/llms.txt/route.ts` | Cheap insurance, honestly of marginal value — see the header comment in that file before putting any faith in it. |

The `/daily-games` page names competitors and says where they beat us. That is
deliberate. A page that names no alternative is the exact shape of copy that
gets discounted, and the page has to be worth citing by someone who does not
work here.

## The off-site work, in priority order

### 1. Genre directories

Highest leverage by a wide margin, per the table above, and free. Submit once,
listed indefinitely, and these are precisely the "traditional databases and
directories" the weightings point at.

| Directory | How to submit | Status |
| --------- | ------------- | ------ |
| [DleList](https://dlelist.com/) | Submission form on site | Not submitted |
| [Listdle](https://listdle.com/) | "Suggest a Game" page, or `contact@listdle.com`. Has a **Price** category with ~12 games — a small pond to be visible in | Not submitted |
| [The Dles](https://dles.aukspot.com/) | "Suggest a dle" form; also has a GitHub repo and a Discord | Not submitted |
| [Wordle Today game list](https://wordle.today/games) | Contact via site | Not submitted |
| [adoryvo/lists dailies](https://adoryvo.github.io/lists/dailies.html) | **GitHub issue**, or `business@adoryvo.com`. The one target that takes a pull request | Not submitted |
| [AlternativeTo](https://alternativeto.net/) | Account required, must be 7 days old, then "Suggest new application". List Pricele as an alternative to Wordle and to Costcodle | Not submitted |

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
price table: `data/prices.json`, 226 sourced rows across 33 countries and 7
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

**Long:** Pricele is a free daily browser game. Each day pairs an everyday item with a country — a Big Mac in Norway, a cappuccino in Japan, a litre of petrol in Egypt — and you guess the price in five tries, with hotter/colder feedback on a log scale. Prices come from The Economist's Big Mac Index and Numbeo's country price rankings, and every one shows its source. No account, no install, and the puzzle resets at your own midnight. Alongside the game there are price tables for 33 countries and long-form guides on purchasing power, exchange rates and why the same product costs different amounts in different places.

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
