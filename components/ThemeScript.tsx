export const THEME_KEY = "pricele:edition";

/**
 * Browser-chrome colour per edition, the `--paper` value of each, since that is
 * what the status bar sits flush against. Shared with the `viewport` export in
 * app/layout.tsx so the two can never drift apart.
 */
export const EDITION_THEME_COLOR = {
  paper: "#F2EDE1",
  night: "#12100D",
} as const;

/**
 * Points every `<meta name="theme-color">` at one edition.
 *
 * The tags layout.tsx renders are media-gated (`prefers-color-scheme`), which is
 * correct only while the OS is in charge. Once a reader picks an edition by
 * hand, the matching media query can be the wrong one. A light OS with the
 * Night edition selected left a bright status bar above a dark page. Writing the
 * same colour into both tags makes whichever one matches give the right answer.
 */
export function applyThemeColor(edition: keyof typeof EDITION_THEME_COLOR) {
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((m) => {
      m.content = EDITION_THEME_COLOR[edition];
    });
}

// Runs before first paint, ahead of React, so a reader who chose the Night
// edition never sees a white flash on the way in. It only ever writes the
// attribute when there is a stored preference. With no attribute the CSS falls
// through to the `prefers-color-scheme` block, so the OS stays in charge by
// default. The theme-color pass is deferred to DOMContentLoaded because this
// script runs above the meta tags Next emits, so they do not exist yet.
const SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY
)});if(t!=='paper'&&t!=='night')return;document.documentElement.setAttribute('data-theme',t);var c=${JSON.stringify(
  EDITION_THEME_COLOR
)}[t];var f=function(){document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.content=c})};if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',f)}else{f()}}catch(e){}})()`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
