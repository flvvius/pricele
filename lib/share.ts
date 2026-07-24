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
 * Build the shareable text — designed to bait a reply, not just report a score.
 * Leads with the country + a proximity brag/tease and ends on a dare:
 *   Pricele #47 🥤 Coca-Cola in Lebanon 🇱🇧
 *   🎯 Cracked it in 3/5 — within 4% of the real price
 *   🟨🟨🟩
 *   🔥 5-day streak
 *   Bet you can't beat me 👉 https://pricele.online
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
}: ShareInput): string {
  const header = `Pricele #${puzzleNumber} 🥤 ${itemName} in ${countryName} ${flag}`;

  const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const off = bestPctOff ?? 0;
  const result = won
    ? off <= 3
      ? `🎯 Cracked it in ${score} — within ${off}% of the real price`
      : `✅ Guessed it in ${score} — within ${off}% of the real price`
    : `💀 Missed in ${score} — closest was ${off}% off. Can you do better?`;

  const grid = guesses.map((g) => BAND_EMOJI[g.band]).join("");

  const lines = [header, result, grid];
  if (won && streak && streak > 1) lines.push(`🔥 ${streak}-day streak`);
  lines.push(`Bet you can't beat me 👉 ${SHARE_URL}`);
  return lines.join("\n");
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
