import { describe, it, expect } from "vitest";
import {
  applyCompletion,
  calibrationProfile,
  earnedMilestones,
  isPerfect,
  migrateStats,
  milestoneFor,
  nextMilestone,
  EMPTY_STATS,
  GRACE_EVERY,
  MAX_GRACE_DAYS,
  MIN_BIAS_ROUNDS,
  type Completion,
  type Stats,
} from "./storage";

const stats = (over: Partial<Stats> = {}): Stats => ({
  ...EMPTY_STATS,
  distribution: [...EMPTY_STATS.distribution],
  bias: {},
  ...over,
});

const win = (over: Partial<Completion> = {}): Completion => ({
  date: "2026-09-03",
  won: true,
  numGuesses: 3,
  openingLogError: 0,
  category: "food",
  score: 500,
  ...over,
});

describe("streak milestones", () => {
  it("fires only on milestone days", () => {
    expect(milestoneFor(7)?.name).toBe("Regular Customer");
    expect(milestoneFor(14)?.days).toBe(14);
    expect(milestoneFor(30)?.name).toBe("Frequent Flyer");
    expect(milestoneFor(8)).toBeNull();
    expect(milestoneFor(0)).toBeNull();
  });

  it("points at the next milestone to aim for", () => {
    expect(nextMilestone(1)?.days).toBe(3);
    expect(nextMilestone(7)?.days).toBe(14);
    expect(nextMilestone(30)?.days).toBe(60);
    expect(nextMilestone(365)).toBeNull();
  });

  it("lists what a best streak has earned", () => {
    expect(earnedMilestones(0)).toHaveLength(0);
    expect(earnedMilestones(7).map((m) => m.days)).toEqual([3, 7]);
    expect(earnedMilestones(1000)).toHaveLength(7);
  });
});

describe("perfect record", () => {
  it("needs a few games and no losses", () => {
    expect(isPerfect(stats({ played: 5, wins: 5 }))).toBe(true);
    expect(isPerfect(stats({ played: 5, wins: 4 }))).toBe(false);
    expect(isPerfect(stats({ played: 2, wins: 2 }))).toBe(false);
    expect(isPerfect(stats())).toBe(false);
  });
});

// The whole point of migrateStats. Every assertion here is guarding a player's
// streak against a future schema change, which is the one thing this codebase
// cannot afford to get wrong twice.
describe("migrating stored stats", () => {
  it("keeps every value an older build wrote", () => {
    const old = {
      played: 40,
      wins: 33,
      currentStreak: 12,
      maxStreak: 19,
      distribution: [1, 4, 10, 12, 6],
      lastCompletedDate: "2026-09-02",
    };
    const migrated = migrateStats(old);
    expect(migrated.currentStreak).toBe(12);
    expect(migrated.maxStreak).toBe(19);
    expect(migrated.played).toBe(40);
    expect(migrated.distribution).toEqual([1, 4, 10, 12, 6]);
  });

  it("settles up the passes a pre-existing streak had already earned", () => {
    expect(migrateStats({ currentStreak: 0 }).graceDays).toBe(0);
    expect(migrateStats({ currentStreak: 9 }).graceDays).toBe(0);
    expect(migrateStats({ currentStreak: 10 }).graceDays).toBe(1);
    expect(migrateStats({ currentStreak: 25 }).graceDays).toBe(2);
    expect(migrateStats({ currentStreak: 400 }).graceDays).toBe(MAX_GRACE_DAYS);
  });

  it("leaves an already-migrated balance alone", () => {
    expect(migrateStats({ currentStreak: 40, graceDays: 0 }).graceDays).toBe(0);
  });

  it("replaces a distribution of the wrong length rather than trusting it", () => {
    expect(migrateStats({ distribution: [1, 2] }).distribution).toHaveLength(5);
  });

  it("gives a player with nothing stored a fresh, non-shared object", () => {
    const a = migrateStats(null);
    const b = migrateStats(null);
    a.distribution[0] = 99;
    expect(b.distribution[0]).toBe(0);
  });
});

describe("recording a completion", () => {
  it("extends a streak played yesterday", () => {
    const next = applyCompletion(
      stats({ currentStreak: 4, lastCompletedDate: "2026-09-02" }),
      "2026-09-03",
      win()
    );
    expect(next.currentStreak).toBe(5);
    expect(next.maxStreak).toBe(5);
  });

  it("restarts a streak after a gap with no pass banked", () => {
    const next = applyCompletion(
      stats({ currentStreak: 9, lastCompletedDate: "2026-08-31", graceDays: 0 }),
      "2026-09-03",
      win()
    );
    expect(next.currentStreak).toBe(1);
  });

  it("a loss ends the streak and still counts as played", () => {
    const next = applyCompletion(
      stats({ currentStreak: 9, lastCompletedDate: "2026-09-02" }),
      "2026-09-03",
      win({ won: false })
    );
    expect(next.currentStreak).toBe(0);
    expect(next.played).toBe(1);
    expect(next.wins).toBe(0);
    expect(next.distribution).toEqual([0, 0, 0, 0, 0]);
  });

  it("banks points and tracks the best single round", () => {
    let s = applyCompletion(stats(), "2026-09-02", win({ score: 400 }));
    s = applyCompletion(s, "2026-09-03", win({ score: 900 }));
    expect(s.points).toBe(1300);
    expect(s.bestScore).toBe(900);
  });
});

