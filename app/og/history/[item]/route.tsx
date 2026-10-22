import { ImageResponse } from "next/og";
import { HISTORY_ITEMS } from "@/data/price-history";
import {
  extremes,
  historyFor,
  historyItem,
  historyTitle,
  type HistoryPoint,
} from "@/lib/itemhistory";
import { basketSeries } from "@/lib/worktime";
import { liveThenNowPairs } from "@/lib/yearprices";

export const revalidate = 3600;
export const dynamicParams = false;

const PAPER = "#F2EDE1";
const INK = "#1A1613";
const ACCENT = "#C4321C";
const CW = 1040;
const CH = 260;

export function generateStaticParams() {
  return [...HISTORY_ITEMS.map((i) => ({ item: i.id })), { item: "work-time" }];
}

function sparkline(points: HistoryPoint[]): string {
  const v = points.filter((p) => !p.hidden);
  const hi = Math.max(...v.map((p) => p.price));
  const lo = Math.min(...v.map((p) => p.price));
  const first = v[0].year;
  const last = v[v.length - 1].year;
  return v
    .map((p) => {
      const x = ((p.year - first) / (last - first)) * CW;
      const y = CH - 10 - ((p.price - lo) / (hi - lo || 1)) * (CH - 20);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function GET(_req: Request, { params }: { params: { item: string } }) {
  const work = params.item === "work-time";
  const item = work ? null : historyItem(params.item);
  const points = work ? basketSeries() : historyFor(item!, liveThenNowPairs());
  const e = extremes(points);
  const title = work ? "Groceries in work time" : `${historyTitle(item!)} by year`;
  const fmt = (n: number) => (work ? `${Math.round(n)} min` : `$${n.toFixed(2)}`);

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
      <div style={{ display: "flex", fontSize: 30, letterSpacing: 6 }}>
        PRICELE · BLS {work ? "PRICES AND WAGES" : "AVERAGE PRICES"}
      </div>
      <div style={{ display: "flex", fontSize: 80, fontWeight: 700, lineHeight: 1 }}>{title}</div>
      <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`}>
        <polyline
          points={sparkline(points)}
          fill="none"
          stroke={ACCENT}
          strokeWidth={6}
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 40 }}>
        <span>
          {e.first.year}: {fmt(e.first.price)}
        </span>
        <span style={{ color: ACCENT }}>
          {e.last.year}: {fmt(e.last.price)}
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
