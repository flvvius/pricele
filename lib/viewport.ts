// The keyboard is considered open when the visible area is meaningfully shorter
// than the layout viewport. iOS Safari's collapsing toolbar moves innerHeight by
// a few dozen pixels, so the threshold sits well above that.
export const KEYBOARD_MIN_PX = 120;

/**
 * Whether an on-screen keyboard is covering the page.
 *
 * On iOS the layout viewport keeps its full height while the visible (visual)
 * viewport shrinks, so the gap between them is the keyboard. On Android with
 * interactive-widget=resizes-content both shrink together, the gap stays ~0, and
 * this correctly reports false because nothing needs correcting there.
 */
export function keyboardIsOpen(
  layoutHeight: number,
  visibleHeight: number
): boolean {
  return layoutHeight - visibleHeight > KEYBOARD_MIN_PX;
}

/**
 * The visible height below which the game can no longer seat its fixed chrome
 * and a readable board at the same time.
 *
 * The masthead, the lot bar, the streak band, the clue, the input and the
 * guesses-left line come to roughly 375px on a phone, and every one of them is
 * fixed height. The board is the only thing in the column that flexes, so every
 * pixel the visible viewport loses is taken out of the board and out of nothing
 * else. Under about 420px the board is thinner than a single ledger row and the
 * player is typing with no record of what they have already bid.
 *
 * iOS is what puts that within reach. The keyboard alone leaves a large phone
 * around 440px. Attach the AutoFill bar to it — the floating pill of password,
 * card and address buttons — and WebKit takes that off the visual viewport too,
 * because in UIKit an input accessory view is part of the keyboard's own frame.
 * That is another ~80px, and all of it lands on the board: the reported symptom
 * is the guesses vanishing the moment those buttons appear.
 *
 * The line sits at two rows rather than one so the chrome gives way before the
 * board becomes unreadable rather than after. Trimming early costs a wordmark
 * nobody is looking at while they type; trimming late costs them the game.
 */
export const CRAMPED_MAX_PX = 480;

/**
 * Whether the visible viewport is too short for the game's full furniture.
 *
 * Deliberately a question about height alone, not about the keyboard: a phone
 * turned landscape is just as cramped with no keyboard up at all, and it wants
 * exactly the same treatment.
 */
export function viewportIsCramped(visibleHeight: number): boolean {
  return visibleHeight > 0 && visibleHeight < CRAMPED_MAX_PX;
}
