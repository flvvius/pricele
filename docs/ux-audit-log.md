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
