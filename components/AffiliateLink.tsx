import type { ReactNode } from "react";

/**
 * An outbound link that pays the site if someone buys through it.
 *
 * WHY THIS IS A COMPONENT AND NOT A CONVENTION.
 *   Both halves of an affiliate link are legal requirements and both are easy
 *   to forget on the fifth one. Google requires a qualified `rel` on links
 *   carrying a commercial relationship, and the FTC requires the disclosure to
 *   sit with the link rather than in a policy page a reader will never open.
 *   Writing an <a> by hand gets one of those right on a good day. Going through
 *   this component makes both structural: `rel="sponsored nofollow noopener
 *   noreferrer"` is not overridable, and a disclosure is rendered next to the
 *   link whether or not the caller remembers.
 *
 * NOTHING USES THIS YET, AND THE OPPORTUNITY HERE IS REAL BUT NARROW.
 *   A game about what things cost sits next to genuinely relevant products —
 *   currency transfer, travel cards, eSIMs — and those are honest links a
 *   reader might actually want. What it must never become is a price page that
 *   quietly ranks by commission: the whole claim of this site is that the
 *   numbers come from a published source and nothing else moves them.
 *
 *   It exists so that the day a legitimate one appears — a book, a measuring
 *   device a urologist would recognise, a testing service — it is compliant
 *   from the first link rather than the fifth.
 */
export default function AffiliateLink({
  href,
  children,
  disclosure = "paid link",
}: {
  href: string;
  children: ReactNode;
  /** Short label shown beside the link. Kept visible, never a tooltip. */
  disclosure?: string;
}) {
  return (
    <>
      <a
        href={href}
        target="_blank"
        // Not overridable by a caller, on purpose. "sponsored" is the value
        // Google asks for on a paid link; nofollow is belt and braces for
        // crawlers that never learned it.
        rel="sponsored nofollow noopener noreferrer"
        className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
      >
        {children}
      </a>
      <span className="ml-1 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        ({disclosure})
      </span>
    </>
  );
}
