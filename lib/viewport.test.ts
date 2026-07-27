import { describe, it, expect } from "vitest";
import { keyboardIsOpen } from "./viewport";

describe("keyboardIsOpen", () => {
  it("detects the iOS case: layout viewport stays tall, visible area shrinks", () => {
    // iPhone 12: 844pt tall, keyboard takes roughly half.
    expect(keyboardIsOpen(844, 420)).toBe(true);
    expect(keyboardIsOpen(667, 340)).toBe(true);
  });

  it("stays false on Android, where both viewports shrink together", () => {
    // interactive-widget=resizes-content means the gap never opens up.
    expect(keyboardIsOpen(420, 420)).toBe(false);
    expect(keyboardIsOpen(380, 380)).toBe(false);
  });

  it("ignores small differences like a collapsing browser toolbar", () => {
    expect(keyboardIsOpen(844, 800)).toBe(false);
    expect(keyboardIsOpen(844, 750)).toBe(false);
  });

  it("is false when nothing is covering the page", () => {
    expect(keyboardIsOpen(844, 844)).toBe(false);
  });
});
