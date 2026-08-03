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
    // The stagger runs once, at the end of a round, on a screen the player has
    // been staring at for a minute. It is the one place in the game where a
    // beat of choreography earns its keep.
    <div className="stagger flex flex-col gap-6 pt-1">
      <div className="text-center">
        {/* The verdict is the second-loudest thing on the screen after the
            figure itself, so it is set, not labelled. How close you got is the
            footnote to it, not the other way round. */}
        <p
          className="display text-[1.75rem]"
          style={{ color: won ? "rgb(var(--win))" : "rgb(var(--ink))" }}
        >
          {won ? `Solved in ${guesses.length} of ${MAX_GUESSES}` : "Out of guesses"}
        </p>
        <p className="mt-1.5 text-[13px] text-ink-muted">
          {accuracyLine(bestOff, won)}
        </p>
      </div>

      {/* The stat plate. A heavy top rule and a hairline frame — the way a
          broadsheet sets a table apart from the column it interrupts. */}
      <figure className="border border-rule border-t-2 border-t-ink bg-paper-raised px-5 pb-4 pt-4 text-center">
        <figcaption className="label">
          {item.name} in {price.countryName}
        </figcaption>

        <p className="display animate-print-in mt-3 text-figure text-ink">
          {formatMoney(price.priceUSD, "USD")}
        </p>
        <p className="mt-1.5 font-mono text-sm tabular-nums text-ink-muted">
          {formatMoney(price.priceLocal, price.localCurrency)}
        </p>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-rule pt-3.5 text-[13px] leading-relaxed text-ink-body">
          <p>{affordanceLine(price)}</p>
          {priceRankLine(price) && (
            <p className="text-ink-muted">{priceRankLine(price)}</p>
          )}
        </div>

        <p className="mt-3.5 border-t border-rule-soft pt-3 text-[11px] leading-relaxed text-ink-meta">
          Source: {price.source}.{" "}
          <Link
            href="/methodology"
            className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
          >
            How we source prices
          </Link>
        </p>
      </figure>

      {/* The reveal is where curiosity peaks, so it is the right place to hand
          players the two reference pages behind today's number. */}
      <div className="grid grid-cols-2 gap-px border-y border-rule bg-rule">
        <Link
          href={`/items/${item.slug}`}
          className="bg-paper px-3 py-3 text-center text-[13px] font-medium text-ink-body transition-[background-color,color] duration-fast ease-out hover:bg-paper-raised hover:text-ink"
        >
          {item.shortName} everywhere
        </Link>
        <Link
          href={`/prices/${countrySlug(price.countryName)}`}
          className="bg-paper px-3 py-3 text-center text-[13px] font-medium text-ink-body transition-[background-color,color] duration-fast ease-out hover:bg-paper-raised hover:text-ink"
        >
          Prices in {price.countryName}
        </Link>
      </div>

      {!isArchive && won && milestone && (
        <div className="border-l-2 border-streak bg-streak/[0.08] py-3 pl-4 pr-3">
          <p className="display text-xl text-streak">{milestone}-day streak</p>
          <p className="mt-1 text-[13px] text-ink-muted">
            {milestone >= 30 ? "That's a serious habit." : "Nice run. Keep it going."}
          </p>
        </div>
      )}

      {!isArchive && won && !milestone && stats.currentStreak > 1 && (
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-streak">
          {stats.currentStreak}-day streak
          {upcoming ? ` · ${upcoming - stats.currentStreak} to ${upcoming}` : ""}
        </p>
      )}

      {!isArchive && perfect && (
        <p className="label text-center">
          Perfect record · {stats.wins} of {stats.played}
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
        <div className="flex items-center justify-between border-t border-rule pt-4">
          <div>
            <p className="label">Next edition</p>
            <Countdown />
          </div>
          <button
            onClick={onShowStats}
            className="border border-rule px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-body transition-[background-color,border-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-raised active:scale-[0.97]"
          >
            Statistics
          </button>
        </div>
      )}
    </div>
  );
}
