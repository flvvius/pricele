import type { Comparison, Edge } from "@/data/comparisons";
import { tally } from "@/data/comparisons";
import { formatArchiveDate } from "@/lib/format";
import { SITE_NAME } from "@/lib/seo";

/**
 * The matched-dimensions table, one row per thing the two games can be
 * compared on.
 *
 * Three columns rather than two, because a comparison with no adjudication is
 * a specification sheet and makes the reader do the work. The third column
 * names which game the row favours, and it says the other game's name often
 * enough that a reader can see the page is not simply a list of our own
 * features. That is the argument for its existence: a table that never
 * concedes a row is not read as a comparison, it is read as an advert, by
 * people and by anything summarising the page.
 *
 * A row whose competitor side was never verified renders as "not stated" and
 * shows no verdict, since we cannot adjudicate a dimension we did not check.
 *
 * Scrolls horizontally inside its own container on narrow screens, so the page
 * body never scrolls sideways.
 */
export default function ComparisonTable({
  comparison,
}: {
  comparison: Comparison;
}) {
  const counts = tally(comparison);

  /** The name that wins a row, or "Level" where neither does. */
  const label = (edge: Edge) =>
    edge === "ours"
      ? SITE_NAME
      : edge === "theirs"
        ? comparison.opponent
        : "Level";

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[38rem] border-collapse text-sm">
          <caption className="sr-only">
            {SITE_NAME} compared with {comparison.opponent}, dimension by
            dimension.
          </caption>
          <thead>
            <tr className="border-b-2 border-ink text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink-meta">
              <th scope="col" className="w-[9rem] py-2 pr-3 font-semibold">
                Dimension
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                {SITE_NAME}
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                {comparison.opponent}
              </th>
              <th scope="col" className="w-[6rem] py-2 font-semibold">
                Edge
              </th>
            </tr>
          </thead>
            {comparison.facts.map((fact) => (
              // Each dimension is a group of one or two rows: the values, and
              // where there is one, the note explaining the verdict. The note
              // spans the full width rather than sitting in a cell, because it
              // is about the comparison and not about either side of it —
              // tucked into the opponent's cell it read as a caveat on their
              // answer, which in the rows conceding a point is the opposite of
              // what it says.
              <tbody
                key={fact.dimension}
                className="border-b border-rule-soft align-top"
              >
                <tr>
                  <th
                    scope="row"
                    rowSpan={fact.note ? 2 : 1}
                    className="py-3 pr-3 text-left text-[13px] font-semibold text-ink-strong"
                  >
                    {fact.dimension}
                  </th>
                  <td className="py-3 pr-3 text-[13px] leading-relaxed text-ink-body">
                    {fact.ours}
                  </td>
                  <td className="py-3 pr-3 text-[13px] leading-relaxed text-ink-body">
                    {fact.theirs ?? (
                      <span className="text-ink-faint">Not stated</span>
                    )}
                  </td>
                  <td className="py-3 font-mono text-[10px] uppercase tracking-[0.14em]">
                    {fact.theirs === null ? (
                      <span className="text-ink-faint">&mdash;</span>
                    ) : (
                      <span
                        className={
                          fact.edge === "even"
                            ? "text-ink-meta"
                            : "text-ink-strong"
                        }
                      >
                        {label(fact.edge)}
                      </span>
                    )}
                  </td>
                </tr>
                {fact.note && (
                  <tr>
                    <td
                      colSpan={3}
                      className="pb-3 pr-3 text-[12px] leading-relaxed text-ink-meta"
                    >
                      {fact.note}
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
        </table>
      </div>

      {/* The tally is computed from the rows, so it cannot drift away from the
          table above it the way a written-in score would. */}
      <p className="text-[12px] leading-relaxed text-ink-meta">
        Of {counts.ours + counts.theirs + counts.even} verified dimensions,{" "}
        {counts.ours} favour {SITE_NAME}, {counts.theirs} favour{" "}
        {comparison.opponent}, and {counts.even} are level. Checked against the
        live game on{" "}
        {/* Formatted by hand, like every other date on the site, so the
            statically rendered HTML does not depend on the build machine's
            locale. */}
        <time dateTime={comparison.checked}>
          {formatArchiveDate(comparison.checked)}
        </time>
        . {comparison.sourceNote}
      </p>
    </div>
  );
}
