# Mobile UX audit log

A round-by-round log of a mobile-first pass over the site, played in a real
browser (Chromium with iPhone 13, a 320×568 phone and a 360×640 Android
viewport, light and dark). Each round names what was checked, what was found,
what was fixed and what was left on purpose.

Baseline sweep before round 1: every route type from the sitemap at 390px and
320px. No horizontal scroll anywhere, no console errors or hydration warnings.
The only inputs under 16px (which iOS zooms into on focus) were on
/classroom; see round 6.

## Round 1: Pricele (/), the main game

Checked: first visit (how-to sheet, Escape to close), five guesses with comma
and dot decimals, the reveal, reload after finishing, the stats and archive
sheets (close button, body scroll restored), replaying a back number, at 390px
light and 320px dark. Focus stays in the field after each guess and the page
does not scroll away.

Found and fixed:

- An exact guess showed "Spot on. You nailed the exact price." above a stat
  plate reading "1% best bid": the plate floored the percentage at 1. It now
  reads "Exact" when the best bid rounds to 0% off.
- A back number opened from the archive sheet lived only in React state, so a
  reload (or iOS dropping the tab in the background) put the player back on
  today's edition. The edition is now kept in the address bar as `?d=`, the
  parameter every other game already uses, and read back on load.
- /games/archive listed every game for each past day except Pricele itself,
  since it couldn't take `?d=`. It is linked there now.

Left: the share text still says "BEST 1%" for an exact bid; it is a compact
summary line, not a contradiction on screen, and its format is pinned by the
share tests.

## Round 2: Price Atlas (/games/price-atlas)

Checked: a full game at 390px light and 320px dark, typing countries,
tapping the match buttons, Enter to guess, the finish, plus a simulated
on-screen keyboard (viewport cut to 430px tall after focusing the field).

Found and fixed:

- The matches render under the field, and the field sits at the bottom of the
  first screen, so with the keyboard up the Germany button for "ger" was
  hidden behind the keyboard. A small hook (`components/useKeepInView.ts`)
  now scrolls the form just far enough to clear the visual viewport's bottom
  edge as matches appear, without ever pushing the field off the top.
- Tapping a match blurred the field, so the keyboard closed after every guess
  and the next country meant tapping the field again. The match buttons no
  longer take focus.
- "usa", "us", "uk", "england", "uae", "holland", "Türkiye" and so on matched
  nothing, which left Guess disabled with no hint why. Common short names
  and accents now match (tests in `lib/priceatlas.test.ts`).
- iOS autocorrect could rewrite a half-typed country; it is off on the field,
  and the return key reads "go".
- Finishing opened the whole basket above the guesses, which pushed the result
  a dozen rows down and left the player looking at prices with no sign the
  round had ended. The result is now scrolled up to about a third of the
  screen, with the last guesses still in view.

## Round 3: Open Range (/games/open-range)

Checked: all five questions at 320px and 390px, typing comma decimals,
the keyboard's return key in each field, the verdict, the final score.

Found and fixed:

- Return on the low field submitted a half-filled form, which did nothing, so
  the player had to reach up and tap the high field. It now moves to the high
  field (and the key reads "next"; on the high field it reads "done").
- After a keyboard submit the final total, which takes focus so a screen
  reader announces it, was drawn with the red accent focus ring and read as an
  error box. Focus targets with tabindex="-1" (Open Range, Price Year,
  Pricele 1000 totals) no longer draw the ring: nothing there can be
  activated.

Left: the "1,6 reads as $1.60" echo was already in place from the earlier
fix and checked out.

## Round 4: Then & Now (/games/then-and-now)

Checked: a full game at 320px dark and 390px light, comma and dot decimals,
tapping Guess versus pressing return, an empty submit, the finish.

Found and fixed:

