import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

// Server-rendered footer, grouped so every section of the site is reachable in
// one hop from any page. The per-country and per-item pages it links to hide
// whichever price is currently live (see suppressedPairs in lib/catalog.ts), so
// browsing the reference tables can never spoil the day's answer.
const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/prices", label: "Prices by country" },
      { href: "/items", label: "Items" },
      { href: "/archive", label: "Puzzle archive" },
    ],
  },
  {
    title: "Read",
    links: [
      { href: "/blog", label: "Guides" },
      { href: "/methodology", label: "Methodology" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Site",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/", label: "Play today's puzzle" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-col gap-7 pt-10 text-[12px] leading-relaxed text-ink-meta">
      {/* The colophon rule: heavy over hair, the masthead's double rule turned
          upside down to close the page the way it opened. */}
      <div>
        <div className="h-px bg-ink" />
        <div className="mt-[3px] h-[2px] bg-ink" />
      </div>

      <nav aria-label="Site" className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {GROUPS.map((g) => (
          <div key={g.title} className="flex flex-col gap-2.5">
            <h2 className="label">{g.title}</h2>
            <ul className="flex flex-col gap-2">
              {g.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-ink-muted transition-colors duration-fast ease-out hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t border-rule-soft pt-5">
        <p>
          Prices are national averages compiled from public sources and are
          published for general interest, not as shopping or financial advice.
          See{" "}
          <Link
            href="/methodology"
            className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
          >
            methodology
          </Link>{" "}
          for how each figure is produced.
        </p>
        <p>
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
