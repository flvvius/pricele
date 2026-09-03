import { describe, it, expect } from "vitest";
import { COMPARISONS, getComparison, tally } from "@/data/comparisons";
import { PRICE_GAMES } from "@/data/similar-games";
import { SITE_NAME } from "./seo";

// These are not tests of behaviour so much as tests of editorial rules. The
// comparison pages are only worth having if a reader believes them, and the
// things that make them believable — a competitor named as better at
// something, an unverified dimension marked as unverified, a date somebody
// actually checked — are exactly the things that quietly rot when a file like
// this is edited in a hurry. See the header of data/comparisons.ts.

describe("comparison data", () => {
  it("has a comparison for every price game we list", () => {
    // /daily-games names our direct competitors. Naming one there and having
    // no comparison for it is the gap this catches: the list page sends a
    // reader looking for the head-to-head that does not exist.
    // Siblings are exempt. The rule is about competitors — a reader sent
    // looking for a head-to-head that does not exist — and the game published
    // by the same person is not one. A "which of my own two games wins" page
    // would adjudicate nothing; the list entry says outright that they share
    // an author and a rule, which is the honest version of that comparison.
    const missing = PRICE_GAMES.filter(
      (game) => !game.sibling && !COMPARISONS.some((c) => c.opponentUrl === game.url)
    ).map((g) => g.name);
    expect(missing).toEqual([]);
  });

  it("points every comparison at a game we actually recommend", () => {
    // The reverse: a comparison against a game that has been dropped from
    // /daily-games, usually because it died. See rule 3 in similar-games.ts.
    const orphans = COMPARISONS.filter(
      (c) => !PRICE_GAMES.some((g) => g.url === c.opponentUrl)
    ).map((c) => c.slug);
    expect(orphans).toEqual([]);
  });

  it("has unique, URL-safe slugs", () => {
    const slugs = COMPARISONS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("resolves each slug back to its comparison", () => {
    for (const c of COMPARISONS) {
      expect(getComparison(c.slug)).toBe(c);
    }
    expect(getComparison("no-such-game")).toBeUndefined();
  });

  describe.each(COMPARISONS.map((c) => [c.slug, c] as const))(
    "%s",
    (_slug, comparison) => {
      it("concedes at least one dimension to the other game", () => {
        // The rule the whole feature rests on. A table won on every row is
        // read as an advert, by people and by anything summarising the page.
        const counts = tally(comparison);
        expect(counts.theirs).toBeGreaterThan(0);
      });

      it("names things the other game does better, and does not hedge them", () => {
        expect(comparison.theirStrengths.length).toBeGreaterThan(0);
        for (const strength of comparison.theirStrengths) {
          // A concession short enough to be a caption is not a concession.
          expect(strength.length).toBeGreaterThan(40);
        }
      });

      it("recommends the other game to somebody real", () => {
        expect(comparison.pickTheirs.length).toBeGreaterThan(60);
        expect(comparison.pickTheirs).toContain(comparison.opponent);
      });

      it("opens with a verdict that survives being lifted out of the page", () => {
        // 40-60 words is the length that gets extracted whole. Allow a little
        // either side; reject an opening that is really an introduction.
        const words = comparison.verdict.trim().split(/\s+/).length;
        expect(words).toBeGreaterThanOrEqual(35);
        expect(words).toBeLessThanOrEqual(75);
        // It has to name both games, because an extracted answer arrives with
        // no surrounding page to say what it is about.
        expect(comparison.verdict).toContain(SITE_NAME);
        expect(comparison.verdict).toContain(comparison.opponent);
      });

      it("was checked on a real, non-future date", () => {
        expect(comparison.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const checked = new Date(`${comparison.checked}T00:00:00Z`);
        expect(Number.isNaN(checked.getTime())).toBe(false);
        // A check dated in the future is a check nobody did.
        expect(checked.getTime()).toBeLessThanOrEqual(Date.now());
      });

      it("says what was looked at, so the check can be repeated", () => {
        expect(comparison.sourceNote.length).toBeGreaterThan(60);
      });

      it("compares enough dimensions to be worth reading", () => {
        expect(comparison.facts.length).toBeGreaterThanOrEqual(8);
      });

      it("has no duplicate dimensions", () => {
        const dimensions = comparison.facts.map((f) => f.dimension);
        expect(new Set(dimensions).size).toBe(dimensions.length);
      });

      it("fills in our own side of every row", () => {
        // `theirs` may be null — we cannot always verify a competitor. There
        // is no excuse for not knowing our own game.
        for (const fact of comparison.facts) {
          expect(fact.ours.trim().length).toBeGreaterThan(0);
        }
      });

      it("does not adjudicate a dimension it never verified", () => {
        const counts = tally(comparison);
        const verified = comparison.facts.filter((f) => f.theirs !== null);
        expect(counts.ours + counts.theirs + counts.even).toBe(verified.length);
      });

      it("links to the game over https", () => {
        expect(comparison.opponentUrl).toMatch(/^https:\/\//);
      });

      it("asks its FAQs in the words they get asked in", () => {
        expect(comparison.faqs.length).toBeGreaterThanOrEqual(3);
        for (const faq of comparison.faqs) {
          expect(faq.question.endsWith("?")).toBe(true);
          // An answer that leans on the page around it is useless once it has
          // been extracted from that page, which is the only way these get
          // read. Each one has to stand alone, and length is the cheap proxy.
          expect(faq.answer.length).toBeGreaterThan(120);
        }
      });
    }
  );
});
