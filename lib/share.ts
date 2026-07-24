// Plain-text share card, one emoji row per guess.

import { BAND_EMOJI } from "./scoring";
import type { GuessRecord } from "./storage";

export const MAX_GUESSES = 5;

export interface ShareInput {
  puzzleNumber: number;
  itemName: string;
  countryName: string;
  flag: string;
  guesses: GuessRecord[];
  won: boolean;
}

/**
 * Build the shareable text, e.g.:
 *   Pricele #47 - Coca-Cola in Lebanon 🇱🇧 - 3/5
 *   🟨⬛
 *   ⬛🟨
 *   🟩
 */
export function buildShareText({
  puzzleNumber,
  itemName,
  countryName,
  flag,
  guesses,
  won,
}: ShareInput): string {
  const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const header = `Pricele #${puzzleNumber} - ${itemName} in ${countryName} ${flag} - ${score}`;
  const grid = guesses.map((g) => BAND_EMOJI[g.band]).join("\n");
  return `${header}\n${grid}\nplay: https://pricele.vercel.app`;
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
