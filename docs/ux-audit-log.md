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