describe("streak passes", () => {
  it("spends one to cover a single missed day", () => {
    const next = applyCompletion(
      stats({ currentStreak: 12, lastCompletedDate: "2026-09-01", graceDays: 1 }),
      "2026-09-03",
      win()
    );
    expect(next.currentStreak).toBe(13);
    expect(next.graceDays).toBe(0);
    expect(next.graceUsedOn).toBe("2026-09-03");
  });

  it("will not cover two missed days, however many are banked", () => {
    const next = applyCompletion(
      stats({ currentStreak: 12, lastCompletedDate: "2026-08-31", graceDays: 2 }),
      "2026-09-03",
      win()
    );
    expect(next.currentStreak).toBe(1);
    expect(next.graceDays).toBe(2);
  });

  it("does not rescue a streak on a day the player lost", () => {
    const next = applyCompletion(
      stats({ currentStreak: 12, lastCompletedDate: "2026-09-01", graceDays: 2 }),
      "2026-09-03",
      win({ won: false })
    );
    expect(next.currentStreak).toBe(0);
    expect(next.graceDays).toBe(2);
  });

  it("earns one on every tenth day and never more than the cap", () => {
    const onNine = applyCompletion(
      stats({ currentStreak: 9, lastCompletedDate: "2026-09-02", graceDays: 0 }),
      "2026-09-03",
      win()
    );
    expect(onNine.currentStreak).toBe(GRACE_EVERY);
    expect(onNine.graceDays).toBe(1);

    // Day 11 pays nothing: the award is on landing on the multiple, not on
    // being past it, or a long streak would print passes forever.
    const onTen = applyCompletion(
      stats({ currentStreak: 10, lastCompletedDate: "2026-09-02", graceDays: 1 }),
      "2026-09-03",
      win()
    );
    expect(onTen.graceDays).toBe(1);

    const atCap = applyCompletion(
      stats({
        currentStreak: 29,
        lastCompletedDate: "2026-09-02",
        graceDays: MAX_GRACE_DAYS,
      }),
      "2026-09-03",
      win()
    );
    expect(atCap.graceDays).toBe(MAX_GRACE_DAYS);
  });
});

describe("the calibration profile", () => {
  it("says nothing about a category with too few rounds", () => {
    let s = stats();
    for (let i = 0; i < MIN_BIAS_ROUNDS - 1; i++) {
      s = applyCompletion(s, `2026-09-0${i + 1}`, win({ openingLogError: 0.2 }));
    }
    expect(calibrationProfile(s)).toHaveLength(0);
  });

  it("reports a consistent overbidder as bidding high", () => {
    let s = stats();
    // ln(1.25) on every opening bid: a quarter over, every time.
    for (let i = 0; i < 5; i++) {
      s = applyCompletion(
        s,
        `2026-09-0${i + 1}`,
        win({ openingLogError: Math.log(1.25) })
      );
    }
    const [food] = calibrationProfile(s);
    expect(food.category).toBe("food");
    expect(food.biasPct).toBe(25);
    expect(food.rounds).toBe(5);
  });

  // The reason the sums are kept in log space. Someone who is twice too high
  // half the time and half too low the rest is unbiased, and averaging raw
  // percentages would call them 25% high.
  it("calls a symmetric guesser unbiased, and still reports the spread", () => {
    let s = stats();
    for (let i = 0; i < 4; i++) {
      s = applyCompletion(
        s,
        `2026-09-0${i + 1}`,
        win({ openingLogError: i % 2 === 0 ? Math.log(2) : Math.log(0.5) })
      );
    }
    const [food] = calibrationProfile(s);
    expect(food.biasPct).toBe(0);
    expect(food.spreadPct).toBe(100);
  });

  it("keeps categories apart", () => {
    let s = stats();
    for (let i = 0; i < 4; i++) {
      s = applyCompletion(s, `2026-09-0${i + 1}`, win({ openingLogError: Math.log(1.5) }));
    }
    for (let i = 0; i < 4; i++) {
      s = applyCompletion(s, `2026-09-1${i}`, win({ category: "energy", openingLogError: Math.log(0.8) }));
    }
    const profile = calibrationProfile(s);
    expect(profile).toHaveLength(2);
    expect(profile.find((p) => p.category === "food")?.biasPct).toBe(50);
    expect(profile.find((p) => p.category === "energy")?.biasPct).toBe(-20);
  });
});

describe("the bot counters", () => {
  it("only counts a round where a baseline was actually shown", () => {
    const skipped = applyCompletion(stats(), "2026-09-03", win());
    expect(skipped.botRounds).toBe(0);

    const lost = applyCompletion(stats(), "2026-09-03", win({ beatBot: false }));
    expect(lost.botRounds).toBe(1);
    expect(lost.botWins).toBe(0);

    const beaten = applyCompletion(stats(), "2026-09-03", win({ beatBot: true }));
    expect(beaten.botWins).toBe(1);
  });
});
