"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/share";
import { trackEvent } from "@/lib/analytics";

export default function EmbedCode({ code, item }: { code: string; item: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (await copyToClipboard(code)) {
      setCopied(true);
      trackEvent("embed_copy", { item });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <pre className="overflow-x-auto whitespace-pre-wrap break-all border border-rule bg-paper-raised p-3 font-mono text-[12px] text-ink">
        {code}
      </pre>
      <button
        onClick={copy}
        className="self-start border border-ink px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-transform duration-press ease-out active:scale-[0.97]"
      >
        {copied ? "Copied" : "Copy embed code"}
      </button>
    </div>
  );
}
