import { describe, it, expect } from "vitest";
import {
  milestoneFor,
  nextMilestone,
  isPerfect,
  EMPTY_STATS,
  type Stats,
} from "./storage";

const stats = (over: Partial<Stats> = {}): Stats => ({
  ...EMPTY_STATS,
  distribution: [...EMPTY_STATS.distribution],
  ...over,
});

describe("streak milestones", () => {
  it("fires only on milestone days", () => {
    expect(milestoneFor(7)).toBe(7);
    expect(milestoneFor(14)).toBe(14);
    expect(milestoneFor(30)).toBe(30);
    expect(milestoneFor(8)).toBeNull();
    expect(milestoneFor(0)).toBeNull();
  });

  it("points at the next milestone to aim for", () => {
    expect(nextMilestone(1)).toBe(3);
    expect(nextMilestone(7)).toBe(14);
    expect(nextMilestone(30)).toBe(60);
    expect(nextMilestone(100)).toBeNull();
  });
});

describe("perfect record", () => {
  it("needs a few games and no losses", () => {
    expect(isPerfect(stats({ played: 5, wins: 5 }))).toBe(true);
    expect(isPerfect(stats({ played: 5, wins: 4 }))).toBe(false);
    // Too early to call it perfect.
    expect(isPerfect(stats({ played: 2, wins: 2 }))).toBe(false);
    expect(isPerfect(stats())).toBe(false);
  });
});
