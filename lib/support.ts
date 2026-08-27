// Reader support, and the page that explains how the site is paid for.
//
// EVERYTHING HERE IS ENV-GATED AND OFF BY DEFAULT.
//   A donate button pointing nowhere is worse than no donate button, so a
//   platform appears only once its handle is set. With none set, /support still
//   renders — it is a funding-transparency page before it is an ask, and that
//   half is worth publishing whether or not anyone can give.
//
// PLATFORM CHOICE IS UNCONSTRAINED HERE, UNLIKE THE SISTER SITE.
//   A price-comparison game is ordinary content, so every platform below will
//   take it, and the choice is about fees and audience rather than survival.
//   The order is still deliberate: GitHub Sponsors and Liberapay take the
//   smallest cut, a Stripe payment link takes no platform cut at all, and Ko-fi
//   and Buy Me a Coffee are the two a non-technical reader recognises. Enable
//   whichever matches who is actually reading. See docs/monetisation.md.
//
//   Worth knowing before copying this file back to the sister site: there the
//   same ordering is a safety requirement rather than a preference, because
//   Ko-fi prohibits adult content "via linked external pages" and enforces it
//   automatically.

export interface SupportLink {
  id: string;
  label: string;
  url: string;
  /** One line on what the reader is choosing, shown under the link. */
  note: string;
}

/** A handle is a plausible platform username, not a URL and not a sentence. */
const HANDLE = /^[A-Za-z0-9._-]{1,39}$/;

function handle(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return t && HANDLE.test(t) ? t : null;
}

/** A payment link must be an https URL, or it is not going in an href. */
function httpsUrl(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  try {
    return new URL(t).protocol === "https:" ? t : null;
  } catch {
    return null;
  }
}

/** Reads from a plain record so tests can pass a partial environment. */
export function supportLinks(
  env: Record<string, string | undefined> = process.env
): SupportLink[] {
  const out: SupportLink[] = [];

  const gh = handle(env.NEXT_PUBLIC_SUPPORT_GITHUB);
  if (gh)
    out.push({
      id: "github",
      label: "GitHub Sponsors",
      url: `https://github.com/sponsors/${gh}`,
      note: "Monthly or one-off. Judged on the code and the dataset, which is the part of this that is genuinely open.",
    });

  const lp = handle(env.NEXT_PUBLIC_SUPPORT_LIBERAPAY);
  if (lp)
    out.push({
      id: "liberapay",
      label: "Liberapay",
      url: `https://liberapay.com/${lp}/`,
      note: "Recurring, run by a non-profit, and takes no cut of its own.",
    });

  const stripe = httpsUrl(env.NEXT_PUBLIC_SUPPORT_STRIPE);
  if (stripe)
    out.push({
      id: "stripe",
      label: "One-off card payment",
      url: stripe,
      note: "Straight to Stripe. No account, no platform in the middle.",
    });

  const kofi = handle(env.NEXT_PUBLIC_SUPPORT_KOFI);
  if (kofi)
    out.push({
      id: "kofi",
      label: "Ko-fi",
      url: `https://ko-fi.com/${kofi}`,
      note: "One-off, no account needed to give.",
    });

  const bmc = handle(env.NEXT_PUBLIC_SUPPORT_BMC);
  if (bmc)
    out.push({
      id: "bmc",
      label: "Buy Me a Coffee",
      url: `https://www.buymeacoffee.com/${bmc}`,
      note: "One-off, no account needed to give.",
    });

  return out;
}

export const SUPPORT_LINKS = supportLinks();
export const supportEnabled = (): boolean => SUPPORT_LINKS.length > 0;
