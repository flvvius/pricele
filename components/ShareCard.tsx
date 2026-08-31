"use client";

import { useEffect, useState } from "react";
import {
  buildShareText,
  buildShareTextWithUrl,
  copyToClipboard,
  shouldUseNativeShare,
  SHARE_URL,
  type ShareInput,
} from "@/lib/share";
import { IconCheck, IconShare } from "./Icons";

export default function ShareCard(props: ShareInput) {
  const [copied, setCopied] = useState(false);
  // Assume the clipboard until the browser says otherwise: the server cannot
  // know, and copying is the right answer everywhere the share sheet is not.
  const [nativeShare, setNativeShare] = useState(false);
  const text = buildShareTextWithUrl(props);

  useEffect(() => setNativeShare(shouldUseNativeShare()), []);

  async function onShare() {
    // The share sheet is a phone thing. On a laptop it keeps the url and throws
    // the grid away, so there the whole card goes to the clipboard instead.
    if (nativeShare) {
      try {
        await navigator.share({ text: buildShareText(props), url: SHARE_URL });
        return;
      } catch (err) {
        // Dismissing the sheet is a decision, not a failure: don't go and copy
        // behind the player's back.
        if (err instanceof DOMException && err.name === "AbortError") return;
        /* anything else, fall through to copy */
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
      <pre className="whitespace-pre-wrap border border-rule bg-paper-raised p-4 text-center font-mono text-[14px] leading-relaxed text-ink-body">
        {text}
      </pre>
      <button
        onClick={onShare}
        className="flex items-center justify-center gap-2.5 bg-ink px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
      >
        {copied ? <IconCheck size={14} /> : <IconShare size={14} />}
        {copied ? "Copied" : nativeShare ? "Share result" : "Copy result"}
      </button>
    </div>
  );
}
