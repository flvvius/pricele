"use client";

import { useState } from "react";
import {
  buildShareText,
  buildShareTextWithUrl,
  copyToClipboard,
  SHARE_URL,
  type ShareInput,
} from "@/lib/share";

export default function ShareCard(props: ShareInput) {
  const [copied, setCopied] = useState(false);
  const text = buildShareTextWithUrl(props);

  async function onShare() {
    // Prefer the native share sheet on mobile; pass the link as a dedicated URL
    // so it shares as a real link. Fall back to copying the full text.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: buildShareText(props), url: SHARE_URL });
        return;
      } catch {
        /* user dismissed or unsupported — fall through to copy */
      }
    }
    const ok = await copyToClipboard(text);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <pre className="whitespace-pre-wrap rounded-lg border border-neutral-700 bg-neutral-900 p-4 text-center text-sm leading-relaxed">
        {text}
      </pre>
      <button
        onClick={onShare}
        className="rounded-lg bg-green-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-green-900/30 transition hover:bg-green-500 active:scale-[0.99]"
      >
        {copied ? "Copied to clipboard!" : "Share result"}
      </button>
    </div>
  );
}
