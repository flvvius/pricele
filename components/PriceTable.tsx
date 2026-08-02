import Link from "next/link";
import type { PriceEntry } from "@/lib/puzzle";
import { formatUSD, formatLocal } from "@/lib/format";
import { wageMinutes } from "@/lib/catalog";

/** "about 12 min" / "about 2.4 h" of local wage. Rounded hard — see /methodology. */
export function wageLabel(price: PriceEntry): string {
  const m = wageMinutes(price);
  if (m < 1) return "<1 min";
  if (m < 90) return `${Math.round(m)} min`;
  return `${(m / 60).toFixed(1)} h`;
}

export interface Row {
  key: string;
  /** Left-hand label, e.g. an item name or a country name. */
  label: string;
  /** Emoji flag or icon shown before the label. Optional. */
  icon?: string;
  href?: string;
  price: PriceEntry | null;
  /** When true, the price is hidden because it is a live puzzle answer. */
  hidden?: boolean;
}

/**
 * The one table used by /prices/<country>, /items/<item> and the archive.
 *
 * Rows whose price is currently in play render as a "hidden until tomorrow"
 * placeholder rather than being dropped, so the table still shows that the item
 * exists — dropping the row would make the omission itself a hint.
 *
 * Scrolls horizontally inside its own container on narrow screens so the page
 * body never scrolls sideways.
 */
export default function PriceTable({
  rows,
  labelHeader,
  showLocal = true,
}: {
  rows: Row[];
  labelHeader: string;
  showLocal?: boolean;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <table className="w-full min-w-[30rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-700 text-left text-xs uppercase tracking-wide text-neutral-500">
            <th scope="col" className="py-2 pr-3 font-semibold">
              {labelHeader}
            </th>
            <th scope="col" className="py-2 pr-3 text-right font-semibold">
              USD
            </th>
            {showLocal && (
              <th scope="col" className="py-2 pr-3 text-right font-semibold">
                Local
              </th>
            )}
            <th scope="col" className="py-2 text-right font-semibold">
              Work time
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-neutral-800/70">
              <th scope="row" className="py-2.5 pr-3 text-left font-normal text-neutral-200">
                {r.icon && (
                  <span aria-hidden className="mr-1.5">
                    {r.icon}
                  </span>
                )}
                {r.href ? (
                  <Link href={r.href} className="underline-offset-2 hover:underline">
                    {r.label}
                  </Link>
                ) : (
                  r.label
                )}
              </th>
              {r.hidden || !r.price ? (
                <td
                  colSpan={showLocal ? 3 : 2}
                  className="py-2.5 text-right text-xs italic text-neutral-500"
                >
                  {r.hidden ? "hidden — in play right now" : "no data"}
                </td>
              ) : (
                <>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-100">
                    {formatUSD(r.price.priceUSD)}
                  </td>
                  {showLocal && (
                    <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-400">
                      {formatLocal(r.price)}
                    </td>
                  )}
                  <td className="py-2.5 text-right tabular-nums text-neutral-400">
                    {wageLabel(r.price)}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
