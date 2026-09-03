import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";
import ThemeToggle from "./ThemeToggle";

// Server-rendered nav for the reference pages. The game screen deliberately has
// no nav, since it owns the full viewport, so this only appears on content pages,
// where it gives readers (and crawlers) a path between every section.
const LINKS = [
  { href: "/prices", label: "Prices" },
  { href: "/items", label: "Items" },
  { href: "/archive", label: "Archive" },
  // The two unlimited modes and the classroom. High in the run because they
  // are the only links here a reader might follow to keep playing or to bring
  // thirty other people, rather than to read.
  { href: "/higher-or-lower", label: "Higher or lower" },
  { href: "/where-in-the-world", label: "Where in the world" },
  { href: "/classroom", label: "Classroom" },
  { href: "/blog", label: "Guides" },
  { href: "/methodology", label: "Methodology" },
  // Last in the run on purpose. The strip already overflows on a phone (see the
  // note below), and of the seven links this is the one a returning player is
  // least likely to be reaching for.
  { href: "/daily-games", label: "Similar games" },
];

export default function SiteHeader() {
  return (
    // The same masthead the game uses, so a reader arriving on a country page
    // from search lands on something recognisably the same paper.
    <header className="flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="display text-masthead text-ink transition-colors duration-fast ease-out hover:text-accent"
        >
          {SITE_NAME}
        </Link>
        <ThemeToggle />
      </div>

      <div className="mt-2 h-[2px] bg-ink" />
      <div className="mt-[3px] h-px bg-ink" />

      <nav aria-label="Sections" className="-mx-4 mt-2.5 overflow-x-auto px-4">
        <ul className="flex items-center gap-5 whitespace-nowrap">
          {/* Play leads the run rather than trailing it. This strip scrolls
              horizontally on a phone, and the six items do not fit. Anything
              pushed to the right sits permanently past the clip edge, which is
              the worst possible place for the one link that returns you to the
              game. */}
          <li>
            <Link
              href="/"
              className="inline-block bg-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.97]"
            >
              Play
            </Link>
          </li>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted transition-colors duration-fast ease-out hover:text-ink"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
