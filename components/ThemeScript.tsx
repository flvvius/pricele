export const THEME_KEY = "pricele:edition";

// Runs before first paint, ahead of React, so a reader who chose the Night
// edition never sees a white flash on the way in. It only ever writes the
// attribute when there is a stored preference — with no attribute the CSS falls
// through to the `prefers-color-scheme` block, so the OS stays in charge by
// default.
const SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY
)});if(t==='paper'||t==='night'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
