// Plain-text share card, one emoji row per guess.

import { BAND_EMOJI } from "./scoring";
import type { GuessRecord } from "./storage";

export const MAX_GUESSES = 5;

export const SHARE_URL = "https://pricele.online";

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
}

/**
 * Build the shareable text. Kept plain and factual, in the Wordle mold:
 *   Pricele #47 · Lebanon 🇱🇧 · 3/5 (within 4%)
 *   🟨🟨🟩
 *   https://pricele.online
 */
export function buildShareText({
  puzzleNumber,
  countryName,
  flag,
  guesses,
  won,
  bestPctOff,
}: ShareInput): string {
  const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const acc =
    won && bestPctOff !== undefined ? ` (within ${Math.max(bestPctOff, 1)}%)` : "";
  const header = `Pricele #${puzzleNumber} · ${countryName} ${flag} · ${score}${acc}`;
  const grid = guesses.map((g) => BAND_EMOJI[g.band]).join("");
  return [header, grid, SHARE_URL].join("\n");
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
