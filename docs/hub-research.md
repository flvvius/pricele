# Hub research: structure, adjacent games, growth, AEO

Researched 22 Oct 2026. This doc adds to `game-ideas.md`, `business.md`,
`growth.md` and `visibility.md` and tries not to repeat them. References look
like [S12] and resolve in Sources at the end. "Unverified" means I could not
confirm it from a page I read. Traffic figures are Semrush estimates for
September 2026 unless said otherwise. They model web visits, not players, and
they are the only public numbers there are for most of these sites.

## Short answers

- Keep the Pricele game at "/". Put the hub at `/today` for personal progress
  and add a plain `/games` index for browsing and for directories to link to.
  The small and mid-size sites I could check either lead with the game or, like
  TimeGuessr, put one click between "/" and it.
  I found no public before-and-after case of a game site moving its game off "/",
  so the switch rule below is my judgment, not a measured threshold.
- Brand-name search and direct visits carry these games. Between 43% and 75% of
  visits to the daily games I checked are direct. AI assistants send almost
  nothing.
- Five cheap mechanics, in order: a five-round scored basket, a "what year was
  this price" slider, a basket-total guess, a daily Higher/Lower streak, and a
  birth-year price card.
- Do not count on FAQ rich results, `llms.txt` or special schema for AI
  recommendations. Google says none of them is needed. Third-party mentions
  matter more.

## 1. Hub landing page or game first

### What each site does

I fetched each homepage on 22 Oct 2026 unless noted.

| Site | What "/" is | Where the other games live |
| --- | --- | --- |
| Costcodle | The game. No nav, no hub [S5] | None |
| Worldle (Teuteuf) | The game, on its own subdomain. An icon labelled "Explore other games" links to `/teuteuf-games` [S2] | `teuteuf.fr` is a separate company page listing 19 games, with a newsletter form and press cards [S3] |
| Globle (Trainwreck Labs) | Could not fetch. The creator says most games have their own domain and a hub exists at `trainwrecklabs.com/all-games` [S4] | Spin-offs on subdomains, such as `flora.metazooa.com` [S4] |
| Waffle | A menu of modes plus the studio's other games. I could not tell whether the board also renders on load [S6] | Same page |
| TimeGuessr | Three tiles: Play, Multiplayer, Daily. The daily is one click, at `/play?mode=daily` [S7] | None shown |
| Clues by Sam | A hub for one product: the week's puzzles by weekday, plus links to packs and sister sites [S8] | Other domains |
| Sporcle | Pitch banner, the day's Acrostic, a quiz grid, a games row, a "Daily Dose" row of four dated cards [S9] | Same page |
| dles.gg, Arkadium | Directory of 1,091 games [S10]. Catalogue of about 35 genre tiles with a B2B pitch [S11] | Same page |
| The Dozen (Barstool) | The game, with a leaderboard link [S12] | None |
| NYT Games | Wordle has its own URL. The hub is the Games app [S1][S13]. nytimes.com would not fetch | App home |

Puzzmo, Bandle and Lovatts could not be checked, so their structure is
unverified. I found nothing for "Daily Dozen" beyond The Dozen above.

Reading the table:

1. Single-game sites lead with the game. Costcodle gets 189k visits a month
   with nothing but the board [S14].
2. Studios with several games keep each game at the root of its own domain or
   subdomain and put the company hub elsewhere. Teuteuf and Trainwreck Labs both
   do this. Teuteuf's sites show 6.9M visits in September 2026, which looks like
   a root-domain total across all games [S15].
3. A menu at "/" belongs to either one product with several modes (TimeGuessr,
   Waffle, Clues by Sam) or a true catalogue of 200 to 1,000+ games (Arkadium,
   dles.gg, Sporcle). Pricele, at about five games, is the first kind.
4. NYT turned its app into a hub in March 2024 because the app had been built
   for crosswords and had outgrown it. It cut the bottom bar from five tabs to
   three and put all games in one list with progress on each card [S1]. That is
   a surface for returning players. I assume new players still arrive on a
   single game URL, but I could not verify that.
5. Wordle moved from `powerlanguage.co.uk/wordle` to `nytimes.com/games/wordle`
   in February 2022. TechCrunch noted the odd old name left searchers unsure
   whether the site was the real one [S16].

### What the SEO evidence says

I found no published case of a daily game moving its game off "/" and reporting
the search effect. What exists is indirect.

