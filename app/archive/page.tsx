import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { publishedArchiveDates } from "@/lib/catalog";
import { getPuzzleForISO } from "@/lib/puzzle";
import { itemLabel } from "@/data/items";
import { formatUSD, formatArchiveDate } from "@/lib/format";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  path: "/archive",
  title: "Puzzle archive",
  description:
    "Every past Pricele puzzle with its answer: which item, which country, and what it actually cost. Replay any day without affecting your streak.",
});

export default function ArchiveIndex() {
  const dates = publishedArchiveDates();
  const entries = dates
    .map((iso) => ({ iso, puzzle: getPuzzleForISO(iso) }))
    .filter((e): e is { iso: string; puzzle: NonNullable<typeof e.puzzle> } =>
      e.puzzle !== null
    );

  return (
    <ContentPage
      title="Puzzle archive"
      intro={
        <>
          <p>
            Every Pricele puzzle that has already been played, newest first, with
            the answer. Each entry has its own page explaining the price and how
            that country compares.
          </p>
          <p>
            Puzzles from the last two days aren&apos;t listed here, because the game
            rolls over at each player&apos;s local midnight, and these pages are
            shared by everyone, so recent answers stay in the game only. You can
            still replay them from the archive button inside the game.
          </p>
        </>
      }
    >
      {entries.length === 0 ? (
        <Prose>
          <p>
            No puzzles have finished yet. Come back in a couple of days, and{" "}
            <Link
              href="/"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              play today&apos;s
            </Link>{" "}
            in the meantime.
          </p>
        </Prose>
      ) : (
        <Section heading={`${entries.length} past puzzles`}>
          <ul className="border-t border-rule">
            {entries.map(({ iso, puzzle }) => (
              <li key={iso}>
                <Link
                  href={`/archive/${iso}`}
                  className="flex items-center gap-3 border-b border-rule-soft px-1 py-2.5 transition-[background-color,color] duration-fast ease-out hover:bg-paper-raised"
                >
                  <span aria-hidden className="text-xl">
                    {puzzle.price.flag}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-medium text-ink-strong">
                      {itemLabel(puzzle.item)} in {puzzle.price.countryName}
                    </span>
                    <span className="block text-sm text-ink-meta">
                      #{puzzle.puzzleNumber} · {formatArchiveDate(iso)}
                    </span>
                  </span>
                  <span className="shrink-0 text-base tabular-nums text-ink-body">
                    {formatUSD(puzzle.price.priceUSD)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Archive", path: "/archive" }]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Pricele puzzle archive",
            url: absoluteUrl("/archive"),
            description: metadata.description,
            hasPart: entries.slice(0, 100).map(({ iso, puzzle }) => ({
              "@type": "WebPage",
              name: `Pricele #${puzzle.puzzleNumber} — ${itemLabel(puzzle.item)} in ${puzzle.price.countryName}`,
              url: absoluteUrl(`/archive/${iso}`),
            })),
          },
        ]}
      />
    </ContentPage>
  );
}
