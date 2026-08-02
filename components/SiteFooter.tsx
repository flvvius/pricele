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
    <footer className="mt-auto flex flex-col gap-6 border-t border-neutral-800 pt-8 text-xs text-neutral-500">
      <nav aria-label="Site" className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {GROUPS.map((g) => (
          <div key={g.title} className="flex flex-col gap-2">
            <h2 className="font-semibold uppercase tracking-wide text-neutral-400">
              {g.title}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {g.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="hover:text-neutral-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-1.5 border-t border-neutral-800 pt-4">
        <p>
          Prices are national averages compiled from public sources and are
          published for general interest, not as shopping or financial advice.
          See{" "}
          <Link href="/methodology" className="underline hover:text-neutral-300">
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
