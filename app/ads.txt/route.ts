import { ADSENSE_CLIENT, adsEnabled } from "@/lib/ads";

// AdSense authorizes a domain to sell its inventory via an ads.txt file at the
// site root. It's generated from the publisher ID so it stays in sync, and
// stays empty when ads are disabled. The "pub-…" id is the client id without
// the leading "ca-".
export const dynamic = "force-static";

export function GET() {
  const body = adsEnabled()
    ? `google.com, ${ADSENSE_CLIENT.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`
    : "";

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
