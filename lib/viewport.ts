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
