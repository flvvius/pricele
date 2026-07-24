import Link from "next/link";
import { activePriceEntries } from "@/lib/catalog";
import { countrySlug } from "@/lib/format";

// Server-rendered footer. Its internal links spread crawl equity to the /prices
// reference pages and give every page a consistent set of indexable routes.
export default function SiteFooter() {
  const countries = activePriceEntries();
  return (
    <footer className="mt-auto flex flex-col gap-6 pt-10 text-xs text-neutral-500">
      <nav aria-label="Site" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        <Link href="/" className="hover:text-neutral-300">
          Play today
        </Link>
        <Link href="/prices" className="hover:text-neutral-300">
          Prices by country
        </Link>
      </nav>

      <div>
        <p className="mb-2 text-center text-neutral-400">
          Browse the price in each country
        </p>
        <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {countries.map((c) => (
            <li key={c.countryCode}>
              <Link
                href={`/prices/${countrySlug(c.countryName)}`}
                className="hover:text-neutral-300"
              >
                <span aria-hidden>{c.flag}</span> {c.countryName}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center">
        Prices are rough estimates for a daily game, not shopping advice.
      </p>
    </footer>
  );
}
