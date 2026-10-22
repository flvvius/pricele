import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DayRedirect from "@/components/DayRedirect";
import { puzzleForShareNumber, puzzleNumber } from "@/lib/puzzle";
import { itemLabel, lowerName } from "@/data/items";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

// A shared day: /d/214. The page a Receipt links to.
//
// It exists for one reason, the link preview. The opengraph-image beside it
// draws that day's item and country, and this page forwards the visitor to the
// game. The canonical is the home page, so the search index never sees a page
// per day, and the price appears nowhere: not in the title, not in the
// description, not in the image.

export const revalidate = 3600;

/** The last week is pre-rendered; older and newer days render on demand. */
export function generateStaticParams() {
  const today = puzzleNumber();
  return Array.from({ length: 7 }, (_, i) => today - i)
    .filter((n) => n >= 1)
    .map((n) => ({ n: String(n) }));
}

export function generateMetadata({ params }: { params: { n: string } }): Metadata {
  const puzzle = puzzleForShareNumber(Number(params.n));
  if (!puzzle) return {};
  const { item, price, puzzleNumber: n } = puzzle;
  const title = `Pricele #${n} — ${itemLabel(item)} in ${price.countryName}`;
  const description = `What does ${lowerName(itemLabel(item))} cost in ${price.countryName}? Five guesses. Can you beat my score?`;
  const base = pageMetadata({ path: "/", title, description, index: false });
  // og:url is this page, not the canonical: Facebook re-fetches whatever og:url
  // names and would otherwise unfurl the home page's generic card. Images are
  // left to the opengraph-image file convention.
  // The image is declared here rather than left to the file convention, which
  // loses to any openGraph object a page declares (and pageMetadata always does).
  const image = {
    url: absoluteUrl(`/d/${n}/opengraph-image`),
    type: "image/png",
    width: 1200,
    height: 630,
    alt: `Pricele #${n}: ${itemLabel(item)} in ${price.countryName}`,
  };
  return {
    ...base,
    openGraph: { ...base.openGraph, url: absoluteUrl(`/d/${n}`), images: [image] },
    twitter: { ...base.twitter, images: [image.url] },
  };
}

export default function SharedDayPage({ params }: { params: { n: string } }) {
  const puzzle = puzzleForShareNumber(Number(params.n));
  if (!puzzle) notFound();
  return (
    <main className="mx-auto flex max-w-md flex-col gap-3 px-4 py-16 text-center">
      <DayRedirect />
      <p className="label">Pricele #{puzzle.puzzleNumber}</p>
      <Link href="/" className="display text-2xl text-ink underline underline-offset-4">
        Play today&apos;s puzzle
      </Link>
    </main>
  );
}
