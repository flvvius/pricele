// Ad configuration. The publisher id defaults to the site's AdSense account and
// can be overridden per-deploy via env. Individual ad *units* only render once
// their slot id is supplied, so there are never empty placeholder boxes.
//
//   NEXT_PUBLIC_ADSENSE_CLIENT        ca-pub-XXXXXXXXXXXXXXXX (defaults below)
//   NEXT_PUBLIC_ADSENSE_SLOT_REVEAL   numeric slot id for the post-game unit

const DEFAULT_CLIENT = "ca-pub-5192535313530723";

export const ADSENSE_CLIENT = (
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || DEFAULT_CLIENT
).trim();

export const ADSENSE_LOADER_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

export const AD_SLOTS = {
  // Shown on the Reveal screen once a puzzle is finished, never during play.
  reveal: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_REVEAL ?? "").trim(),
} as const;

// The loader script, the google-adsense-account meta, and ads.txt are active
// whenever the client id is well-formed (true by default). A blank/malformed
// override turns everything off and the build is byte-for-byte ad-free.
export function adsEnabled(): boolean {
  return /^ca-pub-\d{10,}$/.test(ADSENSE_CLIENT);
}
