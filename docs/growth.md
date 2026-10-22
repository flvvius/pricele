# Growth strategy (Pricele + Dickle)

This doc owns *getting players*. Discoverability (directories, schema, AI
recommendations) lives in `docs/visibility.md`; money is in
`docs/monetisation.md`. Written October 2026.

## What the genre teaches

- **Wordle** went from fewer than 100 daily players (1 Nov 2021) to 300k a few
  weeks later ([Nieman Lab, Jan 2022](https://www.niemanlab.org/2022/01/the-new-york-times-buys-wordle-for-a-price-in-the-low-seven-figures/)) and about 2M the following
  week, with no ads and no marketing. The turning point was the
  spoiler-free emoji grid: every result posted was an ad that did not leak the
  answer. One puzzle a day made it a shared event. Sources:
  [TechCrunch](https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/),
  [Wikipedia](https://en.wikipedia.org/wiki/Wordle).
- **The clone wave** (Worldle, Globle, Heardle, Framed, Costcodle, Spotle) grew
  on the same loop plus a niche identity: geography, film or music fans share
  inside their own communities, such as subreddits, Discords and fan Twitter. The
  communal effect fades as the genre crowds
  ([TheGamer](https://www.thegamer.com/wordle-clones-communal-phase-ended-framed-heardle-worldle-dordle/)),
  so a niche identity and a press hook now matter more than the grid alone.
- **Globle** (Jan 2022) is the best-documented niche case: a post to r/webdev
  got "absolutely zero traffic", a post to r/geography took off, and it
  averaged about 1.3-1.4M players a day in 2022 per its creator
  ([Hey, Good Game, Jan 2024](https://www.hey.gg/blog/trainwrecklabs); [Yahoo/CP](https://www.yahoo.com/entertainment/creating-online-geography-game-globle-164331615.html)). Lesson: the right
  subreddit matters more than the post.
- **Heardle** grew from "eight friends" to over 1M users a day per its
  creator ([Variety, 2022](https://variety.com/2022/music/news/heardle-music-wordle-game-1235212963/)), then was bought by Spotify and shut within a year.
- **Clues by Sam** (daily since May 2025) reportedly passed 50k DAU by early
  2026 through organic sharing, with its largest spike from Northernlion
  playing it on stream ([Wikipedia](https://en.wikipedia.org/wiki/Clues_By_Sam), approximate). Streamers are a channel.
- **Connections** (NYT, beta June 2023) reached 10M weekly actives by Nov
  2023 ([Aftermath](https://aftermath.site/new-york-times-wordle-connections-puzzmo-games/), citing Vanity Fair) and 3.3B plays in 2024
  ([Wikipedia](https://en.wikipedia.org/wiki/The_New_York_Times_Connections)), but it had NYT distribution, so it is not a template for us.
- **Costcodle** (Sept 2023, by KermWasTaken, MIT-licensed and widely forked,
  [GitHub](https://github.com/KermWasTaken/costcodle)) shows that price games travel. *Unverified:* no
  player numbers or press coverage were found; the r/Costco/TikTok story is
  our assumption. **Framed** (Mar 2022) and **Spotle** likewise have no
  public player figures from their creators; third-party "1M a day" claims
  come from unaffiliated clone sites and are not credible.
- **Aggregators are a steady source of traffic**: dles.gg, dailydles.com,
  listdle.com, dailys.gg, dlegames.org. These are tracked in `docs/visibility.md`.

What we take from this: Pricele already has the share artefact (The Receipt),
the cap of one puzzle a day, side modes and classrooms. What it lacks is
distribution. Most of the work is off-site.

## 1. Share loop

Already done: a spoiler-free Receipt, native share on mobile, a persona verdict,
a streak, and a Weekly Wrapped link.

Improvements, in priority order:
1. **Measure it.** Add `?s=r` (or the `utm_source=receipt` set) to the shared
   link and track landings in Vercel Analytics. The bare URL looks cleaner in a
   group chat, so use a short, neutral parameter. Today we cannot tell share
   traffic from other traffic.
2. **Per-day OG image** on the share URL ("Pricele #214 — Cappuccino in 🇯🇵 —
   can you beat 870?"). A link that unfurls in WhatsApp or iMessage gets more
   clicks than a plain one. Never show the price.
3. **Challenge link**: "I scored 870, beat me". The score goes in the URL
   fragment, and the landing page shows the score to beat. This works like
   Weekly Wrapped.
4. **Group/classroom leaderboard sharing**: rooms already exist, and a
   "family/office room" variant is the same feature with a different label.
5. **Cross-promo** (shipped, see below): after sharing, point players at Dickle.
   Dickle should point back at Pricele.

## 2. Content and social (TikTok / Shorts / Reels)

The format is a face-cam reaction while guessing, plus an on-screen price
reveal. Post daily at about 30s. Concepts:
- "Guess what a Big Mac costs in Switzerland": the creator guesses, then the
  reveal and the crowd's Ego Gap ("players overestimate by 36%").
- "Americans vs Europeans guess grocery prices" (street or Discord interviews).
- "The most expensive country for X": a weekly ranking from our data.
- "I made a game where…" founder dev-log. Indie stories perform well on TikTok.
- Dickle: the hook writes itself, but platforms restrict it, so keep it
  clinical and data-led ("what the studies actually say"). Reddit and X suit it
  better than TikTok.
Repurpose every clip to Shorts, Reels and X. Pin the link in the bio and use one
link-in-bio page that covers both games.

## 3. Reddit and communities

Subreddits: r/WebGames, r/IndieGaming, r/geography, r/MapPorn (for data
maps), r/dataisbeautiful (OC charts from our price table), r/teachers,
r/economics and r/personalfinance (only as data posts), r/wordle and
r/DailyGames-style communities. Rules: one post per sub, lead with something
useful (a chart or a finding) rather than "play my game", answer every comment,
and never post from a fresh account. Also post on Hacker News (Show HN: "a
daily game where every price cites its source"), Product Hunt, Discord daily-game
servers and the Lemmy equivalents.

## 4. Press angles (the strongest lever)

Cost-of-living data stories built from our sourced table and from the crowd
stats, which no one else has:
- "People overestimate prices abroad by X%": the crowd Ego Gap, a novel dataset.
- "Where your coffee or Big Mac costs most": timed to Economist Big Mac Index
  releases (January and July) and to CPI days.
- "Home-country bias: Brits underestimate UK prices"; national papers love a
  nationally framed finding.
- Teacher angle: "a free, no-signup economics game for classrooms". Pitch to
  edtech newsletters and to TES/Edutopia.
Targets: money and consumer desks (Guardian Money, BBC, Insider, Lifehacker),
puzzle columns (puzzle round-ups in the Guardian, the Verge and Polygon), and
local papers per country. Send a one-paragraph pitch, one chart and a quote. Go
for one story per month, not a blast.

## 5. Creators and newsletters

- Micro-creators (10k–200k) in personal finance, travel, geography and
  "guess the price" TikTok. Offer a custom room code and a "creator vs
  followers" day. Free, and no paid deals until we know the rate at which their
  audiences convert.
- Geography YouTubers (GeoGuessr scene) for Where in the World.
- Newsletters: games and puzzle newsletters, plus finance and indie-web ones
  (e.g. curated "cool sites" newsletters). Ask for a one-line mention.

## 6. SEO

The on-site work is largely done (see `docs/visibility.md`). Next steps: grow
`/prices/*` and `/items/*` as answers to "how much does X cost in Y" (a
long-tail query with real volume), refresh pages on index-release days, and earn
links through the press items above. Directory listings matter more than new
pages.

## 7. Retention

Already done: streaks with rain checks, milestones, passport, calibration and
Weekly Wrapped. Next:
- **Web push** (PWA exists): one opt-in daily reminder after a player's third
  game, never before. Default time 08:00 local.
- **Email**: an optional "daily puzzle + yesterday's answer + one price fact"
  newsletter (Buttondown/Beehiiv). It also works as a growth channel (forwards)
  and ties into monetisation via sponsorships.
- **Streak-safe**: never reset streaks (already a rule).

## 8. Metrics and targets

The north star is daily active players (DAP). All targets below are
*(est.)*, our own goals, not benchmarks. Supporting metrics: the share rate
(shares/completions), the share-landing rate, D1/D7/D30 retention and the share
of traffic from referral sources.

| | 30 days | 90 days | 180 days |
|---|---|---|---|
| Pricele DAP | 300 | 2,000 | 10,000 |
| Share rate | 15% | 20% | 25% |
| D7 retention | 15% | 20% | 25% |
| Directory listings | 10 | 20 | 30 |
| Press mentions | 1 | 4 | 10 |
| Email/push subscribers | 100 | 1,000 | 5,000 |
| Active classrooms/week | 5 | 30 | 150 |
| Dickle DAP (cross-promo) | 150 | 1,000 | 5,000 |

For calibration: the GameAnalytics 2025 benchmarks (11.6k mobile games,
all genres) put the median at about 22% D1, under 4% D7 and 0.7-0.8% D30
([GameAnalytics](https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks); [GameDev Reports summary](https://gamedevreports.substack.com/p/gameanalytics-mobile-gaming-benchmarks)), with top 1% at
64-68% D1. Those are paid-install mobile cohorts. A daily web game played by
choice from a shared link should retain better, but no public benchmark for
daily web games exists, so our 15-25% D7 is a goal to test, not a norm. No
public data was found on share rates either.

These targets are ambitious but plausible for a niche game. If DAP is under 100
at day 30, fix the share loop and the landing experience before spending more
on reach.

## 9. First 8 weeks

| Week | Focus | Actions |
|---|---|---|
| 1 | Instrument | Share-link parameter and analytics events (complete, share, landing). Check that the Dickle↔Pricele cross-links are live. Submit to the 5 aggregators above. |
| 2 | Communities | Show HN and r/WebGames (one each, staggered). Post a data chart to r/dataisbeautiful. Set up TikTok/Shorts accounts and post 5 clips. |
| 3 | Share loop | Per-day OG image and a challenge link. Daily clips continue. Look at which formats get views. |
| 4 | Press 1 | "Ego Gap" crowd-data story pitched to 10 money desks. Product Hunt launch. |
| 5 | Creators | 20 creator DMs with room codes. Geography YouTubers for Where in the World. |
| 6 | Retention | Web push opt-in after the third game. Email signup. |
| 7 | Education | Pitch to teacher communities (r/teachers, edtech newsletters) as the term-time push. Write a classroom one-pager. |
| 8 | Review | Compare against the 30-day targets. Double down on the top two channels and drop the bottom two. Plan press story 2 around the next data release. |

## Measurement

Custom events go through `lib/analytics.ts` (`trackEvent`, a no-throw wrapper
around Vercel Analytics `track()`: cookieless, no personal data, never a guess
or a price).

| Event | Fired when | Properties |
|---|---|---|
| `puzzle_complete` | A Pricele round ends (`components/Game.tsx`) | `won`, `guesses`, `archive`, `challenge` (arrived with `?c=`) |
| `share` | A share succeeds (`ShareCard`, `WeekCard`) | `channel` (`native`/`copy`), `campaign` (`daily`/`weekly`) |
| `share_landing` | Arrival with `utm_source=share`, `utm_source=dickle` or `?c=` (`components/LandingTracker.tsx` in the root layout). Once per session per URL; `/d/[n]` is skipped because it forwards to `/` | `source` (`share`/`dickle`/`challenge`), `medium`, `campaign`, `challenge`, `path` |
| `thenandnow_complete` | A Then & Now round ends | `won`, `guesses` |
| `thenandnow_share` | Then & Now result copied | `channel` |
| `rentratio_complete` | A Rent Ratio day ends | `score` |
| `rentratio_share` | Rent Ratio result copied | `channel` |

After `share_landing` fires, the `utm_*` tags are removed from the address bar
with `history.replaceState`. `?c=` stays so the challenge banner survives a
reload. The pageview still records the tagged URL, because it is sent on load.

Plan note: Vercel Web Analytics custom events need a Pro or Enterprise plan.
On Hobby, `track()` calls are dropped without error. Pageviews and utm
referrer breakdowns work on every plan.

## Shipped in repo with this doc

- `components/ShareCard.tsx`: after the Receipt, a "Try Dickle, our sister
  game" link tagged `utm_source=pricele&utm_medium=referral&utm_campaign=share_card`.
  It appears only once the round is done, so it never pulls a player out
  mid-game. Dickle should add the mirror link.

## Sources

Accessed October 2026.

- Nieman Lab, NYT buys Wordle, Jan 2022. https://www.niemanlab.org/2022/01/the-new-york-times-buys-wordle-for-a-price-in-the-low-seven-figures/
- TechCrunch, Josh Wardle interview, 12 Jan 2022. https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/
- Wikipedia, Wordle. https://en.wikipedia.org/wiki/Wordle
- TheGamer, Wordle clones' communal phase. https://www.thegamer.com/wordle-clones-communal-phase-ended-framed-heardle-worldle-dordle/
- Hey, Good Game, Globle & Trainwreck Labs, Jan 2024. https://www.hey.gg/blog/trainwrecklabs
- Yahoo / Canadian Press, Globle interview, 2022. https://www.yahoo.com/entertainment/creating-online-geography-game-globle-164331615.html
- Variety, Heardle, 2022. https://variety.com/2022/music/news/heardle-music-wordle-game-1235212963/
- Wikipedia, Clues By Sam (flagged for deletion). https://en.wikipedia.org/wiki/Clues_By_Sam
- Aftermath, NYT and Puzzmo games, 18 Apr 2024. https://aftermath.site/new-york-times-wordle-connections-puzzmo-games/
- Wikipedia, The New York Times Connections. https://en.wikipedia.org/wiki/The_New_York_Times_Connections
- GitHub, KermWasTaken/costcodle. https://github.com/KermWasTaken/costcodle
- GameAnalytics, 2026 Mobile & PC Gaming Benchmarks (2025 data). https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks
- GameDev Reports, GameAnalytics 2025 benchmarks summary. https://gamedevreports.substack.com/p/gameanalytics-mobile-gaming-benchmarks

**Still unverified:** Costcodle, Framed and Spotle growth numbers and
channels; any share-rate or D7 benchmark for daily web games; all 30/90/180
targets.

## Launching the hub games (October 2026)

Each new game has its own audience, so each one gets its own launch post. One
post about "a hub" would land in nobody's community. Globle's history is the
model here: the general programming subreddit sent nothing, and the topic
subreddit sent everything.

| Game | Where its players already are | The hook |
| --- | --- | --- |
| Price Atlas | r/geography, r/MapPorn, Worldle and Globle players | "Worldle, but the clue is what a Big Mac costs there" |
| Inflation Ladder | r/Economics, r/personalfinance, r/povertyfinance | "Eggs rose 362% since 1995, bananas 33%. Can you order them?" |
| Price Year | r/nostalgia, r/80s, TimeGuessr players | "TimeGuessr, but the photo is a grocery receipt" |
| Open Range | r/slatestarcodex, forecasting and calibration communities | "How sure are you about the price of eggs in Portugal?" |
| Then & Now | r/nostalgia, r/Frugal, r/90s | "What did a gallon of gas cost in 1998?" |
| Rent Ratio | r/RealEstate, city subreddits | "Is Buffalo dearer than Virginia Beach?" |
| Higher or Lower Daily | Players of higherlowergame.com | "The higher-lower game, once a day, with real prices" |

Rules for each post:

- Post the game page, never `/` or `/games`. The game page has its own social
  card and its own challenge banner.
- Post once per community, at least a week apart across communities, and read
  each one's self-promotion rules first.
- Check `share_landing` by `utm_campaign` in Vercel Analytics after 48 hours.
  The campaign is `game-<slug>`, so each game's spread is visible on its own.

Newsletters are next. `hub-research.md` records GeoSports going from 575 to over
4,000 players in a day from one feature in a sports newsletter. Geography,
economics and personal-finance newsletters are worth one short email each.
Pitch Price Atlas to the geography ones and Inflation Ladder to the money ones.

Run `pnpm indexnow` after each deploy that adds a page. It posts to Bing's
endpoint, which shares with the other IndexNow engines. On 2026-10-22 the
shared api.indexnow.org endpoint returned 403 for a key Bing accepted;
`INDEXNOW_ENDPOINT` overrides the target.