- Tapping Guess moved focus to the button, which closes the phone keyboard
  after every guess; the next guess meant tapping the field again. The button
  no longer takes focus (same fix for Price Atlas's Guess button).
- An empty guess was silently ignored. Guess is now disabled until the field
  holds a price above zero, like the other games' submit buttons.
- The field had no `autocomplete="off"`, so browsers could offer autofill
  suggestions over a price field; the return key now reads "go".

Left: the main Pricele input (`components/GuessInput.tsx`) has the same
blur-on-tap behaviour, but that file belongs to the parallel data/backlog
work (its comma parser is on the backlog), so it is left alone.

## Round 5: Inflation Ladder and Rent Ratio

Checked: both games played to the end at 320px light and dark, moving rungs
with the arrow buttons, a wrong first try, picking every Rent Ratio round.

Found and fixed (Inflation Ladder):

- The right/wrong marks from the last try vanished on the very first move, so
  after one swap the player had to remember which rungs had been right. A rung
  now keeps its mark for as long as it stays where it was judged.
- The move buttons were 40px; they are 44px now.

Found and fixed (Rent Ratio):

- On a phone the round list sits below both answer buttons, off the bottom of
  the screen, so a pick just swapped in the next pair with no sign of whether
  it had been right. The verdict on the round just played (with both rents)
  now shows inside the matchup card.
- The final score and share button came after five rounds of rents and HUD
  citations, a full screen of scrolling after finishing. They come first now.
- Each round row set both areas side by side in mono, so at 320px two long
  names broke mid-name against each other ("St. / Louis, MO" opposite
  "Riverside-San / Bernardino, CA"). One area per line now, with the one the
  player picked in bold.

## Round 6: Price Year, Pricele 1000, Higher or Lower Daily, /classroom

Checked: all three played to the end at 320px, light and dark; the sliders,
the nudge buttons, the reviews between rounds, the final lists. Plus the
/classroom inputs the baseline sweep flagged.

Found and fixed:

- The year and price sliders were 16px tall, the browser default, so a thumb
  missing by a few pixels scrolled the page instead. They are 32px now (the
  track looks the same; the hit area grows).
- Price Year and Pricele 1000 set each final row as two columns, item names
  beside "You 2004 · Real 2020"; at 320px the names got a third of the width
  and wrapped to five lines a row. The rows stack now. The year links in
  Price Year get a taller hit area.
- Higher or Lower Daily: the result of each call was the last row of a list
  that grows downward under the buttons, so it was never on screen. The
  verdict on the call just made now sits above the cards ("Right. Coca-Cola
  in Portugal is $1.21, lower than $1.83."). When finished, the header said
  "Call 9 of 9" instead of a final score, and the score and share button came
  after all nine rows; both fixed.
- /classroom: the room name, code and label inputs were 15px, which makes
  iOS Safari zoom the page on focus. They are 16px. The room code field also
  stops autocorrect and capitalises as you type.

## Round 7: the side games and the work-time chart

Checked: /higher-or-lower (unlimited), /where-in-the-world and /work-time at
320px, light and dark.

Found and fixed:

- Higher or Lower: on a 568px-tall phone the two cards fill the bottom of the
  first screen, so after a tap the verdict and the Next pair button rendered
  below the fold; it looked as if the tap had only revealed two prices. They
  are now scrolled into view ("nearest", so nothing moves where they fit).
- Where in the World: each miss replaced the previous clue, so by the third
  guess the wage and the item count the player had been reasoning from were
  gone. All clues so far now stay, numbered.
- Where in the World: new clues land above a wall of 50-odd country buttons
  the player has scrolled into, so they appeared off the top of the screen.
  The newest clue (and the verdict at the end) is scrolled into view.
- Where in the World: the country buttons were about 30px tall, packed 6px
  apart; a thumb hit the neighbour often enough. They are about 43px now.
- /work-time: the caption said "Hover a point for the year", and the chart's
  per-year values live in SVG titles that only a mouse can hover, so on a
  phone no year but the last was readable (the chart's own aria-label also
  promised a table that wasn't on the page). An "Every year" disclosure now
  lists them.
