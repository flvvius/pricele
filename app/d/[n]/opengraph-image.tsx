import { ImageResponse } from "next/og";
import { puzzleForShareNumber } from "@/lib/puzzle";
import { itemLabel } from "@/data/items";

// The unfurl for a shared day: "Pricele #214, cappuccino in Japan".
//
// THE PRICE NEVER APPEARS HERE. The image is fetched by every chat app the link
// is pasted into, before anyone has played, so it carries the question and
// nothing that answers it: the item, the country and the number, no more.
//
// Flags are left out on purpose: satori draws emoji by fetching glyphs from a
// CDN at render time, and a build that cannot reach one would ship tofu. The
// country code reads as well at thumbnail size and renders offline.

export const alt = "Today's Pricele puzzle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

const PAPER = "#F2EDE1";
const INK = "#1A1613";
const ACCENT = "#C4321C";

export default function Image({ params }: { params: { n: string } }) {
  const puzzle = puzzleForShareNumber(Number(params.n));
  const number = puzzle?.puzzleNumber;
  const item = puzzle ? itemLabel(puzzle.item) : "Guess the price";
  const country = puzzle?.price.countryName ?? "a new country every day";
  const code = puzzle?.price.countryCode;

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
        <div style={{ display: "flex", fontSize: 40, letterSpacing: 6 }}>
          {number ? `PRICELE #${number}` : "PRICELE"}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>
            {item}
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 64, marginTop: 16 }}>
            {`in ${country}`}
            {code && (
              <div
                style={{
                  display: "flex",
                  marginLeft: 24,
                  fontSize: 32,
                  border: `3px solid ${INK}`,
                  padding: "4px 14px",
                }}
              >
                {code}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 40, color: ACCENT }}>
          What does it cost? Can you beat my score?
        </div>
      </div>
    ),
    size
  );
}
