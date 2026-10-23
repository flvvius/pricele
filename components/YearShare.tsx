"use client";

import { useState } from "react";
import ShareButton from "./ShareButton";
import { trackEvent } from "@/lib/analytics";

async function shareImage(year: number): Promise<"shared" | "saved" | "failed"> {
  try {
    const res = await fetch(`/og/year/${year}/card`);
    if (!res.ok) return "failed";
    const blob = await res.blob();
    const file = new File([blob], `born-in-${year}-prices.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return "shared";
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return "failed";
      }
    }
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    return "saved";
  } catch {
    return "failed";
  }
}

export default function YearShare({ year, lines }: { year: number; lines: string[] }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function onImage() {
    setBusy(true);
    const outcome = await shareImage(year);
    setBusy(false);
    if (outcome === "failed") return;
    trackEvent("years_share", { year, channel: outcome === "shared" ? "image" : "download" });
    if (outcome === "saved") setNote("Image saved. Post it to your story.");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ShareButton
        text={(url) => [...lines, url].join("\n")}
        path={`/years/${year}`}
        event="years_share"
        label={`Share ${year} prices`}
        props={{ year }}
      />
      <button
        onClick={onImage}
        disabled={busy}
        className="border border-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-ink transition-transform duration-press ease-out active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "Making image…" : "Save as image"}
      </button>
      {note && <p className="w-full text-[14px] text-ink-muted">{note}</p>}
    </div>
  );
}
