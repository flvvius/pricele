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

/**
 * `compact` drops the receipt preview and leaves only the button.
 *
 * The reveal shows this from its first frame, before the verdict card has been
 * turned over, and the slip quotes the verdict. Printing it at the top would
 * give away the one beat the staged reveal exists to hold back, so early on the
 * player gets the action without the spoiler and the receipt itself appears once
 * there is nothing left to spoil.
 */
export default function ShareCard({
  compact = false,
  ...props
}: ShareInput & { compact?: boolean }) {
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
      {/* The receipt stays plain text. It is the artefact that actually gets
          pasted into a group chat, and it has to survive being one. */}
      {!compact && (
        <pre className="whitespace-pre-wrap border border-rule bg-paper-raised p-4 text-center font-mono text-[14px] leading-relaxed text-ink-body">
          {text}
        </pre>
      )}
      <button
        onClick={onShare}
        // `border border-ink` is invisible against the ink fill and is there for
        // geometry alone: Continue above it is outlined, and without a border of
        // its own this button came out 2px shorter than the one it sits under.
        className="flex w-full items-center justify-center gap-2.5 border border-ink bg-ink px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
      >
        {copied ? <IconCheck size={14} /> : <IconShare size={14} />}
        {copied ? "Copied" : nativeShare ? "Share result" : "Copy result"}
      </button>
    </div>
  );
}
