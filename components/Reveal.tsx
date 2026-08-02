import Link from "next/link";
import type { PriceEntry } from "@/lib/puzzle";
import type { Item } from "@/data/items";
import { countrySlug } from "@/lib/catalog";
import {
  isPerfect,
  milestoneFor,
  nextMilestone,
  type GuessRecord,
  type Stats,
} from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";
import {
  affordanceLine,
  formatMoney,
  bestPctOff,
  accuracyLine,
  priceRankLine,
} from "@/lib/format";
import ShareCard from "./ShareCard";
import Countdown from "./Countdown";
import EngagementPrompts from "./EngagementPrompts";
import AdSlot from "./AdSlot";
import { AD_SLOTS } from "@/lib/ads";

interface Props {
  puzzleNumber: number;
  item: Item;
  price: PriceEntry;
  guesses: GuessRecord[];
  won: boolean;
  stats: Stats;
  onShowStats: () => void;
  /** True when replaying a past puzzle: hide today-only chrome (streak, reminders). */
  isArchive?: boolean;
}

export default function Reveal({
  puzzleNumber,
  item,
  price,
  guesses,
  won,
  stats,
  onShowStats,
  isArchive = false,
}: Props) {
  const bestOff = bestPctOff(guesses, price.priceUSD);
  const milestone = milestoneFor(stats.currentStreak);
  const upcoming = nextMilestone(stats.currentStreak);
  const perfect = isPerfect(stats);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        {won ? (
          <p className="animate-pop text-xl font-bold text-green-400">
            Solved in {guesses.length}/{MAX_GUESSES}
          </p>
        ) : (
          <p className="text-xl font-bold text-neutral-200">Out of guesses</p>
        )}
        <p className="mt-1 text-sm text-neutral-300">
          {accuracyLine(bestOff, won)}
        </p>
      </div>

      <div className="animate-pop rounded-xl border border-neutral-700 bg-neutral-800 p-5 text-center">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          {item.name} in {price.countryName}
        </p>
        <p className="mt-1 text-4xl font-black tabular-nums">
          {formatMoney(price.priceUSD, "USD")}
        </p>
        <p className="text-neutral-400">
          {formatMoney(price.priceLocal, price.localCurrency)}
        </p>
        <p className="mt-3 border-t border-neutral-700 pt-3 text-sm text-neutral-300">
          {affordanceLine(price)}
        </p>
        {priceRankLine(price) && (
          <p className="mt-2 text-sm text-neutral-400">{priceRankLine(price)}</p>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
          Source: {price.source}.{" "}
          <Link href="/methodology" className="underline hover:text-neutral-300">
            How we source prices
          </Link>
        </p>
      </div>

      {/* The reveal is where curiosity peaks, so it's the right place to hand
          players the two reference pages behind today's number. */}
      <div className="flex gap-2 text-sm">
        <Link
          href={`/items/${item.slug}`}
          className="flex-1 rounded-lg border border-neutral-700 px-3 py-2.5 text-center font-medium text-neutral-200 transition hover:bg-neutral-800"
        >
          {item.shortName} in every country
        </Link>
        <Link
          href={`/prices/${countrySlug(price.countryName)}`}
          className="flex-1 rounded-lg border border-neutral-700 px-3 py-2.5 text-center font-medium text-neutral-200 transition hover:bg-neutral-800"
        >
          Prices in {price.countryName}
        </Link>
      </div>

      {!isArchive && won && milestone && (
        <div className="animate-pop rounded-xl border border-orange-700/70 bg-orange-950/40 p-3 text-center">
          <p className="text-base font-bold text-orange-200">
            {milestone}-day streak
          </p>
          <p className="mt-0.5 text-xs text-orange-300/80">
            {milestone >= 30
              ? "That's a serious habit."
              : "Nice run. Keep it going."}
          </p>
        </div>
      )}

      {!isArchive && won && !milestone && stats.currentStreak > 1 && (
        <p className="text-center text-sm text-orange-300">
          {stats.currentStreak}-day streak
          {upcoming ? ` · ${upcoming - stats.currentStreak} to go until ${upcoming}` : ""}
        </p>
      )}

      {!isArchive && perfect && (
        <p className="text-center text-xs text-neutral-400">
          Perfect record: {stats.wins}/{stats.played}
        </p>
      )}

      <ShareCard
        puzzleNumber={puzzleNumber}
        itemName={item.shortName}
        countryName={price.countryName}
        flag={price.flag}
        guesses={guesses}
        won={won}
        streak={isArchive ? undefined : stats.currentStreak}
        bestPctOff={bestOff}
      />

      {!isArchive && <EngagementPrompts />}

      {/* Post-game only: shown after the puzzle is finished, never during play. */}
      <AdSlot slot={AD_SLOTS.reveal} />

      {!isArchive && (
        <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm">
          <div>
            <p className="text-neutral-400">Next puzzle in</p>
            <Countdown />
          </div>
          <button
            onClick={onShowStats}
            className="rounded-lg border border-neutral-700 px-3 py-2 font-medium text-neutral-200 transition hover:bg-neutral-800"
          >
            View stats
          </button>
        </div>
      )}
    </div>
  );
}
