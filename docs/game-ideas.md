# Game ideas for the hub

Researched 2026-10-22. Brand rule from `business.md` §4: one number, a citable
source, a licence that allows commercial use, a result you can share in one line.

## What the landscape looks like

- **Saturated: word games and country-guessing.** Wordle variants keep
  multiplying (PC Gamer's roundup lists Woodle, Numbword, Quordle, Waffle). One
  aggregator lists 137 daily geography games, mostly silhouette, flag or
  globe-distance variations of Worldle and Globle. A fourth "guess the country"
  game won't stand out.
- **What's doing well:** aggregator rankings (Seekdle 2026, DLES.gg Oct 2026)
  put Bandle, TimeGuessr, Pinpoint and Costcodle near the top. NPR's Sept 2026
  list adds MapTap, Catfishing and Clues by Sam. **Costcodle** (guess a Costco
  price) and **TimeGuessr** (guess the year) are the closest relatives of
  Pricele, and both are popular. That suggests real-world numbers plus time or
  money is a format with an audience.
- **What spreads:** one shared puzzle a day with a natural stopping point and
  a spoiler-free emoji grid (playdaily.org's 2026 trends piece; Wordle's own
  history). Topical tie-ins also spread: NYT ran a World Cup Connections that
  stayed on as a daily.
- **Gap:** almost nobody does *sourced, cited* numbers. Most stat dailies don't
  name a source. Nostalgia pricing ("what did this cost in 1995?") is shared all
  the time on social media, but no daily game owns it yet.
- **Data caution found during research:** ILOSTAT's terms allow reproduction
  "generally for non-commercial purposes", and OECD's Data Explorer points to
  general terms rather than an explicit CC BY. The `avgHourlyWageUSD` column
  in `data/countries.ts` is mostly marked `estimate`. So **Wage Clock cannot
  ship honestly yet**. It needs a wage source with confirmed commercial reuse
  terms first.

Sources: [PC Gamer](https://www.pcgamer.com/best-games-like-wordle/),
[playdaily.org trends 2026](https://playdaily.org/resources/stories/online-puzzle-game-trends-2026),
[Alldle geography list](https://www.alldle.net/blog/daily-geography-games),
[Seekdle ranking](https://seekdle.com/most-popular-dle-games/),
[DLES.gg popular](https://dles.gg/games/most-popular),
[NPR, Sept 2026](https://www.npr.org/2026/09/03/nx-s1-5954057/beyond-worlde-fun-daily-games-you-must-play),
[NYT Connections (Wikipedia)](https://en.wikipedia.org/wiki/The_New_York_Times_Connections),
[ILOSTAT re3data entry](https://www.re3data.org/repository/r3d100013044),
[OECD average annual wages](https://www.oecd.org/en/data/indicators/average-annual-wages.html).

## Scoring

Each idea is scored 1-5 on four things (5 = best): **Build** (cheap to build),
**Data** (available and licensed for commercial use), **Viral** (likely to be
shared), **Sponsor** (fits a sponsor). Total out of 20.

| # | Idea | Mechanic | Data source (licence) | Build | Data | Viral | Sponsor | Total |
|---|---|---|---|---|---|---|---|---|
| 1 | **Then & Now** *(shipped)* | Shown an item's latest U.S. average price, guess its price in an earlier year | BLS Average Price Data, APU series (US gov, public domain) | 5 | 5 | 4 | 4 | **18** |
| 2 | **Fill-Up** | Guess the price of a litre of petrol/diesel in a country, compared with yours | Already in `data/prices.json` (sources as on `/data`) | 5 | 4 | 3 | 4 | 16 |
| 3 | **Inflation Ladder** *(shipped)* | Order 5 items by how much their price rose 1995→2025 | BLS AP (public domain) | 4 | 5 | 3 | 4 | 16 |
| 4 | **Higher/Lower daily** *(shipped as Higher or Lower Daily)* | Promote the side mode to a fixed 10-pair daily with a score | Existing price table | 5 | 4 | 3 | 3 | 15 |
| 5 | **Where in the World daily** *(shipped as Price Atlas)* | One fixed basket a day, name the country | Existing price table | 5 | 4 | 3 | 3 | 15 |
| 6 | **Power Bill** | Guess the U.S. average price per kWh or gallon of heating oil in year X / by state | BLS AP; EIA state electricity prices (US gov, public domain) | 4 | 5 | 2 | 5 | 16 |
| 7 | **Distance Duel** | Guess the great-circle km between two capitals | Natural Earth (public domain), computed | 4 | 5 | 3 | 3 | 15 |
| 8 | **Population Pin** | Guess a city's population, log-scale hot/cold | GeoNames (CC BY 4.0) | 4 | 4 | 3 | 2 | 13 |
| 9 | **Rent Ratio** | Guess the median U.S. metro rent for a 2-bed | HUD Fair Market Rents (public domain) | 4 | 5 | 4 | 5 | 18* |
| 10 | **Box Office Year** | Given a film's inflation-adjusted gross, guess release year | Gross data is mostly proprietary (Box Office Mojo) | 3 | 1 | 4 | 3 | 11 |
| 11 | **Wage Clock** | Minutes of local average wage to buy an item | Prices: ours. Wages: ILO/OECD, terms unclear | 4 | 2 | 5 | 5 | 16 |
| 12 | **Ticket Price** | Guess a U.S. average airfare by year | BTS Average Domestic Airline Fares (public domain) | 4 | 5 | 3 | 5 | 17 |
| 13 | **Stamp Clock** | Guess the U.S. first-class stamp price in year X (sequence puzzle) | USPS rate history (public facts) | 5 | 4 | 3 | 2 | 14 |
| 14 | **Tuition Then** | Guess the average published college tuition in year X | NCES Digest tables (public domain) | 4 | 5 | 4 | 4 | 17 |
| 15 | **Carbon Cost** | Guess kg CO2 per capita for a country | Our World in Data / Global Carbon Project (CC BY 4.0) | 4 | 4 | 3 | 3 | 14 |
| 16 | **Life Line** | Guess a country's life expectancy | World Bank WDI (CC BY 4.0) | 4 | 5 | 2 | 2 | 13 |
| 17 | **Minimum Wage Map** | Guess a U.S. state's minimum wage in year X | U.S. DOL state minimum wage history (public domain) | 4 | 5 | 3 | 4 | 16 |
| 18 | **Price Pairs** | Which cost more in its year: X in 1995 or Y in 2025? (cross-time Higher/Lower) | BLS AP (public domain) | 5 | 5 | 3 | 3 | 16 |

\* Rent Ratio scores high but metro-level FMRs are rules for setting
subsidies, not market medians. The copy would have to say "HUD fair market
rent", not "rent", or it overclaims.

## Ranked top 5 and why

1. **Then & Now (18)** shipped at `/games/then-and-now`. It has the cleanest
   licence of any idea (public-domain BLS data), it taps nostalgia sharing,
   and it reuses the house mechanic of a price guess with higher/lower hints.
   It extends naturally to Power Bill and Price Pairs.
2. **Rent Ratio (18)** has the strongest sponsor fit (proptech, banks) and is
   topical. The copy must be careful about what an FMR is.
3. **Ticket Price (17)**: airfare history from BTS. Airlines and travel cards
   are a natural sponsor.
4. **Tuition Then (17)**: NCES data. It is very shareable among students and
   parents, and fits ed-tech sponsors and the classroom channel.
5. **Fill-Up / Inflation Ladder / Minimum Wage Map (16)**: Fill-Up costs
   almost nothing because the data is already in the repo. Inflation Ladder
   reuses the Then & Now dataset with a new sorting mechanic.

Wage Clock stays the best sponsor story. It moves up the list once a wage
series with confirmed commercial-use terms is in place. Options: write to the
ILO for permission; or use OECD only if the specific dataset is confirmed
CC BY, and limit the game to OECD countries.

## Then & Now: data notes

- File: `data/then-and-now.ts`, generated from
  `https://download.bls.gov/pub/time.series/ap/ap.data.0.Current`, fetched
  2026-10-22, by `scripts/then-and-now/scan.py` (with series codes) and `gen.py`. Each annual value is the
  mean of that year's published monthly U.S. city averages, and years with
  fewer than 10 published months are dropped.
- Prices are nominal and not adjusted for inflation. The page says so.
- 15 items, 1995-2025. Puzzle #1 is 2026-10-22. Items cycle in order, so no
  item repeats within 15 days, and the year is a hash of the day index,
  always at least 5 years before the anchor year.
- Refresh once a year after BLS publishes December data: re-run the
  extraction, and the anchor year moves forward on its own.

## Shipped 2026-10-22

- **Inflation Ladder** at `/games/inflation-ladder`. Four items from the Then &
  Now data and one base year between 1995 and 2010. Order them by price rise to
  the latest full year. You get three tries and see which rungs are right after
  each. Rises within a puzzle are at least 15 percentage points apart, so the
  order is never a coin flip.
- **Price Atlas** at `/games/price-atlas`. This replaced the plain "Where in the
  World daily". A single price does not identify a country, so the puzzle
  starts with three and adds one per miss. Each guess also returns Worldle's
  distance and arrow, measured capital to capital, plus the typical price gap
  between the two countries. That last clue is the one only this site can give.
- **Higher or Lower Daily** at `/games/higher-or-lower`. A fixed chain of ten
  cards and nine calls. It uses the same 1.05x-3x ratio gate as the unlimited
  mode, and the item changes at every step.

## Round two: Price Year and Open Range

A deep-research run and two rounds of review by fresh agents, all on
2026-10-22, narrowed 14 ideas to two.

What the research could verify: MapTap's format (five rounds, 0-100 each,
weights 1, 1, 2, 3, 3, out of 1,000) and TimeGuessr's year slider both got
national press in 2026. BLS data is public domain and Eurostat allows
commercial reuse with attribution. It could not verify any traffic numbers for
Costcodle, TimeGuessr or the stat-guessing games, so growth claims about them
stay out of this doc.

Killed, and why:

- **Price Connections**: groups computed from data have no wordplay and no
  real red herrings, and 16 items is too few.
- **Price Timeline**: BLS series repeat values (eggs were $1.66 in both 2009
  and 2010), so some placements have no right answer.
- **Exact Change**: a subset sum. A calculator solves it.
- **Gas Map USA**: EIA publishes weekly gas prices for only a handful of
  states.
- **Line Reveal** (name the item from its price chart): most food lines are
  noisy and rising, so it is a lottery.
- **Work Time** (did X take more minutes of work then or now?): for most items
  the answer is "then" until about 2019, so players learn the rule in a week.
  The fact is good, so it moved into Price Year's reveal.
- **Pricele 1000**: a scored mode of the main game. Worth doing, but it brings
  no new players, so it waits.

Shipped:

- **Price Year** at `/games/price-year`. Five receipts, each three U.S.
  average prices from one year between 1980 and 2025, one year from each
  nine-year era. A single series can't give the year away (eggs were $1.99 in
  2008 and $1.91 in 2013), so each receipt is the set of three items whose
  prices differ most from every year four or more away, at least 12% on mean
  absolute log price when such a set exists. Scoring is 200 × (1 − miss/8),
  floored at 0. After each receipt the reveal shows the basket in minutes of
  work at the BLS average hourly wage, then and now. The 1980-1994 data came
  from the BLS API; `scripts/price-history/fetch.py` rebuilds the file and
  matches `data/then-and-now.ts` exactly for 1995-2025.
- **Open Range** at `/games/open-range`. Five items in five countries, with
  the median across countries as an anchor. A hit scores
  100 × (1 − ln(width)/ln 8), at least 10; a miss scores 0; ranges wider than
  12x are refused. Tested against a year of puzzles: using the median ÷1.5 to
  ×1.5 every time lands 57% of the time and averages 174 of 500, so knowing
  country price levels is where the points are.

Next: a born-year page ("the year you were born, coffee took 27 minutes of
work") that uses the 1980 data for search, and the scored mode of the main
game.
