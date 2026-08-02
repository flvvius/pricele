import Link from "next/link";
import type { ArticleBlock } from "@/data/articles";
import { renderInline } from "@/lib/richtext";

/**
 * Renders an article body.
 *
 * Long-form reading has different needs from the reference pages: bigger type,
 * more line height, and a lighter body colour than the neutral-400 used for
 * short blurbs elsewhere. neutral-300 on the #171717 background clears WCAG AAA
 * for body text, and the emphasised runs at neutral-50 sit above it so the eye
 * catches the numbers that matter without the page turning into a bold soup.
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
    <h2 className="text-xl font-bold leading-snug tracking-tight text-neutral-50 sm:text-2xl">
      {children}
    </h2>
  );
}

function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[15px] leading-7 text-neutral-300 sm:text-base sm:leading-8">
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
                className="flex flex-col gap-1 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
              >
                <dt className="order-2 text-xs leading-snug text-neutral-400">
                  {s.label}
                </dt>
                <dd className="order-1 text-2xl font-black tracking-tight text-neutral-50 tabular-nums sm:text-3xl">
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
            <p className="text-[15px] leading-7 text-neutral-300 sm:text-base sm:leading-8">
              {renderInline(block.intro)}
            </p>
          )}
          <ol className="flex flex-col gap-2.5">
            {block.items.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 text-[15px] leading-7 text-neutral-300 sm:text-base"
              >
                <span
                  aria-hidden
                  className="mt-0.5 w-5 shrink-0 text-right text-sm font-bold tabular-nums text-neutral-500"
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
            <p className="text-[15px] leading-7 text-neutral-300 sm:text-base sm:leading-8">
              {renderInline(block.intro)}
            </p>
          )}
          {/* Scrolls inside its own box so the page body never moves sideways. */}
          <div className="-mx-4 overflow-x-auto px-4">
            <table className="w-full min-w-[26rem] border-collapse text-sm sm:text-[15px]">
              <thead>
                <tr className="border-b border-neutral-700 text-left text-xs uppercase tracking-wide text-neutral-400">
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
                  <tr key={i} className="border-b border-neutral-800/70">
                    {row.map((cell, j) =>
                      j === 0 ? (
                        <th
                          key={j}
                          scope="row"
                          className="py-3 pr-3 text-left font-medium text-neutral-200"
                        >
                          {renderInline(cell)}
                        </th>
                      ) : (
                        <td
                          key={j}
                          className="py-3 pl-3 text-right tabular-nums text-neutral-100"
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
            <p className="text-xs leading-relaxed text-neutral-500">
              {renderInline(block.caption)}
            </p>
          )}
        </section>
      );

    case "quote":
      return (
        <figure className="border-l-2 border-neutral-600 pl-5">
          <blockquote className="text-lg font-medium leading-8 text-neutral-100 sm:text-xl sm:leading-9">
            {renderInline(block.text)}
          </blockquote>
          {block.attribution && (
            <figcaption className="mt-2.5 text-sm text-neutral-400">
              {renderInline(block.attribution)}
            </figcaption>
          )}
        </figure>
      );

    // The "read this bit twice" box. Reserved for the paragraph an article would
    // be pointless without.
    case "callout":
      return (
        <aside className="flex flex-col gap-3 rounded-2xl border border-neutral-700 bg-neutral-900 p-5 sm:p-6">
          {block.heading && (
            <h3 className="text-base font-bold text-neutral-50 sm:text-lg">
              {block.heading}
            </h3>
          )}
          {block.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[15px] leading-7 text-neutral-200 sm:text-base sm:leading-8"
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
    <aside className="flex flex-col gap-4 rounded-2xl border border-neutral-700 bg-neutral-100 p-6 text-neutral-900 sm:p-7">
      <h2 className="text-xl font-black leading-tight tracking-tight sm:text-2xl">
        {block.heading}
      </h2>
      {block.paragraphs.map((p, i) => (
        <p key={i} className="text-[15px] leading-7 text-neutral-700 sm:text-base">
          {p}
        </p>
      ))}
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-bold text-neutral-50 transition hover:bg-neutral-800 sm:text-base"
      >
        {block.buttonLabel}
        <span aria-hidden>→</span>
      </Link>
    </aside>
  );
}
