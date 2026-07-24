import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

// Server-rendered footer. Deliberately does not link out to any per-country
// price listing — those were removed so players can't look up the day's answer.
// The nav links give crawlers (and AdSense's reviewer) a clear path to the
// About, Privacy, and Contact pages, which are expected for an ad-supported site.
export default function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-col gap-3 pt-10 text-xs text-neutral-500">
      <nav
        aria-label="Site"
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
      >
        <Link href="/" className="hover:text-neutral-300">
          Home
        </Link>
        <Link href="/about" className="hover:text-neutral-300">
          About
        </Link>
        <Link href="/privacy" className="hover:text-neutral-300">
          Privacy
        </Link>
        <Link href="/contact" className="hover:text-neutral-300">
          Contact
        </Link>
      </nav>
      <p className="text-center">
        Prices are rough estimates for a daily game, not shopping advice.
      </p>
      <p className="text-center">
        © {new Date().getFullYear()} {SITE_NAME}
      </p>
    </footer>
  );
}
