import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * The tiny slice of markup article copy is allowed to use.
 *
 * Article bodies are plain strings in data/articles.ts, which keeps them easy to
 * write and diff. Two inline forms are understood and nothing else:
 *
 *   **emphasis**        → a bolded, higher-contrast run
 *   [label](/path)      → a link (internal paths use next/link, http(s) opens out)
 *
 * Deliberately not a markdown parser. Anything more expressive belongs in a
 * block type in data/articles.ts, where it can be styled properly, rather than
 * being smuggled through prose.
 */
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

export function renderInline(text: string): ReactNode {
  const parts = text.split(TOKEN).filter((p) => p.length > 0);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-neutral-50">
          {part.slice(2, -2)}
        </strong>
      );
    }

    const link = LINK.exec(part);
    if (link) {
      const [, label, href] = link;
      const className =
        "font-medium text-neutral-100 underline decoration-neutral-500 underline-offset-4 transition hover:decoration-neutral-100";

      if (href.startsWith("http")) {
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {label}
          </a>
        );
      }
      return (
        <Link key={i} href={href} className={className}>
          {label}
        </Link>
      );
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}