- General SEO sources say a homepage tends to hold the most links, so it often
  outranks inner pages for brand and broad terms [S17]. That is a rule of thumb,
  not evidence about games.
- A brand query is the main search source for these games. Semrush attributes
  77% of Costcodle's estimated traffic to "costcodle" [S14], 79% of Bandle's to
  "bandle" [S18], and about 84% of Clues by Sam's to two spellings of its name
  [S8]. Each ranks first for its own name.
- Names get squatted. A search for Costcodle returns costcodle.org, .io, .lol
  and dailycostcodle.com beside the original [S19]. Who owns them is unverified.
- Waffle's studio says it ranks first for "Waffle" in every country [S20].
- Pricele has no brand demand yet. The August 2026 baseline in `visibility.md`
  found that a search for "Pricele daily price guessing game" returned six
  competitors and no Pricele. The job is to create the brand query, and a hub
  cannot do that.
- Direct visits are 43% for Costcodle [S14], 58% for TimeGuessr [S21], 75% for
  Clues by Sam [S8], 51% for Bandle [S18] and 53% for Teuteuf [S15]. My
  inference is that many of those players have the game's URL bookmarked. If
  "/" becomes a hub, each of those daily visits pays an extra click.
- TimeGuessr ranks first for its own name with a non-game landing page [S21], so
  a menu at "/" does not by itself hurt search. It has a strong brand and a
  one-click daily. Pricele has neither yet.

### Recommendation

Keep the game at "/".

1. `/today` stays the hub for your own progress, streak and combined share line.
2. Add `/games`. Today `/games/then-and-now` and `/games/rent-ratio` exist but
   `/games` has no page. A plain server-rendered index with one card per game
   (description, data source, daily number) gives directories, `/daily-games` and
   crawlers one URL that lists everything.
3. Offer the second game after the first. Teuteuf unlocks bonus rounds after the
   daily [S2], and `NextUp` already does this job in Pricele.
4. Link each game by its own URL in shares, as TimeGuessr does with
   `?mode=daily`.
5. If a hub brand is ever needed, copy Teuteuf and Trainwreck Labs and put it on
   a separate page.

When to switch "/" to a hub. These are my judgment, since I found no sourced
threshold. Switch when at least two of these hold:

- Four or more daily games each draw 5% or more of the home page's daily players.
- More than 25% of daily visitors play a second game in the same session, for
  several weeks running.
- Search Console shows "pricele" returning pricele.online first.
- Daily players pass about 25,000. That number is a round figure, not a finding.

Until then, measure. `LandingTracker` and the `/today` hub already give most of
the inputs. Add one event for "second game played in session". If you do switch,
copy TimeGuessr and not Arkadium: today's flagship stays playable on the first
screen, with the other games as tiles beside it.

## 2. Adjacent games with real audiences

### What I found

Visits are Semrush estimates for September 2026, sourced per row.

| Game | Mechanic | Visits per month | What makes it shareable |
| --- | --- | --- | --- |
| Costcodle | Guess a Costco item's price, six tries, higher/lower hints, a tolerance band. The page credits a Costco Food Database [S5][S19] | 189k, up from 153k in August [S14]. Semrush said 201k for May 2025 with 71% US [S22] | I could not confirm a share format |
| TimeGuessr | Five photos a day. Drop a pin on a map and set a year on a slider, up to 5,000 points each [S23] | 1.52M, from 1.15M in July [S21] | Friends' leaderboard. The developer has said a global one would fill with cheaters [S24], secondhand |
| MapTap | Five places a day on a map, each scored 0 to 100, later rounds weighted up, total out of 1,000 [S25] | Not found | A copy-paste text line with five emoji scores and a total [S25]. Made by John Donham, released June 2024 per Kotaku [S26], unverified in detail |
| Higher Lower Game | Two Google search terms, pick which gets more searches, streak | 234k, 59% from Google [S27] | One number, the streak. The 2016 original claimed over 50M plays [S28] |
| WhenTaken, Bandle | Guess where and when a photo was taken. Guess a song from instrument layers | 369k [S30]. 2.85M [S18] | Not checked |
| Clues by Sam | Deduction grid of 20 suspects, no guessing allowed [S8] | 1.98M [S8] | Scenario-share links that keep old puzzles circulating [S31] |
| Wikitrivia | Place a card on a timeline, lose a life per wrong spot, three lives. Data from Wikidata. Peaked January 2022 [S32] | Not found | Single score |
| Pinpoint (LinkedIn) | Launched May 2024, one play a day. Shows streak and which connections played [S33] | No public numbers found | The social graph does the sharing |

