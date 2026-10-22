import { ImageResponse } from "next/og";
import { GAMES, gameBySlug } from "@/lib/games";

export const dynamic = "force-static";
export const dynamicParams = false;

const PAPER = "#F2EDE1";
const INK = "#1A1613";
const ACCENT = "#C4321C";

export function generateStaticParams() {
  return [...GAMES.map((g) => ({ slug: g.slug })), { slug: "hub" }];
}

export function GET(_req: Request, { params }: { params: { slug: string } }) {
  const game = gameBySlug(params.slug);
  const name = game?.name ?? "Daily games about real prices";
  const blurb = game?.blurb ?? GAMES.map((g) => g.name).join(" · ");
  const kicker = game ? `PRICELE · ${game.source.toUpperCase()}` : `${GAMES.length} FREE DAILY GAMES`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          padding: "64px 80px",
          borderTop: `16px solid ${INK}`,
        }}
      >
        <div style={{ display: "flex", fontSize: 36, letterSpacing: 6 }}>{kicker}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, lineHeight: 1.05 }}>
            {name}
          </div>
          <div style={{ display: "flex", fontSize: 48, marginTop: 20, lineHeight: 1.25 }}>{blurb}</div>
        </div>
        <div style={{ display: "flex", fontSize: 40, color: ACCENT }}>
          {game ? "New every day. Can you beat my score?" : "One streak across all of them."}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
