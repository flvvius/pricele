// The Receipt: the share card, formatted as a till slip.
//
// A grid of squares is Wordle's, and every daily game that copies it looks like
// a game that copied Wordle. Pricele is about what things cost, so the artefact
// it produces should be the thing you get when you buy something. A receipt is
// instantly recognisable at thumbnail size in a group chat, it survives being
// plain text, and it gives the numbers somewhere to sit that a bare grid does
// not: bids, best, score, verdict and streak all read as line items.
//
// WHAT THE RECEIPT MUST NEVER CONTAIN: a guess, or the price.
//
// That is the whole reason Wordle's grid worked, and it is the easiest thing in
// the world to lose while making a receipt look convincing. A slip that printed
// "3  $3.10  🟩" would tell every reader the answer to within a few per cent.
// So the line items carry a warmth block and a direction arrow and nothing else,
// and the only figures on the card are ones about the player: how many bids they
// used, how far off they finished, what they scored. None of those can be worked
// backwards into a price without already knowing what was guessed.

import { tierFromCloseness } from "./scoring";
import { personaFor } from "./verdict";
import type { GuessRecord } from "./storage";

export const MAX_GUESSES = 5;

export const SHARE_URL = "https://pricele.online";

/**
 * Warmth tier to block, coldest first, indexed by `WarmthTier.level` (0..4).
 * The green win block is handled separately.
 *
 * Costcodle grades its feedback rather than showing pass or fail, and the reason
 * that reads better is that a row of three identical black squares tells the
 * reader nothing about how the round went. A ramp tells the story.
 */
const TIER_BLOCK = ["⬛", "🟦", "🟨", "🟧", "🟥"];

const WIN_BLOCK = "🟩";

/**
 * The arrow points at where the real price was, matching the wording on the
 * board: a bid that came in under earns an up arrow, because the price was
 * higher. Getting this backwards is the easiest way to make the card actively
 * misleading, so the tests assert it.
 */
const ARROW: Record<GuessRecord["direction"], string> = {
  too_low: "⬆",
  too_high: "⬇",
  exact: "",
};

export interface ShareInput {
  puzzleNumber: number;
  itemName: string;
  countryName: string;
  flag: string;
  guesses: GuessRecord[];
  won: boolean;
  streak?: number;
  /** How far the player's closest guess landed, in % of the real price. */
  bestPctOff?: number;
  /** The round score out of 1000. */
  score?: number;
  /** The day's real price. Needed to work out the verdict, never printed. */
  actualUSD?: number;
}

/** One line item per bid: a warmth block, and an arrow when it missed. */
export function buildLineItems(guesses: GuessRecord[]): string {
  return guesses
    .map((g) => {
      if (g.band === "green") return WIN_BLOCK;
      const tier = tierFromCloseness(g.closeness);
      return `${TIER_BLOCK[tier.level] ?? TIER_BLOCK[0]}${ARROW[g.direction]}`;
    })
    .join(" ");
}

/** The rule between sections of the slip. */
const RULE = "──────────────";

/**
 * Build the shareable text (without the URL; callers append SHARE_URL, or pass
 * it as the dedicated `url` field of the native share sheet).
 *
 *   🧾 PRICELE #214
 *   CAPPUCCINO · JAPAN 🇯🇵
 *   ──────────────
 *   🟥⬇ 🟧⬆ 🟩
 *   ──────────────
 *   BIDS 3/5 · BEST 4% · SCORE 870
 *   "The Tourist" · 🔥12
 */
export function buildShareText({
  puzzleNumber,
  itemName,
  countryName,
  flag,
  guesses,
  won,
  streak,
  bestPctOff,
  score,
  actualUSD,
}: ShareInput): string {
  const bids = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;

  // The totals line, built from whichever figures the caller had. An archive
  // replay has no score to quote and simply prints a shorter line rather than a
  // line with a hole in it.
  const totals = [`BIDS ${bids}`];
  if (bestPctOff !== undefined) {
    // Never "BEST 0%": the figure is rounded, and claiming an exact hit the
    // rounding cannot stand behind is the one number on this card that would be
    // a lie.
    totals.push(`BEST ${Math.max(bestPctOff, 1)}%`);
  }
  if (score !== undefined) totals.push(`SCORE ${score}`);

  const lines = [
    `🧾 PRICELE #${puzzleNumber}`,
    `${itemName.toUpperCase()} · ${countryName.toUpperCase()} ${flag}`,
    RULE,
    buildLineItems(guesses),
    RULE,
    totals.join(" · "),
  ];

  // The verdict needs the price to read the pattern against. A caller without
  // one ships the slip as it would have been before verdicts existed, rather
  // than a broken version of the new one.
  if (actualUSD !== undefined && guesses.length > 0) {
    const { title } = personaFor(guesses, actualUSD, won);
    const fire = streak && streak > 1 ? ` · 🔥${streak}` : "";
    lines.push(`"${title}"${fire}`);
  }

  return lines.join("\n");
}

/** The full share text including the https:// link (for clipboard/display). */
export function buildShareTextWithUrl(input: ShareInput): string {
  return `${buildShareText(input)}\n${SHARE_URL}`;
}

/** Copy text to the clipboard, with a legacy fallback. Returns success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** What the native-share decision needs to know about the current browser. */
export interface ShareEnv {
  /** Whether navigator.share exists at all. */
  hasNativeShare: boolean;
  /** navigator.userAgentData.mobile, where the browser reports it. */
  uaMobile?: boolean;
  /** Whether the primary pointer is coarse — a finger rather than a mouse. */
  coarsePointer: boolean;
}

/**
 * Whether to hand the result to the OS share sheet instead of the clipboard.
 *
 * Desktop share sheets (the Windows flyout, macOS) keep the `url` of a share
 * payload and drop the `text` sitting beside it, so a player on a laptop got
 * the bare link and none of their grid. Phone share targets paste both, which
 * is the only place the sheet earns its keep — everywhere else copies the full
 * text, link included.
 */
export function prefersNativeShare({
  hasNativeShare,
  uaMobile,
  coarsePointer,
}: ShareEnv): boolean {
  if (!hasNativeShare) return false;
  // Chromium answers this directly, and it is right about touchscreen laptops
  // where the pointer test is not.
  if (typeof uaMobile === "boolean") return uaMobile;
  return coarsePointer;
}

/** Read the native-share decision off the browser this is running in. */
export function shouldUseNativeShare(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }
  const uaData = (
    navigator as Navigator & { userAgentData?: { mobile?: boolean } }
  ).userAgentData;
  return prefersNativeShare({
    hasNativeShare: typeof navigator.share === "function",
    uaMobile: typeof uaData?.mobile === "boolean" ? uaData.mobile : undefined,
    coarsePointer: window.matchMedia?.("(pointer: coarse)").matches ?? false,
  });
}