I did not research Statle, Numble or GeoGuessr's daily. Travle is a daily
border-chain game, but I found no traffic and no firm launch date [S34].

Three patterns:

1. The closest relatives of Pricele are mid-sized, not huge. Costcodle, at under
   200k visits a month, shows a real audience for one price game. TimeGuessr is
   about eight times larger and adds time to the guess, so a time axis on a
   price looks like the bigger lane. That is an inference from two sites.
2. The biggest numbers come from geography-shaped games with a scored distance
   and a map: TimeGuessr, OpenGuessr (3.28M visits [S29]), the Teuteuf family. A scored closeness
   number is the part of that worth borrowing.
3. Shares that carry a number and five small icons spread. MapTap's line is the
   cleanest modern example. A Wordle-style grid is not required.

Query volumes from the same Semrush pages (US, September 2026) [S14][S21][S27][S15][S30].
"Guess the price" has 1,000 searches a month and Costcodle ranks third.
"What year" has 22,200, with TimeGuessr fourth and WhenTaken fifth. It is a
generic phrase, so only part of that volume is winnable. "Guess the country" has
22,200 and "higher lower game" 9,900, both led by the sites named above. I found
no volume for "daily price game". Unverified.

### Five cheap mechanics from the data Pricele already has

None needs new data. Each reuses the log-scale scoring and the share card.

1. **Five-round scored basket.** Five single items a day, each scored 0 to 100
   by how close the guess is on a log scale, with later rounds weighted up, and
   a total out of 1,000. Share line in MapTap's shape. Why: it is a proven
   format [S25] and gives five decisions a day instead of one. Data:
   `data/prices.json`. Cost: days.
2. **What year was this price?** Show a US item and its average price, set the
   year on a slider, score by distance in years, five items a day. Data: BLS
   1995 to 2025 in `data/then-and-now.ts`. Why: it reverses Then & Now, so the
   data and the licence are done, and it borrows TimeGuessr's slider [S23]. The
   copy must say prices are nominal. Cost: days.
3. **Basket total.** Three items from one country listed together and one number
   to guess, within 5%, with hot and cold hints. Why: it reuses the main
   game's engine and gives a receipt-shaped result, like Costcodle's. Cost:
   hours. Check that each country has all three items.
4. **Higher/Lower, daily and with a streak.** Promote the existing side mode to
   a fixed ten-pair daily and share the streak. Why: the genre's own site holds
   234k visits a month and 59% of it comes from search [S27]. This overlaps
   `game-ideas.md` item 4. The new part is the search evidence. It is also the
   only item here that is evergreen search, not daily habit. Cost: days.
5. **Birth-year price card.** Enter a year, get a card of what the 15 Then & Now
   items cost that year against today. Not a daily game, a share tool. Why:
   nostalgia price comparisons already circulate, for example the "Home Alone"
   $19.83 grocery meme [S35] (seen in a search snippet only, unverified).
   Data: BLS. Cost: days. Good for TikTok and Reddit.

Inflation Ladder already exists in the repo (`lib/inflationladder.ts`) and in
the game registry, though `game-ideas.md` lists only Then & Now as shipped.
Check whether it is live before building anything that overlaps it.

## 3. Growth tactics that worked for small makers

### Cases with numbers

- **GeoSports, May 2026.** Built on MapTap's idea with Claude Code over a
  weekend. Day 1: 79 players. Day 2: 575. Day 3, before noon: over 4,000. The
  only named channel was a feature in Kendall Baker's sports newsletter. The
  author also credits no email or phone number being required [S36]. These are
  the author's own figures.
- **Waffle.** Made over two weekends and released in February 2022. Posted to
  two Reddit channels. Each press hit (PC Gamer, CNET, Lifehacker) moved DAU
  "to a new level, and stayed there". Paid TikTok, Meta and Google ads "didn't
  noticeably raise DAU". About 400k DAU quickly, then about 475k since. Told by
  the studio to mobilegamer.biz on 29 May 2025 [S20].
- **Globle.** A post to r/webdev "got absolutely zero traffic". The same post
  to r/geography got momentum [S4]. The 1.3M to 1.4M daily players for 2022 is
  the creator's claim, already in `growth.md`.
