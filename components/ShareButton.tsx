"use client";

import { useEffect, useState } from "react";
import { copyToClipboard, shouldUseNativeShare } from "@/lib/share";
import { gameShareUrl, type ShareCampaign, type ShareChannel } from "@/lib/sharelink";
import { trackEvent, type EventName } from "@/lib/analytics";

export default function ShareButton({
  text,
  path,
  campaign,
  event,
  label = "Share result",
  props,
  score,
}: {
  text: (url: string) => string;
  path: string;
  campaign: ShareCampaign;
  event: EventName;
  label?: string;
  props?: Record<string, string | number | boolean>;
  score?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => setNative(shouldUseNativeShare()), []);

  async function share() {
    const url = (channel: ShareChannel) => gameShareUrl(path, channel, campaign, score);
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
    const ok = await copyToClipboard(text(url("copy")));
    setCopied(ok);
    if (ok) {
      trackEvent(event, { channel: "copy", ...props });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={share}
      className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
