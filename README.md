# Pricele

A daily price-guessing game. Each day you guess the price of a fixed item (this
month, a 330ml Coca-Cola can) in a different country, in up to 5 tries, with
hotter/colder feedback on a log scale. The country changes daily; the item
changes monthly.

There's no backend. Game data is static JSON bundled at build time, and player
state (today's guesses and your streak) lives in `localStorage`, keyed by UTC
date. The site is built with Next.js and statically generated, so it deploys to
Vercel with no config.

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
