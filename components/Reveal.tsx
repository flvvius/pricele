"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PriceEntry } from "@/lib/puzzle";
import type { Item } from "@/data/items";
import { countrySlug, suppressedPairs } from "@/lib/catalog";
import {
  isPerfect,
  milestoneFor,
  nextMilestone,
  GRACE_NAME,
  type GuessRecord,
  type Stats,
} from "@/lib/storage";
import { MAX_GUESSES } from "@/lib/share";
import {
  formatMoney,
  formatPrice,
  bestPctOff,
  accuracyLine,
  priceRankLine,
} from "@/lib/format";
import { highlightFor, lookalikeLine, personaFor, roastFor } from "@/lib/verdict";
import { inYourMoneyLine, loadHome, minutesOfWorkLine } from "@/lib/home";
import { beatTheBot } from "@/lib/bot";
import { factFor } from "@/data/facts";
import type { CrowdStats } from "@/lib/db";
import { USD_TO_EUR, type Currency } from "@/lib/currency";
import ShareCard from "./ShareCard";
import Countdown from "./Countdown";
import CrowdPanel from "./CrowdPanel";
import WeekCard from "./WeekCard";
import RoomBoard from "./RoomBoard";
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
  /** The currency the player guessed in. The headline figure is shown in it. */
  currency: Currency;
  /** True when replaying a past puzzle: hide today-only chrome (streak, reminders). */
  isArchive?: boolean;
  /** This round's score out of 1000. */
  score: number;
  /** Aggregates for today, or null when there is no backend or no crowd yet. */
  crowd?: CrowdStats | null;
  /**
   * True when the round finished in this session, which is the only time the
   * reveal is worth staging. Reloading a day you already played goes straight to
   * the full page: making someone tap through four cards to re-read a result
   * they have seen is a toll, not a beat.
   */
  staged?: boolean;
  /** Today's local date, for the weekly wrapped cut. */
  today?: string;
  /** The classroom this browser is playing in, if any. */
  roomCode?: string;
}

/**
 * How many cards the reveal is broken into.
 *
 * Wrapped reveals a year one card at a time and nobody has ever complained about
 * the extra taps, because the pause is what turns a statistic into a small
 * event. Four is the ceiling here: the price, what it means, the verdict, the
 * paperwork. A fifth would be padding and would start costing the share, which
 * lives on the last one.
 */
const STAGES = 4;

/** Sunday. The wrapped card only appears at the end of a week. */
const SUNDAY = 0;