- **Clues by Sam.** Launched as a daily in May 2025. The Show HN post got 3
  points and 2 comments on 8 May 2025 [S37]. It still reached about 1.98M
  visits in September 2026 [S8], 75% of them direct. A fan site, a board-game
  creator sharing pictures, and scenario-share links carried it [S31]. The
  claim of 50,000 daily players by early 2026 comes from the developer's
  LinkedIn via Wikipedia, which is flagged for deletion [S38]. Treat it as
  approximate.
- **Puzzmo through publishers.** Licensed to 50+ Hearst publications, with
  Anchorage Daily News hosting four games on its own site [S39]. Polygon's
  editor said the revenue was a small fraction of a percent of theirs and the
  value was audience loyalty [S13]. Embeds buy distribution, not income.

### What this suggests

1. **Fit beats volume on Reddit.** Same post, two subreddits, opposite results
   [S4]. For Pricele the candidates are r/geography-adjacent and money
   subreddits, not general dev ones. `visibility.md` lists Show HN as P1. The one
   Show HN I could verify for a daily game got 3 points [S37]. Keep it, but do not
   plan around it.
2. **One newsletter mention can do more than a month of posting.** GeoSports went
   from 575 to 4,000+ in a day on one feature [S36]. Pitch finance, geography,
   and sports-adjacent newsletters with a single line and a link. Do it after
   the five-round format ships, since a newsletter reader plays once and judges.
3. **Press compounds in steps.** Waffle's DAU held after each article [S20].
   A data story from the price table fits `growth.md` section 4. The
   retention is what makes the step stay.
4. **Paid social did not work for Waffle** [S20]. Skip it.
5. **Streamers.** PlayDaily's 2026 trends piece says audio games spread through
   streamers more than through search [S40]. It is a vendor's opinion piece about
   its own games. I found no number for a streamer spike on a price or
   geography game.
6. **TikTok and Discord.** I found no sourced number for either. TimeGuessr
   links Discord, Reddit and Instagram in its footer [S7]. Treat both as
   unproven for this genre.
7. **No account, under a minute.** GeoSports's author lists it as a reason
   [S36]. Pricele already works this way. Do not add sign-up before play.
8. **Aggregators.** dles.gg lists 1,091 games [S10]. Listing is cheap, but none
   of these sites publishes traffic, so I have no referral number.

## 4. SEO and answer engines in 2026

### What Google says now

- **FAQ rich results are gone.** Google removed the FAQ feature from Search on
  7 May 2026 and deleted its documentation on 15 June 2026. It had shown only
  for well-known government and health sites since September 2023 [S41]. Keep
  FAQ copy on the page as readable text, but drop any claim that FAQ markup
  earns a rich result. `visibility.md` leans on FAQ citation rates from vendor
  studies. Those are not Google's position.
- **No game rich result.** Google's structured data gallery has no game or video
  game feature. The closest is Software app, whose rules do not say games qualify
  [S42]. `Game` and `VideoGame` markup remains valid schema.org for other
  parsers. Do not expect it to change what Google shows.
- **No special markup for AI.** Google's guide of 15 May 2026 says there is no
  schema for generative AI features, that structured data is not required for
  them, that `llms.txt` and other AI files are not needed, and that seeking
  inauthentic mentions "isn't as helpful as it might seem". It asks for
  non-commodity content and standard crawl and index hygiene [S43][S44].
- Breadcrumb and Dataset markup still have their normal uses. Dataset can show in
  Dataset Search [S42].

### `llms.txt`

- Originality.ai counted 36,120 `llms.txt` files by May 2026, up 8.8x in a year
  [S45].
- Ahrefs log data over 137,000 domains found 97% of those files got zero
  requests in May 2026. AI retrieval bots were 1.1% of requests. GPTBot was
  4.51% and ClaudeBot 0.80% [S45].
- Google says the file has no effect on search visibility [S45].
- Pricele already serves one. Leave it. Do not spend more time on it.

### How assistants pick games

The studies are vendor analyses and they disagree on shares, so use them for
direction only.

- ChatGPT leans on Wikipedia and authoritative media. Semrush saw its Reddit
  share fall from about 60% of responses to about 10% in September 2025 [S46].
- Perplexity leans on community and review sources. Reddit is cited as about
  46.7% of its top-10 share [S46].
- About 43% of Google AI Overview citations go to Google's own properties, such
  as YouTube. 93.67% of citations match at least one top-10 organic result
  [S46].
