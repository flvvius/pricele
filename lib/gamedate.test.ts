import { describe, expect, it } from "vitest";
import { archiveDate, archiveKey, pastDates } from "./gamedate";

describe("archiveDate", () => {
  const epoch = "2026-10-22";
  const today = "2026-10-25";

  it("accepts a past date on or after the epoch", () => {
    expect(archiveDate("?d=2026-10-22", epoch, today)).toBe("2026-10-22");
    expect(archiveDate("?d=2026-10-24", epoch, today)).toBe("2026-10-24");
  });

  it("rejects today, the future, pre-epoch and malformed dates", () => {
    expect(archiveDate("?d=2026-10-25", epoch, today)).toBeNull();
    expect(archiveDate("?d=2026-11-01", epoch, today)).toBeNull();
    expect(archiveDate("?d=2026-10-21", epoch, today)).toBeNull();
    expect(archiveDate("?d=2026-10-2", epoch, today)).toBeNull();
    expect(archiveDate("?d=2026-13-40", epoch, today)).toBeNull();
    expect(archiveDate("", epoch, today)).toBeNull();
  });
});

describe("pastDates", () => {
  it("lists days from yesterday back to the epoch", () => {
    expect(pastDates("2026-10-22", "2026-10-25")).toEqual([
      "2026-10-24",
      "2026-10-23",
      "2026-10-22",
    ]);
  });

  it("is empty on launch day and crosses month ends", () => {
    expect(pastDates("2026-10-22", "2026-10-22")).toEqual([]);
    expect(pastDates("2026-10-30", "2026-11-02")).toEqual([
      "2026-11-01",
      "2026-10-31",
      "2026-10-30",
    ]);
  });
});

describe("archiveKey", () => {
  it("keeps archive plays apart from today's key", () => {
    expect(archiveKey("pricele:open-range")).toBe("pricele:open-range:archive");
  });
});
