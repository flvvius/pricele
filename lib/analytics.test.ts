import { describe, expect, it, vi } from "vitest";

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(() => {
    throw new Error("blocked");
  }),
}));

import { detectLanding, stripLandingTags, trackEvent } from "./analytics";

describe("trackEvent", () => {
  it("never throws, with or without a window", () => {
    expect(() => trackEvent("share", { channel: "copy" })).not.toThrow();
    vi.stubGlobal("window", {});
    expect(() => trackEvent("share", { channel: "copy" })).not.toThrow();
    vi.unstubAllGlobals();
  });
});

describe("detectLanding", () => {
  it("spots the short share tag and takes the campaign from the path", () => {
    expect(detectLanding("?s=c&c=X/6", "/games/price-atlas")).toEqual({
      source: "share",
      medium: "copy",
      campaign: "game-price-atlas",
      challenge: true,
    });
    expect(detectLanding("?s=n")).toMatchObject({ medium: "native", campaign: "daily" });
    expect(detectLanding("?s=zzz")).toBeNull();
  });
  it("still spots the utm tags on older links", () => {
    expect(detectLanding("?utm_source=share&utm_medium=native&utm_campaign=daily")).toEqual({
      source: "share",
      medium: "native",
      campaign: "daily",
      challenge: false,
    });
  });
  it("spots a bare challenge and dickle referrals", () => {
    expect(detectLanding("?c=214-3-870")).toMatchObject({ source: "challenge", challenge: true });
    expect(detectLanding("?utm_source=dickle")?.source).toBe("dickle");
  });
  it("ignores everything else", () => {
    expect(detectLanding("")).toBeNull();
    expect(detectLanding("?utm_source=google")).toBeNull();
  });
});

describe("stripLandingTags", () => {
  it("drops share and utm tags but keeps the challenge and hash", () => {
    expect(stripLandingTags("https://x.test/games/price-atlas?s=c&c=X/6")).toBe(
      "/games/price-atlas?c=X/6"
    );
    expect(
      stripLandingTags(
        "https://x.test/?utm_source=share&utm_medium=copy&utm_campaign=daily&c=214-3-870"
      )
    ).toBe("/?c=214-3-870");
    expect(
      stripLandingTags("https://x.test/week?utm_source=share&utm_campaign=weekly#abc")
    ).toBe("/week#abc");
  });
});
