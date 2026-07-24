"use client";

import { useState } from "react";
import { buildShareText, copyToClipboard, type ShareInput } from "@/lib/share";

export default function ShareCard(props: ShareInput) {
  const [copied, setCopied] = useState(false);
  const text = buildShareText(props);

  async function onShare() {
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
        className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-500"
      >
        {copied ? "Copied!" : "Share result"}
      </button>
    </div>
  );
}
