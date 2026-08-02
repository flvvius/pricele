import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

// Server-rendered nav for the reference pages. The game screen deliberately has
// no nav — it owns the full viewport — so this only appears on content pages,
// where it gives readers (and crawlers) a path between every section.
const LINKS = [
  { href: "/prices", label: "Prices" },
  { href: "/items", label: "Items" },
  { href: "/archive", label: "Archive" },
  { href: "/blog", label: "Guides" },
  { href: "/methodology", label: "Methodology" },
];

export default function SiteHeader() {
  return (
    <header className="flex flex-col gap-3 border-b border-neutral-800 pb-4">
      <Link
        href="/"
        className="text-lg font-black tracking-tight text-neutral-100 hover:text-white"
      >
        {SITE_NAME}
      </Link>
      <nav aria-label="Sections" className="-mx-1 overflow-x-auto">
        <ul className="flex items-center gap-1 text-sm whitespace-nowrap">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-md px-2 py-1 text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/"
              className="rounded-md bg-neutral-100 px-2.5 py-1 font-semibold text-neutral-900 transition hover:bg-white"
            >
              Play
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
