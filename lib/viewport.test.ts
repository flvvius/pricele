import { describe, it, expect } from "vitest";
import { keyboardIsOpen, viewportIsCramped } from "./viewport";

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

describe("viewportIsCramped", () => {
  it("is true for the case that started this: iOS keyboard plus AutoFill bar", () => {
    // A 393pt iPhone leaves ~437px of visible page with the keyboard up, and
    // ~359px once the AutoFill pill is attached to it — WebKit takes an input
    // accessory view off the visual viewport along with the keyboard itself.
    expect(viewportIsCramped(359)).toBe(true);
    expect(viewportIsCramped(437)).toBe(true);
  });

  it("is true for a small phone, where the keyboard leaves almost nothing", () => {
    expect(viewportIsCramped(260)).toBe(true);
  });

  it("is true on a landscape phone with no keyboard at all", () => {
    // Height, not the keyboard, is the question being asked.
    expect(viewportIsCramped(390)).toBe(true);
  });

  it("is false on a phone with the keyboard down", () => {
    expect(viewportIsCramped(852)).toBe(false);
    expect(viewportIsCramped(667)).toBe(false);
  });

  it("is false for a zero height, which is a viewport not yet measured", () => {
    expect(viewportIsCramped(0)).toBe(false);
  });
});
