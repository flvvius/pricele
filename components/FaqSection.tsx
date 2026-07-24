import type { FaqItem } from "@/lib/seo";

// Visible, crawlable FAQ. Uses <details> so the answers are in the initial HTML
// (open by default for search engines and assistive tech) while staying compact.
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
    <section aria-labelledby={`${id}-heading`} className="flex flex-col gap-3">
      <h2 id={`${id}-heading`} className="text-lg font-bold text-neutral-100">
        {heading}
      </h2>
      <dl className="flex flex-col gap-2">
        {items.map((item, i) => (
          <details
            key={i}
            open={i === 0}
            className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3"
          >
            <summary className="cursor-pointer font-semibold text-neutral-200 marker:text-neutral-600">
              <dt className="inline">{item.question}</dt>
            </summary>
            <dd className="mt-2 text-sm text-neutral-400">{item.answer}</dd>
          </details>
        ))}
      </dl>
    </section>
  );
}
