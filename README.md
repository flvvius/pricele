# Pricele

A daily "guess the price" game. Each day you guess the price of a fixed item
(this month: a 330ml Coca-Cola can) in a different country, in up to 5 tries,
with log-scale hotter/colder feedback. New country every day; item changes
monthly.

- **No backend.** Game data is static JSON bundled at build time; player state
  (today's guesses + streak) lives in `localStorage`, keyed by UTC date.
- **Static / SSG.** Built with Next.js App Router, statically generated for SEO,
  deploys to Vercel.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # scoring unit tests (vitest)
pnpm build      # static production build
```

## How it works

| Concern            | Where                                         |
| ------------------ | --------------------------------------------- |
| Scoring (log-band) | `lib/scoring.ts` (+ `lib/scoring.test.ts`)    |
| "Today" logic (UTC)| `lib/puzzle.ts`                               |
| Player state       | `lib/storage.ts`                              |
| Share card text    | `lib/share.ts`                                |
| Game UI            | `components/*`                                 |
| Content            | `data/prices.json`, `data/rotation.ts`, `data/item.ts` |

### Content model

- `data/item.ts` — the active item for the month.
- `data/prices.json` — one row per country: price in USD + local currency, and
  the average local hourly wage (drives the reveal stat).
- `data/rotation.ts` — an ordered list of country codes + a start date. Today's
  country is `countryOrder[daysSinceUTC(startDate, today) % length]`. Reorder the
  array to shape the difficulty curve; no per-date rows to maintain.

The seed `prices.json` ships with ~10 hand-entered countries marked
`"source": "Seed estimate"`. Replace these with verified numbers and expand the
set before a real launch — see `scripts/collect-prices.ts` for the collection
scaffold and the accuracy caveats.

> Prices are estimates for a daily puzzle, not shopping advice.
