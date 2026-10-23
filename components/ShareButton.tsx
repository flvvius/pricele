"use client";

import { useEffect, useState } from "react";
import { copyToClipboard, shouldUseNativeShare } from "@/lib/share";
import { gameShareUrl, type ShareChannel } from "@/lib/sharelink";
import { trackEvent, type EventName } from "@/lib/analytics";

export default function ShareButton({
  text,
  path,
  event,
  label = "Share result",
  props,
  score,
}: {
  text: (url: string) => string;
  path: string;
  event: EventName;
  label?: string;
  props?: Record<string, string | number | boolean>;
  score?: string;
}) {
  const [copied, setCopied] = useState(false);
  // The text to copy by hand when no clipboard route worked. The button used
  // to just sit there: no "Copied", no error, no result in the player's chat.
  const [manual, setManual] = useState<string | null>(null);
  const [native, setNative] = useState(false);

  useEffect(() => setNative(shouldUseNativeShare()), []);

  async function share() {
    const url = (channel: ShareChannel) => gameShareUrl(path, channel, score);
    if (native) {
      try {
        const full = text(url("native"));
        const link = url("native");
        await navigator.share({ text: full.replace(link, "").trimEnd(), url: link });
        trackEvent(event, { channel: "native", ...props });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    const full = text(url("copy"));
    const ok = await copyToClipboard(full);
    setCopied(ok);
    setManual(ok ? null : full);
    if (ok) {
      trackEvent(event, { channel: "copy", ...props });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      <button
        onClick={share}
        className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
      >
        {copied ? "Copied" : label}
      </button>
      {manual && (
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-muted">
          This browser wouldn&apos;t let us copy. Select the text and copy it yourself:
          <textarea
            readOnly
            value={manual}
            rows={manual.split("\n").length + 1}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full resize-none break-all border border-rule bg-paper-raised p-3 font-mono text-[16px] leading-snug text-ink"
          />
        </label>
      )}
    </>
  );
}
