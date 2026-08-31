import Link from "next/link";
import { AUTHOR } from "@/lib/author";

/**
 * The block that appears under every published guide.
 *
 * Its job is to answer "who wrote this and why should I believe them" without
 * the reader having to go looking, which is the question both a search quality
 * rater and an ad reviewer are asking when they sample an article page. A
 * byline at the top and nothing else leaves it half-answered.
 */
export default function AuthorCard() {
  return (
    <aside className="flex max-w-prose flex-col gap-3 border-t border-rule pt-5">
      <p className="label">About the author</p>
      <p className="text-[16px] leading-[1.7] text-ink-body">
        <strong className="font-semibold text-ink-strong">{AUTHOR.name}</strong>{" "}
        <span className="text-ink-meta">— {AUTHOR.role}</span>
      </p>
      {AUTHOR.bio.map((line) => (
        <p key={line.slice(0, 32)} className="text-[16px] leading-[1.7] text-ink-body">
          {line}
        </p>
      ))}
      <p className="text-base text-ink-meta">
        <a
          href={`mailto:${AUTHOR.email}`}
          className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
        >
          {AUTHOR.email}
        </a>
        {AUTHOR.links.map((l) => (
          <span key={l.url}>
            {" · "}
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer me"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              {l.label}
            </a>
          </span>
        ))}
        {" · "}
        <Link
          href="/editorial"
          className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
        >
          Editorial policy
        </Link>
      </p>
    </aside>
  );
}

/**
 * The one-line credit under an article's standfirst.
 *
 * `updated` is only printed when it differs from `published`. Showing "updated"
 * on a piece that has never been revised is the small lie that makes every other
 * date on the site worth less.
 */
export function Byline({
  published,
  updated,
  readingMinutes,
  format,
}: {
  published: string;
  updated?: string;
  readingMinutes: number;
  /** Date formatter, passed in so this component stays free of site imports. */
  format: (iso: string) => string;
}) {
  return (
    <p className="text-sm font-medium uppercase tracking-wide text-ink-meta">
      By{" "}
      <Link
        href="/about#author"
        className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
      >
        {AUTHOR.name}
      </Link>{" "}
      · {format(published)}
      {updated && updated !== published ? ` · Updated ${format(updated)}` : ""} ·{" "}
      {readingMinutes} min read
    </p>
  );
}
