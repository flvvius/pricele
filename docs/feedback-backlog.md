# Player feedback backlog

What players reported that is still open. Move an entry to "Done" with the
commit when it ships.

## Open

### More countries (reported 2026-10-23, Price Atlas)

"Nu sunt așa multe țări." The games run on 49 countries, and in Price Atlas
that is the whole answer pool, so regulars will start recognising baskets.

Why it isn't a quick fix: every country needs sourced data, not estimates.
The checklist is in the `CountryMeta` comment in `data/countries.ts`:

- a row in the country table, plus `COUNTRY_TAX` and a written
  `COUNTRY_NOTES` entry (not generated: see the indexing note in that file)
- an ILO average hourly wage, converted to USD
- name-map entries in `scripts/refresh-open-prices.ts` and
  `scripts/refresh-big-mac.ts`, then run both scripts
- a capital in `data/capitals.ts`, or Price Atlas skips the country
- a new country era in `data/rotation.ts` (read the stability rule first).
  The country count must stay coprime with the item count (13 right now), so
  the total can't be a multiple of 13.

Good candidates are countries the 49-coverage sources already publish (diesel
and electricity from GlobalPetrolPrices, cigarettes from WHO, mobile data from
Cable.co.uk, healthy diet from the World Bank) **and** that the Big Mac Index
covers, so each one has at least five or six items rather than falling back to
the same item every day.

### More approachable items

Spirits, vape liquid and natural gas were retired from the games on
2026-10-26. Other items could get the same complaint:
`electricity-100kwh` (who knows a 100 kWh price?), `healthy-diet-day`
(an abstract World Bank basket) and `diesel-1l`. Retiring more shrinks the
rotation, so the real fix is **adding** everyday items with wide sourced
coverage (bread, rice, a taxi ride, a cinema ticket, rent?). Adding items
doesn't touch past days if it's done as a new era in `data/rotation.ts`.

Many countries have only the five "global" items, because the Numbeo grocery
rows (milk, eggs, apples, cappuccino, petrol) cover 32 of 49 countries.
Filling those gaps would also make Pricele less repetitive in sparse
countries.

### Guessing by direction alone in the main Pricele game

The Price Atlas half of this is fixed: the arrow now shows from the fourth
guess. Pricele itself still gives higher/lower plus a warmth tier on every
guess, so bisecting works there too. The score already charges 40 points
per extra guess. Ideas if it comes up again: make the points more prominent
than the X/5, or hide the warmth tier on the first guess.

### Comma handling in the main Pricele input

`components/GuessInput.tsx` has its own `sanitize`, which treats the first
separator as the decimal point, so "1,600" there reads as 1.60. Then & Now
and Open Range now use `lib/priceinput.ts`, which reads "1,600" as 1600.
It's harmless at Pricele's price levels, but the three inputs should share
one parser.

## Done

- **2026-10-23 (398ae09):** "1,6" read as 16 in Then & Now and Open Range;
  Price Atlas solvable from the compass arrow alone; spirits, vape liquid and
  natural gas retired from all games.
