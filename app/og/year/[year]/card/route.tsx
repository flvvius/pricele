import { ImageResponse } from "next/og";
import {
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
const MUTED = "#5B5249";
const ACCENT = "#C4321C";
const SHOWN = ["eggs", "gasoline", "white-bread", "ground-beef", "bacon", "bananas", "cheddar"];

export function generateStaticParams() {
  return YEARS.map((y) => ({ year: String(y) }));
}

export function GET(_req: Request, { params }: { params: { year: string } }) {
  const year = Number(params.year);
  const s = yearSummary(year, liveThenNowPairs());
  const rows = visibleRows(s);
  const lines = SHOWN.map((id) => rows.find((r) => r.item.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .slice(0, 6);
  const basket = basketMinutes(rows);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PAPER,
        color: INK,
        padding: "72px 80px",
        borderTop: `24px solid ${INK}`,
      }}
    >
      <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: MUTED }}>
        U.S. GROCERY PRICES
      </div>
      <div style={{ display: "flex", fontSize: 120, fontWeight: 700, lineHeight: 1, marginTop: 24 }}>
        Born in {year}
      </div>
      <div style={{ display: "flex", fontSize: 38, color: MUTED, marginTop: 16 }}>
        What a grocery run cost then, and in {s.latestYear}
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 56 }}>
        {lines.map((r) => (
          <div
            key={r.item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontSize: 44,
              padding: "18px 0",
              borderBottom: `2px solid ${INK}22`,
            }}
          >
            <span>{r.item.name}</span>
            <span style={{ display: "flex", gap: 16 }}>
              <span style={{ fontWeight: 700 }}>${r.then.toFixed(2)}</span>
              <span style={{ color: MUTED }}>→ ${r.now.toFixed(2)}</span>
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 12 }}>
        <div style={{ display: "flex", fontSize: 40, color: ACCENT }}>
          {`The basket took ${Math.round(basket.then)} minutes of work then, ${Math.round(basket.now)} now`}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: MUTED }}>
          {`pricele.online/years/${year} · Source: BLS average prices`}
        </div>
      </div>
    </div>,
    { width: 1080, height: 1350 }
  );
}
