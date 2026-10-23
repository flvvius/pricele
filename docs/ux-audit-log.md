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
