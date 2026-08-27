import { describe, it, expect } from "vitest";
import { supportLinks } from "./support";

// A donate button that 404s costs more trust than it raises money, so the rule
// is that a platform appears only when its handle is well-formed.
describe("supportLinks", () => {
  it("offers nothing when nothing is configured", () => {
    expect(supportLinks({})).toEqual([]);
  });

  it("builds the profile URL from a handle", () => {
    const [link] = supportLinks({ NEXT_PUBLIC_SUPPORT_GITHUB: "someone" });
    expect(link.url).toBe("https://github.com/sponsors/someone");
  });

  it("ignores a handle that is really a URL, or a sentence, or blank", () => {
    const env = {
      NEXT_PUBLIC_SUPPORT_GITHUB: "https://github.com/someone",
      NEXT_PUBLIC_SUPPORT_KOFI: "not a handle",
      NEXT_PUBLIC_SUPPORT_BMC: "   ",
    };
    expect(supportLinks(env)).toEqual([]);
  });

  it("takes a payment link only over https", () => {
    expect(supportLinks({ NEXT_PUBLIC_SUPPORT_STRIPE: "https://buy.stripe.com/x" })).toHaveLength(1);
    expect(supportLinks({ NEXT_PUBLIC_SUPPORT_STRIPE: "http://buy.stripe.com/x" })).toEqual([]);
    expect(supportLinks({ NEXT_PUBLIC_SUPPORT_STRIPE: "javascript:alert(1)" })).toEqual([]);
  });

  it("orders the safer platforms first", () => {
    const env = {
      NEXT_PUBLIC_SUPPORT_KOFI: "a",
      NEXT_PUBLIC_SUPPORT_GITHUB: "b",
      NEXT_PUBLIC_SUPPORT_LIBERAPAY: "c",
    };
    expect(supportLinks(env).map((l) => l.id)).toEqual(["github", "liberapay", "kofi"]);
  });
});
