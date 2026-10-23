# Player feedback backlog

What players reported that is still open. Move an entry to "Done" with the
commit when it ships.

## Open

### More countries: next batch

12 countries were added on 2026-10-26 (see Done). Ones considered and held
back, and why:

- **Bulgaria, Serbia, Ukraine, Albania, Estonia, Latvia, Lithuania,
  Slovenia, Cyprus, Belgium:** the newest ILO hourly-earnings figure is
  from 2018 or earlier (Ukraine's is from 2016), from before the 2022 price
  shock. Rule used: ILO 2020 or later. To add them, either relax that rule
  or source a newer official wage. ILO monthly earnings are often more
  recent, but converting them to hourly would mean picking an hours figure
  ourselves.
- **Denmark, Croatia, Morocco, Qatar, Kuwait, Georgia, Azerbaijan,
  Kazakhstan:** the ILO publishes no hourly-earnings series for them in USD
  (dataflow `DF_EAR_EHRA_SEX_CUR_NB`).
- **Hong Kong, Taiwan:** not in the WHO or World Bank tables, so only four
  items. Price Atlas needs at least five.
- **Ethiopia:** four game items. Same problem.

How the 12 were added, for repeating it: rows from
`pnpm refresh-open-prices` (online) and `refresh-big-mac --offline`, then
existing countries' rows restored byte for byte so no past answer moved.
Countries join the games by date via `COUNTRIES_ADDED_ON` in
`data/countries.ts`. `lib/gamerows.test.ts` guards the archive.

### More approachable items

Spirits, vape liquid and natural gas were retired from the games on
2026-10-26. Other items could get the same complaint:
`electricity-100kwh` (who knows a 100 kWh price?), `healthy-diet-day`
(an abstract World Bank basket) and `diesel-1l`. Retiring more shrinks the
rotation, so the real fix is **adding** everyday items with wide sourced
coverage (bread, rice, a taxi ride, a cinema ticket, rent?). Adding items
doesn't touch past days if it's done as a new era in `data/rotation.ts`.

Many countries have only the "global" items, because the Numbeo grocery
rows (milk, eggs, apples, cappuccino) cover 32 of 61 countries, and none of
the 12 added in October 2026. Petrol is done: the 29 gaps were filled from
GlobalPetrolPrices on 2026-10-26. Numbeo can't be bulk-fetched (rate
limits and its terms; the site returned HTTP 429 when checked), so those rows
are collected by hand. Filling them would make Pricele and Price Atlas less
repetitive in sparse countries.

### Guessing by direction alone in the main Pricele game

The Price Atlas half of this is fixed: the arrow now shows from the fourth
guess. Pricele itself still gives higher/lower plus a warmth tier on every
guess, so bisecting works there too. The score already charges 40 points
per extra guess. Ideas if it comes up again: make the points more prominent
than the X/5, or hide the warmth tier on the first guess.

## Done

- **2026-10-26:** 12 countries added, all with sourced prices and an ILO
  2020+ wage: Austria, Bosnia & Herzegovina, Dominican Republic, Ecuador,
  Finland, Greece, Guatemala, Iceland, Jordan, Moldova, Slovakia, Sri Lanka.
  That takes the game from 49 to 61 countries, rotating from day 94 with a 2.4%
  same-item repeat rate. Petrol now covers all 61 (29 rows filled from
  GlobalPetrolPrices, Romania among them), and those rows join the games on
  2026-10-26 via a per-row `since` date. Pricele's own guess box now uses the
  shared price parser.

- **2026-10-23 (398ae09):** "1,6" read as 16 in Then & Now and Open Range;
  Price Atlas solvable from the compass arrow alone; spirits, vape liquid and
  natural gas retired from all games.
