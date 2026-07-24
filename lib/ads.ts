// Ad configuration. Everything is driven by environment variables so the site
// renders completely ad-free until a real AdSense publisher ID is supplied —
// no placeholder boxes in development, previews, or before launch.
//
// Set these to go live (see README):
//   NEXT_PUBLIC_ADSENSE_CLIENT          ca-pub-XXXXXXXXXXXXXXXX
//   NEXT_PUBLIC_ADSENSE_SLOT_REVEAL     numeric slot id for the post-game unit
//   NEXT_PUBLIC_ADSENSE_SLOT_CONTENT    numeric slot id for the /prices pages

export const ADSENSE_CLIENT = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "").trim();

export const AD_SLOTS = {
  // Shown on the Reveal screen once a puzzle is finished — never during play.
  reveal: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_REVEAL ?? "").trim(),
  // Shown in the /prices reference pages (high commercial intent, high CPM).
  content: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT ?? "").trim(),
} as const;

// Ads are only ever enabled with a well-formed publisher ID. A blank or
// malformed value means "no ads", so the loader script and every unit are
// skipped and the layout is identical to the ad-free build.
export function adsEnabled(): boolean {
  return /^ca-pub-\d{10,}$/.test(ADSENSE_CLIENT);
}
