import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// Asserted against the source rather than a render, because what matters is
// that the rel is not reachable by a caller at all. A rendering test would pass
// just as happily on a component that let a prop overwrite it.
const SRC = readFileSync(new URL("./AffiliateLink.tsx", import.meta.url), "utf8");

describe("AffiliateLink", () => {
  it("hard-codes the rel Google asks for on a paid link", () => {
    expect(SRC).toContain('rel="sponsored nofollow noopener noreferrer"');
  });

  it("does not accept a rel prop that could weaken it", () => {
    expect(SRC).not.toMatch(/rel[?]?:\s*string/);
  });

  it("renders the disclosure as visible text, not an attribute", () => {
    // The FTC wants the disclosure next to the link. A title= or aria-label
    // would satisfy a linter and not a regulator.
    expect(SRC).toContain("{disclosure}");
    expect(SRC).not.toMatch(/title=\{disclosure\}/);
  });
});
