import Link from "next/link";
import type { ArticleBlock } from "@/data/articles";
import { renderInline } from "@/lib/richtext";

/**
 * Renders an article body.
 *
 * Long-form reading has different needs from the reference pages: bigger type,
 * more line height, and a stronger body colour than the muted ink used for
 * short blurbs elsewhere. Body copy sits on `ink-body`, which clears AAA in
 * both editions, and emphasised runs step up to `ink` so the eye catches the
 * numbers that matter without the page turning into a bold soup.
 */
export default function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="flex flex-col gap-10">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

/** Section heading. Sized well above body copy so scanning the page works. */
function Heading({ children }: { children: string }) {
  return (
    <h2 className="display text-[1.75rem] text-ink sm:text-[2rem]">
      {children}
    </h2>
  );
}

function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[15px] leading-[1.75] text-ink-body sm:text-base sm:leading-8">
          {renderInline(p)}
        </p>
      ))}
    </>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.kind) {
    case "prose":
      return (
        <section className="flex flex-col gap-4">
          {block.heading && <Heading>{block.heading}</Heading>}
          <Paragraphs paragraphs={block.paragraphs} />
        </section>
      );

    // Three or four numbers pulled out of the prose at display size. Used once
    // per article at most — the moment every tile is a headline, none of them is.
    case "stats":
      return (
        <section className="flex flex-col gap-4">
          {block.heading && <Heading>{block.heading}</Heading>}
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {block.items.map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 border-t-2 border-ink pt-3"
              >
                <dt className="label order-2 !normal-case !tracking-normal !text-[11px]">
                  {s.label}
                </dt>
                <dd className="display order-1 text-[2rem] tabular-nums text-ink sm:text-[2.5rem]">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      );

    case "list":
      return (
        <section className="flex flex-col gap-4">
          {block.heading && <Heading>{block.heading}</Heading>}
          {block.intro && (
            <p className="text-[15px] leading-[1.75] text-ink-body sm:text-base sm:leading-8">
              {renderInline(block.intro)}
            </p>
          )}
          <ol className="flex flex-col gap-2.5">
            {block.items.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 text-[15px] leading-[1.75] text-ink-body sm:text-base"
              >
                <span
                  aria-hidden
                  className="mt-1 w-5 shrink-0 text-right font-mono text-[11px] tabular-nums text-ink-faint"
                >
                  {block.ordered === false ? "—" : `${i + 1}.`}
                </span>
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ol>
        </section>
      );

    case "table":
      return (
        <section className="flex flex-col gap-4">
          {block.heading && <Heading>{block.heading}</Heading>}
          {block.intro && (
            <p className="text-[15px] leading-[1.75] text-ink-body sm:text-base sm:leading-8">
              {renderInline(block.intro)}
            </p>
          )}
          {/* Scrolls inside its own box so the page body never moves sideways. */}
          <div className="-mx-4 overflow-x-auto px-4">
            <table className="w-full min-w-[26rem] border-collapse text-sm sm:text-[15px]">
              <thead>
                <tr className="border-b-2 border-ink text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink-meta">
                  {block.columns.map((c, i) => (
                    <th
                      key={i}
                      scope="col"
                      className={`py-2.5 font-semibold ${
                        i === 0 ? "pr-3" : "pl-3 text-right"
                      }`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i} className="border-b border-rule-soft">
                    {row.map((cell, j) =>
                      j === 0 ? (
                        <th
                          key={j}
                          scope="row"
                          className="py-3 pr-3 text-left font-medium text-ink-body"
                        >
                          {renderInline(cell)}
                        </th>
                      ) : (
                        <td
                          key={j}
                          className="py-3 pl-3 text-right font-mono tabular-nums text-ink"
                        >
                          {renderInline(cell)}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <p className="text-[11px] leading-relaxed text-ink-meta">
              {renderInline(block.caption)}
            </p>
          )}
        </section>
      );

    case "quote":
      return (
        <figure className="border-l-2 border-accent pl-5">
          <blockquote className="display text-[1.5rem] leading-[1.25] text-ink sm:text-[1.75rem]">
            {renderInline(block.text)}
          </blockquote>
          {block.attribution && (
            <figcaption className="label mt-3">
              {renderInline(block.attribution)}
            </figcaption>
          )}
        </figure>
      );

    // The "read this bit twice" box. Reserved for the paragraph an article would
    // be pointless without.
    case "callout":
      return (
        <aside className="flex flex-col gap-3 border border-rule border-t-2 border-t-ink bg-paper-raised p-5 sm:p-6">
          {block.heading && (
            <h3 className="display text-[1.375rem] text-ink">
              {block.heading}
            </h3>
          )}
          {block.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[15px] leading-[1.75] text-ink-body sm:text-base sm:leading-8"
            >
              {renderInline(p)}
            </p>
          ))}
        </aside>
      );

    case "cta":
      return <ArticleCta block={block} />;
  }
}

/**
 * Closing call to action. Inverted against the page so it reads as the one
 * button on the article rather than another paragraph, and it points at the
 * game itself — every one of these pieces exists to argue that price
 * calibration is a skill, and the game is where you practise it.
 */
function ArticleCta({
  block,
}: {
  block: Extract<ArticleBlock, { kind: "cta" }>;
}) {
  return (
    <aside className="flex flex-col gap-4 bg-ink p-6 text-paper sm:p-7">
      <h2 className="display text-[2rem] sm:text-[2.5rem]">
        {block.heading}
      </h2>
      {block.paragraphs.map((p, i) => (
        <p key={i} className="text-[15px] leading-[1.7] text-paper/70 sm:text-base">
          {p}
        </p>
      ))}
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2.5 bg-paper px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-transform duration-press ease-out active:scale-[0.97]"
      >
        {block.buttonLabel}
        <span aria-hidden>→</span>
      </Link>
    </aside>
  );
}
