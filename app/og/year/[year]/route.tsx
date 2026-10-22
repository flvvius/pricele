import { ImageResponse } from "next/og";
import { HISTORY_ITEMS } from "@/data/price-history";
import {
  FIRST_YEAR,
  LATEST_YEAR,
  YEARS,
  basketMinutes,
  liveThenNowPairs,
  visibleRows,
  yearSummary,
} from "@/lib/yearprices";

export const revalidate = 3600;
export const dynamicParams = false;

const PAPER = "#F2EDE1";
const INK = "#1A1613";
const ACCENT = "#C4321C";
const SHOWN = ["eggs", "gasoline", "white-bread", "coffee"];

export function generateStaticParams() {
  return [...YEARS.map((y) => ({ year: String(y) })), { year: "hub" }];
}

export function GET(_req: Request, { params }: { params: { year: string } }) {
  const year = params.year === "hub" ? null : Number(params.year);
  const s = yearSummary(year ?? FIRST_YEAR, liveThenNowPairs());
  const lines = SHOWN.map((id) => visibleRows(s).find((r) => r.item.id === id)).filter(
    (r): r is NonNullable<typeof r> => Boolean(r)
  );
  const basket = basketMinutes(visibleRows(s));
  const title = year ? `Prices in ${year}` : `Prices the year you were born`;
  const footer = year
    ? `A grocery run: ${Math.round(basket.then)} min of work then, ${Math.round(basket.now)} now`
    : `Every year from ${FIRST_YEAR} to ${LATEST_YEAR}, ${HISTORY_ITEMS.length} items`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: PAPER,
        color: INK,
        padding: "48px 80px",
        borderTop: `16px solid ${INK}`,
      }}
    >
      <div style={{ display: "flex", fontSize: 32, letterSpacing: 6 }}>
        PRICELE · BLS AVERAGE PRICES
      </div>
      <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1, marginTop: 12 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 16 }}>
        {lines.map((r) => (
          <div
            key={r.item.id}
            style={{ display: "flex", justifyContent: "space-between", fontSize: 34 }}
          >
            <span>{r.item.name}</span>
            <span>
              {year ? `$${r.then.toFixed(2)} → ` : ""}${r.now.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", fontSize: 36, color: ACCENT }}>{footer}</div>
    </div>,
    { width: 1200, height: 630 }
  );
}