- Only 12% of assistant-cited URLs rank in Google's top 10, from an Ahrefs
  study of 15,000 prompts [S47]. Overlap with web rankings is partial.
- ChatGPT's web results have historically leaned on Bing's index, and a page Bing
  has not indexed is hard to surface [S47]. This is an unquantified claim.
- `visibility.md` quotes 41%, 49%, 64% and 68% weights for list mentions. I did
  not trace that source. Treat those as unverified.

What this gives you to do:

1. Submit to Bing Webmaster Tools and use IndexNow, as well as Search Console.
   Cheap, and the Bing link to ChatGPT is the best-supported mechanism above.
2. Get into the places assistants quote: the directory and listicle plan in
   `visibility.md`, and real Reddit threads where people ask for daily games.
3. Put one fact-checked, citable answer at the top of each reference page.
   That is Google's "non-commodity content", and Pricele's sourced price
   table is exactly that.

### Do assistants send traffic

Barely. Over six months Semrush counts 135 Gemini visits to Costcodle, about 1,000
ChatGPT and 266 Gemini visits to TimeGuessr, and about 2,000 ChatGPT and 287
Gemini visits to the Teuteuf sites [S14][S21][S15]. Sporcle gets about 4,000
from ChatGPT and 3,000 from Gemini, together about 0.05% of its traffic [S9].
Do the AEO work because it is cheap and builds the brand, but expect no traffic
from it in 2026.

### Queries to own

- Brand: "pricele", "pricele today", "pricele answer". Costcodle, Bandle and
  Clues by Sam all get "answer", "today" and "archive" variants [S14][S18][S8].
  Pricele has an archive. Make sure the page for it has those words.
- Category: "guess the price" (1,000 a month, Costcodle at 3 [S14]). It is the
  query where Pricele has the best shot at the top three.
- Question: "how much does X cost in Y". Already served by `/prices/*`.
- Listicle: "games like wordle". No volume found. PC Gamer's site gets about
  16M visits a month [S48]. Appearing in that article matters more than ranking
  for the phrase.

## Gaps

No before-and-after case of a game leaving "/". Pricele's own Search Console and
a second-game session event are the only way to settle it. Puzzmo, Globle's
homepage, Bandle and NYT Games on the web could not be fetched. No traffic found
for MapTap, Pinpoint, Travle or Wikitrivia.

## Sources

Pages fetched 22 Oct 2026 unless a date is given. Semrush figures are modelled
estimates.

