import type { FaqItem } from "@/lib/seo";

// Visible, crawlable FAQ. Uses <details> so the answers are in the initial HTML
// (open by default for search engines and assistive tech) while staying compact.
//
// Ruled rows, no boxes. The native marker is removed and replaced with a
// typographic one that rotates on open — the default triangle is a different
// glyph in every browser and none of them match the rest of the page.
export default function FaqSection({
  items,
  heading = "Frequently asked questions",
  id = "faq",
}: {
  items: FaqItem[];
  heading?: string;
  id?: string;
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      // Standing head in a left rail from lg up, plain stack below it.
      className="flex flex-col gap-4 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12"
    >
      <h2 id={`${id}-heading`} className="display text-2xl text-ink">
        {heading}
      </h2>
      {/* Plain div rather than a <dl>: a description list may only contain
          dt/dd (or div groups wrapping them), so <details> children — and a
          <dt> nested inside a <summary> — are invalid markup that assistive
          tech is free to ignore. The FAQ structured data is emitted separately
          by <JsonLd/>, so nothing depends on the list semantics here. */}
      <div className="border-t border-rule">
        {items.map((item, i) => (
          <details key={i} open={i === 0} className="group border-b border-rule-soft">
            <summary className="flex cursor-pointer list-none items-start gap-3 py-3.5 text-[15px] font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
              <span
                aria-hidden
                className="mt-[3px] shrink-0 font-mono text-[11px] text-ink-faint transition-transform duration-fast ease-out group-open:rotate-90"
              >
                &gt;
              </span>
              <span className="flex-1">{item.question}</span>
            </summary>
            <div className="pb-4 pl-[1.4rem] text-[13px] leading-relaxed text-ink-muted">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
