"use client";

import { useState } from "react";
import {
  buildShareText,
  buildShareTextWithUrl,
  copyToClipboard,
  SHARE_URL,
  type ShareInput,
} from "@/lib/share";
import { IconCheck, IconShare } from "./Icons";

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
        /* user dismissed or unsupported, so fall through to copy */
      }
    }
    const ok = await copyToClipboard(text);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  }

  return (
    // Slip and button are one object: the button is the bottom edge of the
    // frame, not a second element floating under it.
    <div className="flex flex-col">
      {/* The emoji grid stays. It is the artefact that actually gets pasted
          into a group chat, and it has to survive as plain text. */}
      <pre className="whitespace-pre-wrap border border-rule bg-paper-raised p-4 text-center font-mono text-[13px] leading-relaxed text-ink-body">
        {text}
      </pre>
      <button
        onClick={onShare}
        className="flex items-center justify-center gap-2.5 bg-ink px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
      >
        {copied ? <IconCheck size={14} /> : <IconShare size={14} />}
        {copied ? "Copied" : "Share result"}
      </button>
    </div>
  );
}
