import { describe, it, expect } from "vitest";
import {
  challengeLine,
  challengeVerdict,
  dayShareUrl,
  decodeChallenge,
  encodeChallenge,
  weekShareUrl,
} from "./sharelink";
import { gameShareUrl } from "./sharelink";
import { buildShareTextWithUrl, shareLinkFor, type ShareInput } from "./share";
import { pageMetadata, SITE_URL } from "./seo";
import {
  getPuzzleForISO,
  isoForPuzzleNumber,
  puzzleForShareNumber,
  puzzleNumber,
  dateFromISO,
} from "./puzzle";
import { EMPTY_STATS, streakSafetyLine } from "./storage";

const input: ShareInput = {
  puzzleNumber: 214,
  itemName: "Cappuccino",
  countryName: "Japan",
  flag: "🇯🇵",
  guesses: [
    { value: 2, band: "red", direction: "too_low", closeness: 0.4 },
    { value: 3.1, band: "green", direction: "exact", closeness: 1 },
  ] as ShareInput["guesses"],
  won: true,
  score: 870,
  actualUSD: 3.12,
};

describe("shared links", () => {
  it("tag the day link by channel and carry the challenge", () => {
    const url = new URL(dayShareUrl(214, "native", { bids: 3, score: 870 }));
    expect(url.pathname).toBe("/d/214");
    expect(url.searchParams.get("utm_source")).toBe("share");
    expect(url.searchParams.get("utm_medium")).toBe("native");
    expect(url.searchParams.get("utm_campaign")).toBe("daily");
    expect(url.searchParams.get("c")).toBe("214-3-870");
  });

  it("put the tagged link on the receipt, and never the price", () => {
    const text = buildShareTextWithUrl(input);
    expect(text).toContain(`${SITE_URL}/d/214?utm_source=share&utm_medium=copy`);
    expect(text).toContain("c=214-2-870");
    expect(text).not.toMatch(/3\.1/);
    expect(shareLinkFor(input, "copy")).not.toMatch(/3\.1/);
  });

  it("ship no challenge for an archive replay without a score", () => {
    const url = shareLinkFor({ ...input, score: undefined }, "copy");
    expect(new URL(url).searchParams.has("c")).toBe(false);
  });

  it("keep the week in the fragment, after the tags", () => {
    const url = new URL(weekShareUrl("abc"));
    expect(url.pathname).toBe("/week");
    expect(url.searchParams.get("utm_campaign")).toBe("weekly");
    expect(url.hash).toBe("#abc");
  });

  it("leave canonicals untouched", () => {
    const meta = pageMetadata({ path: "/" });
    expect(String(meta.alternates?.canonical)).toBe("/");
    expect(JSON.stringify(meta)).not.toContain("utm_");
  });
});

describe("challenge tokens", () => {
  it("round-trip", () => {
    const c = { puzzleNumber: 214, bids: 0, score: 412 };
    expect(decodeChallenge(encodeChallenge(c))).toEqual(c);
  });

  it("reject anything else", () => {
    for (const bad of [null, "", "214-6-100", "214-3-1001", "0-3-1", "x", "214-3-870-9"]) {
      expect(decodeChallenge(bad)).toBeNull();
    }
  });

  it("word the banner and the verdict without a price", () => {
    expect(challengeLine({ puzzleNumber: 1, bids: 3, score: 870 })).toBe(
      "A friend got it in 3 (score 870). Can you beat them?"
    );
    const them = { puzzleNumber: 1, bids: 3, score: 870 };
    expect(challengeVerdict(them, { bids: 2, score: 900 })).toContain("beat your friend by 30");
    expect(challengeVerdict(them, { bids: 0, score: 100 })).toContain("Your friend wins");
  });
});

describe("shared day numbers", () => {
  it("map back to the date the number was played", () => {
    const today = puzzleNumber();
    const iso = isoForPuzzleNumber(today);
    expect(puzzleNumber(dateFromISO(iso))).toBe(today);
    expect(puzzleForShareNumber(today)).toEqual(getPuzzleForISO(iso));
  });

  it("never unfurl a day further out than tomorrow", () => {
    const today = puzzleNumber();
    expect(puzzleForShareNumber(today + 1)).not.toBeNull();
    expect(puzzleForShareNumber(today + 2)).toBeNull();
    expect(puzzleForShareNumber(0)).toBeNull();
    expect(puzzleForShareNumber(1.5)).toBeNull();
  });
});

describe("streakSafetyLine", () => {
  it("is quiet with no streak", () => {
    expect(streakSafetyLine(EMPTY_STATS)).toBeNull();
  });

  it("names the next rain check, or the banked ones", () => {
    expect(streakSafetyLine({ ...EMPTY_STATS, currentStreak: 4 })).toBe(
      "4-day streak safe. Play tomorrow to make it 5. Reach 10 to bank a rain check for a missed day."
    );
    expect(
      streakSafetyLine({ ...EMPTY_STATS, currentStreak: 12, graceDays: 1 })
    ).toContain("1 rain check banked");
  });
});

describe("gameShareUrl", () => {
  it("tags the game page with its own campaign", () => {
    const url = new URL(gameShareUrl("/games/price-atlas", "native", "game-price-atlas"));
    expect(url.pathname).toBe("/games/price-atlas");
    expect(url.searchParams.get("utm_source")).toBe("share");
    expect(url.searchParams.get("utm_medium")).toBe("native");
    expect(url.searchParams.get("utm_campaign")).toBe("game-price-atlas");
  });
});
