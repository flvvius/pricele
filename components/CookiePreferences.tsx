"use client";

import { useEffect, useState } from "react";

/**
 * "Cookie preferences" — reopens the ad consent message.
 *
 * WHY THIS IS NOT A COOKIE BANNER.
 *   Serving personalised ads to readers in the EEA, the UK or Switzerland
 *   requires a consent management platform that Google has certified against the
 *   IAB TCF. A banner written by hand here would not be one, and shipping our
 *   own on top of Google's would ask the same reader for the same consent twice
 *   while only one of the two answers actually reaches the ad stack.
 *
 *   So the message itself is Google's, enabled under Privacy & messaging in the
 *   AdSense account and delivered by the same adsbygoogle loader the site
 *   already includes. What was missing is the other half of the requirement: a
 *   consent choice has to be revocable, which means a permanent, findable
 *   control that reopens the message. That is this button, and it is why it
 *   lives in the footer of every page.
 *
 * WHY IT HIDES ITSELF.
 *   `googlefc` only exists once a message is configured and the reader is in a
 *   region that gets one. Rendering a dead "cookie preferences" link to everyone
 *   else is worse than rendering nothing: it is a promise the page cannot keep.
 *   So the button starts absent, and appears only once the API is really there.
 */
export default function CookiePreferences() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    // The funding-choices script loads asynchronously and independently of us,
    // so a single check on mount races it. Poll briefly, then give up: if it is
    // not there within a few seconds it is not coming, because either no message
    // is configured or this reader is outside the regions that receive one.
    let tries = 0;
    const id = window.setInterval(() => {
      const fc = (window as unknown as { googlefc?: unknown }).googlefc;
      if (fc) {
        setAvailable(true);
        window.clearInterval(id);
      } else if (++tries > 20) {
        window.clearInterval(id);
      }
    }, 250);

    return () => window.clearInterval(id);
  }, []);

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const fc = (
          window as unknown as {
            googlefc?: {
              callbackQueue?: {
                push: (cb: Record<string, () => void>) => void;
              };
              showRevocationMessage?: () => void;
            };
          }
        ).googlefc;
        if (!fc) return;

        // The documented entry point is a named callback pushed onto the queue,
        // which fires as soon as the revocation message is ready. Calling
        // showRevocationMessage() directly works only if it has already loaded,
        // so it is the fallback rather than the first choice.
        if (fc.callbackQueue?.push) {
          fc.callbackQueue.push({
            CONSENT_API_READY: () => fc.showRevocationMessage?.(),
          });
        } else {
          fc.showRevocationMessage?.();
        }
      }}
      className="text-left text-ink-muted underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
    >
      Cookie preferences
    </button>
  );
}
