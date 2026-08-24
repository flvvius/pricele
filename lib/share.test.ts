import { describe, it, expect } from "vitest";
import { prefersNativeShare } from "./share";

describe("prefersNativeShare", () => {
  it("uses the share sheet on a phone", () => {
    // Android Chrome: reports itself mobile outright.
    expect(
      prefersNativeShare({
        hasNativeShare: true,
        uaMobile: true,
        coarsePointer: true,
      })
    ).toBe(true);
    // iOS Safari: no userAgentData, but the pointer gives it away.
    expect(
      prefersNativeShare({ hasNativeShare: true, coarsePointer: true })
    ).toBe(true);
  });

  it("copies on a laptop, where the share sheet drops the grid", () => {
    // The reported bug: desktop Chrome has navigator.share and shares only the
    // url, so the player's result never leaves the page.
    expect(
      prefersNativeShare({
        hasNativeShare: true,
        uaMobile: false,
        coarsePointer: false,
      })
    ).toBe(false);
  });

  it("trusts the browser over the pointer on a touchscreen laptop", () => {
    // A Surface has a coarse pointer and a desktop share sheet all the same.
    expect(
      prefersNativeShare({
        hasNativeShare: true,
        uaMobile: false,
        coarsePointer: true,
      })
    ).toBe(false);
  });

  it("copies when there is no share sheet at all", () => {
    expect(
      prefersNativeShare({ hasNativeShare: false, coarsePointer: true })
    ).toBe(false);
    expect(
      prefersNativeShare({
        hasNativeShare: false,
        uaMobile: true,
        coarsePointer: true,
      })
    ).toBe(false);
  });

  it("copies on a desktop browser that reports nothing useful", () => {
    // Safari on macOS: no userAgentData, fine pointer.
    expect(
      prefersNativeShare({ hasNativeShare: true, coarsePointer: false })
    ).toBe(false);
  });
});
