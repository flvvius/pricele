import type { PriceEntry } from "@/lib/puzzle";
import type { GuessRecord, Stats } from "@/lib/storage";
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
  itemName: string;
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
  itemName,
  price,
  guesses,
  won,
  stats,
  onShowStats,
  isArchive = false,
}: Props) {
  const bestOff = bestPctOff(guesses, price.priceUSD);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        {won ? (
          <p className="animate-pop text-xl font-bold text-green-400">
            Solved in {guesses.length}/{MAX_GUESSES} 🎉
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
          Actual price
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
      </div>

      {!isArchive && won && stats.currentStreak > 1 && (
        <p className="text-center text-sm text-orange-300">
          🔥 {stats.currentStreak}-day streak. Play tomorrow to keep it alive.
        </p>
      )}

      <ShareCard
        puzzleNumber={puzzleNumber}
        itemName={itemName}
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
            <p className="text-neutral-400">Next country in</p>
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