export default function Reveal({
  puzzleNumber,
  item,
  price,
  guesses,
  won,
  stats,
  onShowStats,
  currency,
  isArchive = false,
  score,
  crowd = null,
  staged = false,
  today = "",
  roomCode = "",
}: Props) {
  const [stage, setStage] = useState(staged ? 1 : STAGES);
  const [home, setHome] = useState("");

  useEffect(() => setHome(loadHome()), []);

  const bestOff = bestPctOff(guesses, price.priceUSD);
  const milestone = milestoneFor(stats.currentStreak);
  const upcoming = nextMilestone(stats.currentStreak);
  const perfect = isPerfect(stats);
  const persona = personaFor(guesses, price.priceUSD, won);
  const roast = roastFor(bestOff, puzzleNumber);
  const highlight = highlightFor(guesses, price.priceUSD, won);
  const fact = factFor(puzzleNumber, item.id);
  const passUsed = !isArchive && !!stats.graceUsedOn && stats.graceUsedOn === today;
  const isSunday = !!today && new Date(`${today}T00:00:00`).getDay() === SUNDAY;

  // The suppression set is date-dependent, so it can only be built on the
  // client. Both lines that use it withhold themselves rather than guess.
  const suppressed = suppressedPairs();
  const lookalike = guesses[0]
    ? lookalikeLine(guesses[0].value, price, suppressed)
    : null;
  const inYourMoney = inYourMoneyLine(price, home, suppressed);
  const bot = guesses.length
    ? beatTheBot(
        guesses.reduce((best, g) =>
          Math.abs(Math.log(g.value / price.priceUSD)) <
          Math.abs(Math.log(best.value / price.priceUSD))
            ? g
            : best
        ).value,
        price
      )
    : null;

  const at = (n: number) => stage >= n;

  return (
    // The stagger runs once, at the end of a round, on a screen the player has
    // been staring at for a minute. It is the one place in the game where a
    // beat of choreography earns its keep.
    <div className="stagger flex flex-col gap-6 pt-1">
      <div className="text-center">
        {/* On a loss this leads with the bid that went well, because the result
            is already visible on the board above and repeating "you lost" as the
            first thing on the screen is what makes people close the tab.
            Chess.com moved brilliant moves above blunders in their post-game
            review and engagement went up a quarter. */}
        <p
          className="display text-[2rem]"
          style={{ color: won ? "rgb(var(--win))" : "rgb(var(--ink))" }}
        >
          {won ? `Solved in ${guesses.length} of ${MAX_GUESSES}` : "Out of guesses"}
        </p>
        <p className="mt-1.5 text-[14px] text-ink-muted">
          {highlight ? highlight.line : accuracyLine(bestOff, won)}
        </p>
      </div>

      {/* The stat plate. A heavy top rule and a hairline frame, the way a
          broadsheet sets a table apart from the column it interrupts. */}
      <figure className="border border-rule border-t-2 border-t-ink bg-paper-raised px-5 pb-4 pt-4 text-center">
        <figcaption className="label">
          {item.name} in {price.countryName}
        </figcaption>

        <p className="display animate-print-in mt-3 text-figure text-ink">
          {formatPrice(price.priceUSD, currency)}
        </p>
        {price.priceLocal != null && (
          <p className="mt-1.5 font-mono text-base tabular-nums text-ink-muted">
            {formatMoney(price.priceLocal, price.localCurrency)}
          </p>
        )}

        <div className="mt-4 flex items-baseline justify-center gap-6 border-t border-rule pt-3.5">
          <div>
            <p className="display text-2xl tabular-nums text-ink">{score}</p>
            <p className="label !text-[10px]">Score</p>
          </div>
          <div>
            <p className="display text-2xl tabular-nums text-ink">
              {Math.max(bestOff, 1)}%
            </p>
            <p className="label !text-[10px]">Best bid</p>
          </div>
        </div>
      </figure>

      {stage < STAGES && (
        <button
          onClick={() => setStage((s) => Math.min(STAGES, s + 1))}
          className="mx-auto flex items-center gap-2.5 border border-rule px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-body transition-[border-color,background-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-raised active:scale-[0.97]"
        >
          Continue
          <span className="text-ink-faint">
            {stage}/{STAGES}
          </span>
        </button>
      )}

      {at(2) && (
        <div className="animate-set-in flex flex-col gap-4">
          {/* What the price actually means, which is the half of this game the
              dollar figure alone never carries. Working time needs no exchange
              rate; the in-your-money line needs no economics at all. */}
          <div className="flex flex-col gap-1.5 text-[14px] leading-relaxed text-ink-body">
            <p>{minutesOfWorkLine(price, home)}</p>
            {inYourMoney && <p>{inYourMoney}</p>}
            {priceRankLine(price) && (
              <p className="text-ink-muted">{priceRankLine(price)}</p>
            )}
          </div>

          {bot && (
            <div className="border-l-2 border-rule pl-3.5">
              <p className="label">Beat the bot</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-body">
                A model that knows only the typical price of a {item.shortName.toLowerCase()}{" "}
                and how expensive {price.countryName} is in general would have
                guessed {formatPrice(bot.guessUSD, currency)}, which is{" "}
                {bot.pctOff}% out.{" "}
                <strong className="font-semibold text-ink">
                  {bot.drawn
                    ? "You drew with it."
                    : bot.playerWon
                      ? "You beat it."
                      : "It beat you."}
                </strong>
              </p>
            </div>
          )}

          <CrowdPanel
            stats={crowd}
            itemName={item.shortName}
            countryCode={price.countryCode}
            countryName={price.countryName}
            enabled={!isArchive}
            onHomeChange={setHome}
          />
        </div>
      )}

      {at(3) && (
        // The verdict is the artefact. It is the line that goes on the receipt,
        // so it is set like a headline here rather than tucked under the numbers
        // as a caption.
        <div className="animate-set-in border-y border-rule py-4 text-center">
          <p className="label">The verdict</p>
          <p className="display mt-2 text-[1.75rem] leading-tight text-ink">
            {persona.title}
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-body">
            {persona.gloss}
          </p>
          <p className="mt-3 border-t border-rule-soft pt-3 text-[14px] italic leading-relaxed text-ink-muted">
            {roast}
          </p>
          {lookalike && (
            <p className="mt-2 text-[14px] leading-relaxed text-ink-body">
              {lookalike}
            </p>
          )}
        </div>
      )}

      {at(STAGES) && (
        <>
          <p className="animate-set-in text-[12px] leading-relaxed text-ink-meta">
            Source: {price.source}.{" "}
            {/* Said plainly rather than hidden: the euro headline is arithmetic
                on a dollar figure, not a price anyone was charged, and on
                eurozone rows it sits a cent or two from the published euro
                price above. */}
            {currency === "EUR" && (
              <>
                Euro figures are converted from US dollars at a fixed reference
                rate of €{USD_TO_EUR.toFixed(2)}.{" "}
              </>
            )}
            <Link
              href="/methodology"
              className="underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink"
            >
              How we source prices
            </Link>
          </p>

          {roomCode && !isArchive && (
            <RoomBoard code={roomCode} currency={currency} />
          )}

          {/* The reveal is where curiosity peaks, so it is the right place to
              hand players the two reference pages behind today's number. */}
          <div className="grid grid-cols-2 gap-px border-y border-rule bg-rule">
            <Link
              href={`/items/${item.slug}`}
              className="bg-paper px-3 py-3 text-center text-[14px] font-medium text-ink-body transition-[background-color,color] duration-fast ease-out hover:bg-paper-raised hover:text-ink"
            >
              {item.shortName} everywhere
            </Link>
            <Link
              href={`/prices/${countrySlug(price.countryName)}`}
              className="bg-paper px-3 py-3 text-center text-[14px] font-medium text-ink-body transition-[background-color,color] duration-fast ease-out hover:bg-paper-raised hover:text-ink"
            >
              Prices in {price.countryName}
            </Link>
          </div>

          {passUsed && (
            <div className="border-l-2 border-streak bg-streak/[0.08] py-3 pl-4 pr-3">
              <p className="display text-xl text-streak">Streak covered</p>
              <p className="mt-1 text-[14px] text-ink-muted">
                You missed a day. A {GRACE_NAME} took care of it, and your run
                stands at {stats.currentStreak}.
              </p>
            </div>
          )}

          {!isArchive && won && milestone && (
            <div className="border-l-2 border-streak bg-streak/[0.08] py-3 pl-4 pr-3">
              <p className="label !text-streak">{milestone.days}-day streak</p>
              <p className="display mt-1 text-2xl text-streak">
                {milestone.name}
              </p>
              <p className="mt-1 text-[14px] text-ink-muted">
                {milestone.days >= 30
                  ? "That is a serious habit."
                  : "Nice run. Keep it going."}
              </p>
            </div>
          )}

          {!isArchive && won && !milestone && stats.currentStreak > 1 && (
            <p className="text-center font-mono text-[12px] uppercase tracking-[0.14em] text-streak">
              {stats.currentStreak}-day streak
              {upcoming
                ? ` · ${upcoming.days - stats.currentStreak} to ${upcoming.name}`
                : ""}
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
            score={score}
            actualUSD={price.priceUSD}
          />

          {!isArchive && isSunday && <WeekCard today={today} />}

          {/* One line of sourced material a player did not come for and will
              repeat anyway. See data/facts.ts for why every entry has a source
              behind it and why none of them may quote a live pair. */}
          <figure className="border-t border-rule pt-3.5">
            <figcaption className="label">Did you know</figcaption>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-body">
              {fact.text}
            </p>
            <p className="mt-1.5 text-[12px] text-ink-meta">{fact.source}</p>
          </figure>

          {!isArchive && <EngagementPrompts />}

          {/* Post-game only: shown after the puzzle is finished, never during play. */}
          <AdSlot slot={AD_SLOTS.reveal} />

          {!isArchive && (
            <div className="flex items-center justify-between gap-3 border-t border-rule pt-4">
              <div>
                <p className="label">Next edition</p>
                <Countdown />
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/higher-or-lower"
                  className="border border-rule px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-body transition-[background-color,border-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-raised active:scale-[0.97]"
                >
                  One more
                </Link>
                <button
                  onClick={onShowStats}
                  className="border border-rule px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-body transition-[background-color,border-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-raised active:scale-[0.97]"
                >
                  Statistics
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
