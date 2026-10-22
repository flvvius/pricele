import { segments, type HistoryPoint } from "@/lib/itemhistory";

const W = 480;
const H = 220;
const PAD = { top: 12, right: 60, bottom: 28, left: 52 };

function niceStep(max: number): number {
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
}

export default function PriceLineChart({
  points,
  label,
}: {
  points: HistoryPoint[];
  label: string;
}) {
  const visible = points.filter((p) => !p.hidden);
  if (visible.length < 2) return null;
  const first = points[0].year;
  const last = points[points.length - 1].year;
  const step = niceStep(Math.max(...visible.map((p) => p.price)));
  const top = Math.ceil(Math.max(...visible.map((p) => p.price)) / step) * step;
  const x = (year: number) =>
    PAD.left + ((year - first) / (last - first)) * (W - PAD.left - PAD.right);
  const y = (price: number) => PAD.top + (1 - price / top) * (H - PAD.top - PAD.bottom);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const decades = points.map((p) => p.year).filter((yr) => yr % 10 === 0);
  const end = visible[visible.length - 1];
  const fmt = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${label}, ${first} to ${last}. The table below lists every year.`}
        className="h-auto w-full max-w-[560px]"
      >
        <g className="text-rule-soft">
          {ticks.map((t) => (
            <line
              key={t}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="currentColor"
              strokeWidth={1}
            />
          ))}
        </g>
        <g className="fill-ink-muted font-mono text-[15px]">
          {ticks.map((t) => (
            <text key={t} x={PAD.left - 6} y={y(t) + 4} textAnchor="end">
              {fmt(t)}
            </text>
          ))}
          {decades.map((yr) => (
            <text key={yr} x={x(yr)} y={H - 8} textAnchor="middle">
              {yr}
            </text>
          ))}
        </g>
        <g className="text-accent">
          {segments(points).map((run) => (
            <polyline
              key={run[0].year}
              points={run.map((p) => `${x(p.year)},${y(p.price)}`).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          <circle cx={x(end.year)} cy={y(end.price)} r={4} fill="currentColor" />
        </g>
        <text x={x(end.year) + 8} y={y(end.price) + 4} className="fill-ink font-mono text-[15px]">
          ${end.price.toFixed(2)}
        </text>
        <g>
          {visible.map((p) => (
            <circle key={p.year} cx={x(p.year)} cy={y(p.price)} r={9} fill="transparent">
              <title>{`${p.year}: $${p.price.toFixed(2)}, ${p.minutes.toFixed(1)} min of work`}</title>
            </circle>
          ))}
        </g>
      </svg>
      <figcaption className="text-[13px] text-ink-muted">
        Annual U.S. city average in the dollars of each year. Hover a point for the year.
      </figcaption>
    </figure>
  );
}