- [S1] TechCrunch, NYT Games redesigned app, 7 Mar 2024. https://techcrunch.com/2024/03/07/nyt-games-redesigned-app-boost-discovery-simplify-navigation/
- [S2] Worldle homepage. https://worldle.teuteuf.fr/
- [S3] Teuteuf Games homepage. https://teuteuf.fr/
- [S4] Hey, Good Game, Trainwreck Labs interview, 16 Jan 2024. https://www.hey.gg/blog/trainwrecklabs
- [S5] Costcodle homepage. https://www.costcodle.com/
- [S6] Waffle homepage. https://wafflegame.net/
- [S7] TimeGuessr homepage. https://timeguessr.com/
- [S8] Clues by Sam homepage and Semrush. https://cluesbysam.com/ and https://www.semrush.com/website/cluesbysam.com/overview/
- [S9] Sporcle homepage and Semrush, 15.46M visits. https://www.sporcle.com/ and https://www.semrush.com/website/sporcle.com/overview/
- [S10] dles.gg homepage. https://dles.gg/
- [S11] Arkadium homepage. https://www.arkadium.com/
- [S12] The Dozen. https://www.dailydozentrivia.com/
- [S13] Aftermath on Puzzmo and NYT, 18 Apr 2024. https://aftermath.site/new-york-times-wordle-connections-puzzmo-games/
- [S14] Semrush, costcodle.com. https://www.semrush.com/website/costcodle.com/overview/
- [S15] Semrush, worldle.teuteuf.fr (appears to be root-domain data). https://www.semrush.com/website/worldle.teuteuf.fr/overview
- [S16] TechCrunch, Wordle moves to NYT, 10 Feb 2022. https://techcrunch.com/2022/02/10/wordle-streak-new-york-times-powerlanguage
- [S17] Search Engine Land, keyword cannibalization guide (general SEO, not games). https://searchengineland.com/guide/keyword-cannibalization
- [S18] Semrush, bandle.app. https://www.semrush.com/website/bandle.app/overview/
- [S19] Search results listing Costcodle clone domains (costcodle.org, .io, .lol, dailycostcodle.com), Oct 2026; ownership unverified. https://costcodle.org/
- [S20] mobilegamer.biz, Waffle, 29 May 2025. https://mobilegamer.biz/daily-word-game-studio-waffle-is-the-latest-small-dev-to-find-a-big-audience
- [S21] Semrush, timeguessr.com. https://www.semrush.com/website/timeguessr.com/overview/
- [S22] Semrush, costcodle.com, May 2025 snapshot. https://es.semrush.com/website/costcodle.com/overview
- [S23] TimeGuessr mechanics, from search summary of app store and PCWorld pages. https://www.pcworld.com/article/3233865/geoguessr-fans-should-try-this-addictive-history-game.html
- [S24] Substack review of TimeGuessr, secondhand developer quote. https://mikecldi.substack.com/p/my-favorite-puzzle-game-right-now
- [S25] TechCrunch, MapTap, 18 Jun 2026. https://techcrunch.com/2026/06/18/maptap-a-daily-geography-game-is-my-new-wordle
- [S26] Kotaku listing, MapTap release date (search result only). https://kotaku.com/games/maptap-dot-gg
- [S27] Semrush, higherlowergame.com. https://www.semrush.com/website/higherlowergame.com/overview/
- [S28] The Drum, Higher Lower Game, 12 Jul 2016. https://www.thedrum.com/news/2016/07/12/code-computerlove-s-higher-or-lower-search-game-app-goes-viral
- [S29] Semrush, openguessr.com. https://www.semrush.com/website/openguessr.com/overview/
- [S30] Semrush, whentaken.com. https://www.semrush.com/website/whentaken.com/overview/
- [S31] W. Eric Martin, Clues by Sam, Feb 2026. https://www.wericmartin.com/spotting-criminals-is-a-daily-challenge-with-clues-by-sam/
- [S32] Wikipedia, Wikitrivia (search summary). https://en.wikipedia.org/wiki/Wikitrivia
- [S33] Tom's Guide, LinkedIn games launch, May 2024. https://www.tomsguide.com/computing/social-media/wordle-alternatives-linkedin-launches-3-new-puzzle-games
- [S34] Capitalle on Travle; Traveller.com.au on Worldle (search summaries only). https://www.capitalle.app/blog/travle-alternatives and https://www.traveller.com.au/worldle-a-geography-based-version-of-wordle-is-perfect-for-travel-lovers-h21q4b
- [S35] meme.com, grocery store prices meme (search snippet only). https://meme.com/memes/grocery-store-prices
- [S36] FMS Newsletter, GeoSports, 6 May 2026. https://fmsnewsletter.beehiiv.com/p/geosports
- [S37] Hacker News, Show HN: Clues by Sam, 8 May 2025. https://news.ycombinator.com/item?id=43923843
- [S38] Wikipedia, Clues By Sam (search summary; fetch returned 404; flagged for deletion per `business.md`). https://en.wikipedia.org/wiki/Clues_By_Sam
- [S39] Anchorage Daily News on Puzzmo, June 2024 (search summary). https://www.adn.com/puzzles/2024/06/08/play-traditional-newspaper-games-with-a-new-spin/
- [S40] PlayDaily, trends 2026. https://playdaily.org/resources/stories/online-puzzle-game-trends-2026
- [S41] Google, FAQPage documentation with deprecation notes of 8 May and 15 Jun 2026. https://developers.google.com/search/docs/appearance/structured-data/faqpage
- [S42] Google, structured data gallery. https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- [S43] Search Engine Journal, Google AI search guide, 15 May 2026. https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/
- [S44] DemandSphere on the same guide. https://www.demandsphere.com/blog/google-ai-optimization-guide-ai-search-is-still-search/
- [S45] PPC Land, llms.txt adoption, 2 Jul 2026 (Originality.ai, Ahrefs). https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/
- [S46] 5W PR, State of AI Citations 2026. https://www.5wpr.com/research/state-of-ai-citations-2026/
- [S47] Frase, which AI engines cite which sources, 9 Jun 2026. https://www.frase.io/blog/which-ai-engines-cite-which-sources
- [S48] Semrush, pcgamer.com, 16.01M visits. https://www.semrush.com/website/pcgamer.com/overview/
