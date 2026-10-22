# The business

Where Pricele goes if it is to become a company and not stay a side project:
a hub of daily games with a community worth sponsoring. Written in the same
spirit as `monetisation.md`, so the reasoning is on the page and can be argued
with. Figures marked *(est.)* are planning assumptions, not measurements.
Replace them with real numbers once there is a month of traffic.

## 1. Vision

**"Daily games about the real world."** Five minutes a day, each game built on
a sourced number: a price, a distance, a population, a date. Wordle-likes are
everywhere. A daily game whose answers are *true and cited* is rare, and the
claim is easy to defend. `monetisation.md` already treats trustworthy data as
the site's one asset. The hub stretches that asset across several games.

What success looks like in 24 months: 100k daily players across the hub, a
Discord where people argue about the answers, two or three recurring sponsors
who pay for whole data sets rather than banners, and one person's salary
covered.

## 2. Comparables (what is actually known)

| Comparable | Model | Lesson for us |
| --- | --- | --- |
| **NYT Games** | Bought Wordle in Jan 2022 for "low seven figures". Games are now a main way people come in to the NYT bundle (12M+ total subs late 2025). Standalone Games sub is about $50/yr. | A *portfolio* of dailies plus streaks drives subscriptions. A single viral game was worth roughly $1-3M to an acquirer. |
| **Puzzmo** (Zach Gage / Orta Therox, Hearst-backed) | Free daily games plus Puzzmo Plus at about $39/yr (annual only). Publisher partnerships (Polygon etc.) on rev-share. | Distribution through publishers' embeds. The partner said the revenue was small and the value was in community. Embeds are a growth tool, not a revenue line. |
| **Sporcle** | Ad-funded quiz hub, user-generated quizzes, Sporcle Orange ad-free subscription, live pub-quiz events. | UGC plus SEO compounds over years. Offline and live events are a real revenue line. |
| **Arkadium** | B2B: licenses casual games to publishers (embed plus ad share) and runs its own ad-funded site. | A second buyer for each game exists: publishers licensing it. |
| **Conundrum / Wordle-alike hubs** (e.g. dle-lists, "-dle" clusters such as Worldle, Globle, Costcodle) | Mostly solo devs, ad-funded. Worldle and others were acquired or folded into hubs (Worldle went to Teuteuf's game network). | Geo/data dailies get bought. Cross-linking a cluster of games is the dominant growth pattern. |
| **Clues by Sam** | Solo-dev daily logic puzzle, about 50k DAU within a year of launch (2025-26). | One good mechanic can reach tens of thousands of DAU with no marketing budget. |
| **Josh Wardle / Wordle** | No ads, no monetisation, sold. | A clean, ad-light product is what makes a game *acquirable*. |

Sources: Press Gazette, "Puzzled: how games help power the NYT subscription
model"; Ivey HBA blog on NYT games (2025); Aftermath on NYT and Puzzmo; Adrian
Hon on Puzzmo; Wikipedia "Clues By Sam". The Wordle price is as widely reported
at the time (NYT, Jan 2022).

## 3. Hub architecture

### Option A: one domain, `/games/<name>` (recommended)

Make **pricele** the hub brand at first, with the new games at
`pricele.<tld>/games/<slug>`. Rename later only if a neutral umbrella brand
earns it.

- **Pro:** all backlinks and directory listings (the bottleneck named in
  `visibility.md`) pile up on one domain, and every new game inherits its
  authority from day one.
- **Pro:** one AdSense property, one sitemap, one account system, one
  `localStorage` origin, so a cross-game streak and a single "today's games"
  page are trivial.
- **Pro:** one cookie/consent banner, one privacy policy, one entity.
- **Con:** a game that goes viral gets no vanity domain. Mitigate by buying
  the `.com` for any breakout and 301-redirecting it to the hub path.
- **Con:** selling one game alone later is harder. Mitigate by keeping each
  game's code in its own package so a game could move to its own domain if a
  buyer wanted it.

### Option B: network of domains (one per game, cross-linked)

The Worldle/Teuteuf pattern. Better for selling games one by one and for
exact-match domain names, but every domain starts at zero authority, and the
listing work in `visibility.md` would have to be done once per game. With one
person doing that work, this option loses.

### What to do with Pricele and Dickle

- **Pricele stays where it is** and becomes the hub. No migration, no lost
  equity.
- **Dickle stays on its own domain, deliberately outside the hub.**
  `monetisation.md` records a content-policy issue on the sister site. Putting
  it inside the hub would put the shared AdSense account and the
  sponsor-safety of the whole brand at risk. Link to it in the footer as
  "from the same maker" at most, and only once the hub's ad standing is
  secure. Treat it as a separate asset that could be sold on its own.

## 4. The next games (data/price/geo, cheap to build)

Each one reuses the existing stack: static JSON, `lib/puzzle.ts` rotation,
`localStorage`, share card, and the source-citation pattern.

1. **Higher/Lower: World Edition.** Already exists as a side mode
   (`lib/higherlower.ts`). Promote it to a first-class daily at
   `/games/higher-lower`. *Cost: days.*
2. **Wage Clock:** "how many minutes does a teacher in Kenya work to buy this
   item?" Reuses the price table plus ILO/OECD wage data. It is the most
   shareable version of the existing data, and the strongest sponsor fit
   (fintech, remittance). *Cost: 1-2 weeks.*
3. **Where in the World** (exists in `lib/whereintheworld.ts`): guess the
   country from a basket of prices. Promote to a daily. *Cost: days.*
4. **Then & Now:** guess what an item cost in a given year (CPI/historical
   prices, public-domain US BLS data). It opens up the large audience of
   nostalgia sharing. *Cost: 2 weeks, mostly data.*
5. **Distance / Population daily:** guess a number about a place
   (population, area, distance between two capitals) with the same log-scale
   hot/cold feedback. Uses open data (World Bank, Natural Earth; check
   licences as `/data` does). *Cost: 1 week.*

Rule for picking more: a single number, a citable source, a licence that
allows commercial use, and a result you can share in one line.

## 5. Community plan

- **A single "Today" page** listing every game, with a cross-game streak and
  one combined share card. This is the main retention mechanic.
- **Discord** at about 1-2k DAU, not before (an empty server hurts). Channels:
  `#daily-<game>` spoiler threads that open after midnight UTC, `#sources` for
  disputes, `#suggest-an-item`. Run it with a bot that posts the day's games
  and leaderboards. Recruit 2-3 volunteer moderators from the first regulars.
- **Player-submitted data.** Readers suggest items/prices with a source, and
  accepted ones are credited by name. This is Sporcle's UGC lesson applied
  to data, and it builds the community and the content together.
- **Classrooms** (already built, `lib/room.ts`): pitch to geography and
  economics teachers. Teachers are a durable, word-of-mouth channel and a
  sponsor-safe audience.
- **Weekly email** (Sunday recap: the week's answers, the hardest item, a
  reader's fact). Owned channel and something to sell to sponsors.
- **Reddit/dle directories**, as in `visibility.md`.

## 6. Monetisation stack and revenue math

Layers, in order of priority:

1. **Display ads** (AdSense now, then a managed network such as
   Ezoic/Playwire/Raptive once traffic qualifies, usually ~50-100k
   sessions/month or more). Placed outside play, as `lib/ads.ts` already does.
2. **Sponsorship** of data sets, weeks, or a game ("Wage Clock, data funded
   by X"), per `monetisation.md` §3.
3. **Supporter tier ("Pricele Plus")**: ad-free, the archive of past
   puzzles, stats, extra rounds. $3/month or $24/yr, through Stripe or Ko-fi
   memberships. Past puzzles cost nothing to provide and are the most-asked
   feature of every daily game.
4. **Affiliate** (travel money, eSIM) on reference pages only, never in the
   game.
5. **Licensing/embeds** to publishers (Arkadium/Puzzmo pattern) from about
   100k DAU.

### Assumptions *(est.)*

- 1.6 pageviews per daily player per day across the hub (most play and leave).
- Blended display RPM: $2 (AdSense, mixed geo, light placement) rising to $6
  with a premium network and a US/UK-heavy audience. Casual-game RPMs vary a
  lot; check against your own dashboard after 30 days.
- Supporter conversion: 0.3-0.5% of DAU at about $2.50/month net.
- Sponsorship: what the market typically pays for niche newsletters and sites
  (CPM $20-40 equivalent, flat fees).

| | 10k DAU | 100k DAU | 1M DAU |
| --- | --- | --- | --- |
| Monthly pageviews | ~480k | ~4.8M | ~48M |
| Ads (RPM $2 / $4 / $6) | ~$950/mo | ~$19k/mo | ~$290k/mo |
| Supporters (0.4%) | 40 × $2.5 = $100 | 400 → $1k | 4k → $10k |
| Sponsorship | $0-500 (one-offs) | $3-10k | $30-80k |
| Affiliate | ~$50 | ~$500 | ~$5k |
| **Total / month** | **~$1-1.6k** | **~$24-30k** | **~$335-385k** |
| **Annualised** | **~$15k** | **~$300k** | **~$4M** |

Read this honestly: at 10k DAU it is a hobby that pays its hosting and data
costs. At 100k it is a real one-to-three-person business. At 1M, NYT/Hearst
style acquirers start calling. The jump between tiers is driven by ad-network
tier and sponsorship, not by subscriptions.

**Exit value:** content and game sites change hands on Acquire.com or Flippa
at roughly 2.5-4.5× annual profit (as with sites generally, it depends on age,
how varied the traffic is, and owner hours). At 100k DAU that is about
$0.6-1.2M. Strategic buyers (publishers that want a games section) have paid
more, as Wordle shows.

## 7. Sponsor pitch and media kit

**The pitch, one paragraph:** "Every day, N thousand people spend five minutes
guessing what the world costs. Fund the data behind a game, like the cost of
living in 50 countries, refreshed quarterly, and your name sits beside the
source it paid for, seen by every player who opens it. You buy the dataset,
not a banner, and you can't buy the answers."

Natural sponsor categories: remittance/FX (Wise, Remitly), travel cards and
eSIMs, personal finance apps, data/stat providers, ed-tech, newspapers
wanting a games section.

**Media kit outline** (a page at `/sponsor/kit` plus a PDF):

1. One-line description and screenshot of each game.
2. Audience: DAU, monthly uniques, top countries, device split, share rate,
   streak length distribution (screenshots from the analytics source, as
   `monetisation.md` requires).
3. Formats and prices: dataset sponsorship (quarter), "presented by" week
   across the hub, newsletter slot, custom branded puzzle (one-day, clearly
   labelled, answer still sourced independently), classroom sponsorship.
4. What is not for sale: answers, ordering, placement in tables.
5. Case study once one exists. Contact.

Starting rate card *(est., at 10-20k DAU)*: newsletter slot $150-300, week
"presented by" $500-1,500, dataset quarter $2-5k.

## 8. Legal and entity notes

Not legal advice. Check with an accountant in the owner's jurisdiction.

- **Entity:** form a limited company (e.g. Romanian SRL/micro-enterprise or a
  UK Ltd/US LLC through Stripe Atlas) before the first sponsor invoice. Keep
  Dickle in the same company only if the content-policy risk is acceptable
  to sponsors. Otherwise use a separate entity or keep it personal.
- **Trademarks:** file "Pricele" (EUIPO or the relevant national office,
  classes 9/41) once it passes 10k DAU. Avoid "-dle" names that run into
  NYT's Wordle mark.
- **Data licences:** the NC/ND sources flagged in `monetisation.md` are the
  biggest legal risk to a *commercial* hub. Before any sponsorship or sale,
  replace them with sources that allow commercial use or get written
  permission. Buyers will check.
- **Privacy:** GDPR/ePrivacy consent banner (Google certified CMP needed for
  AdSense in EEA/UK), privacy policy, DPA with database host. Accounts or email
  bring GDPR data-subject duties. Classrooms add children's data rules
  (COPPA/UK AADC), so keep rooms anonymous.
- **Sponsorship disclosure:** label every paid item ("sponsored", "funded
  by"), following FTC/ASA rules.
- **VAT/OSS** on supporter subscriptions sold to EU consumers. Using a
  merchant of record (Paddle, Lemon Squeezy, Ko-fi) avoids having to file it
  yourself.

## 9. 12-month roadmap

| Month | Milestone | Done when |
| --- | --- | --- |
| 1 | Hub skeleton: `/games`, "Today" page, cross-game streak; Higher/Lower and Where-in-the-World promoted to dailies | 3 games live on one domain |
| 2 | Directory push from `visibility.md` for all 3; weekly email started | Listed on top dle directories |
| 3 | **Wage Clock** launched; replace NC/ND data sources | 4 games; data cleared for commercial use |
| 4 | Supporter tier (archive + ad-free) via merchant of record | First paying supporters |
| 5 | Discord opens (if ≥1k DAU); player-submitted items | 100 members |
| 6 | Media kit + first sponsor sold; entity formed | **Milestone: 10k DAU, first $1k month** |
| 7 | **Then & Now** launched | 5 games |
| 8 | Classroom outreach to teachers; embed widget for publishers/blogs | 50 classrooms; 5 embeds |
| 9 | Move to a managed ad network if eligible | RPM doubles |
| 10 | **Distance/Population** daily; one-off branded puzzle with a sponsor | 6 games |
| 11 | First publisher licensing conversation | One LOI or pilot |
| 12 | Review: Acquire.com valuation snapshot, decide to keep building or sell | **Milestone: 30-50k DAU, $5-10k/month** |

Kill criteria, set now so they are not argued later: if a new game does not
hold 10% of the hub's DAU after 60 days, fold it back into a side mode and
build the next one.
