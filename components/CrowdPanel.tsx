"use client";

import { useEffect, useState } from "react";
import type { CrowdStats } from "@/lib/db";
import {
  dismissHome,
  homeAsked,
  homeOptions,
  loadHome,
  saveHome,
  HOME_ELSEWHERE,
} from "@/lib/home";
import {
  egoGapLine,
  homeBiasLine,
  overshootLine,
  percentileLine,
  turnoutLine,
} from "@/lib/crowd";

interface Props {
  stats: CrowdStats | null;
  itemName: string;
  countryCode: string;
  countryName: string;
  /** Hidden on archive replays: yesterday's crowd is not today's crowd. */
  enabled: boolean;
  /** Bubbled up so the reveal can redraw its own in-your-money line. */
  onHomeChange?: (code: string) => void;
}

/**
 * Asked once, ever, and never as a blocking dialog.
 *
 * A country is the only personal thing this site asks for and it buys two real
 * features, so the question says what it is for in the same breath as asking it.
 * Declining is a first-class answer: dismissHome() remembers the refusal so the
 * prompt does not come back and start reading as a nag.
 *
 * A select rather than a grid of flags, because the list is 49 long. A grid at
 * that size is a wall.
 */
function HomeAsk({ onAnswer }: { onAnswer: (code: string) => void }) {
  const options = homeOptions();

  return (
    <div className="border-l-2 border-accent bg-accent/[0.06] py-3 pl-3.5 pr-3">
      <p className="label !text-accent">One question</p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-body">
        Where do you live? It turns every price into what it would cost you, and
        into how long you would work for it. Stored in this browser, sent as two
        letters, never attached to your bids.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          defaultValue=""
          onChange={(e) => e.target.value && onAnswer(e.target.value)}
          aria-label="Your country"
          className="min-w-0 flex-1 border border-rule bg-paper-raised px-2.5 py-2 text-[14px] text-ink-body outline-none focus:border-ink"
        >
          <option value="" disabled>
            Pick a country
          </option>
          {options.map((o) => (
            <option key={o.code} value={o.code}>
              {o.flag} {o.name}
            </option>
          ))}
          <option value={HOME_ELSEWHERE}>Somewhere else</option>
        </select>
        <button
          onClick={() => onAnswer("")}
          className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-meta underline underline-offset-[3px]"
        >
          Rather not say
        </button>
      </div>
    </div>
  );
}

/**
 * What everyone else did today.
 *
 * Renders nothing at all when the database is unconfigured, when the request
 * failed, or when too few people have played to say anything true. Every line is
 * independently optional, so a day with a small sample can show the turnout and
 * withhold the percentages rather than showing a made-up version of both.
 */
export default function CrowdPanel({
  stats,
  itemName,
  countryCode,
  countryName,
  enabled,
  onHomeChange,
}: Props) {
  const [home, setHome] = useState("");
  const [asked, setAsked] = useState(true);

  useEffect(() => {
    setHome(loadHome());
    setAsked(homeAsked());
  }, []);

  function answer(code: string) {
    if (code) {
      saveHome(code);
      setHome(code);
      onHomeChange?.(code);
    } else {
      dismissHome();
    }
    setAsked(true);
  }

  if (!enabled) return null;

  const all = stats?.all ?? null;
  const lines = [
    percentileLine(stats),
    overshootLine(all, countryName),
    egoGapLine(all, itemName, countryName),
    // Only shown to someone who lives in the country on the board. For everyone
    // else it is a fact about strangers.
    home === countryCode
      ? homeBiasLine(stats?.locals ?? null, itemName, countryName)
      : null,
  ].filter((l): l is string => !!l);

  const turnout = turnoutLine(all);
  // The question is worth asking only once there is a crowd for it to join.
  const showAsk = !asked && !!all;

  if (lines.length === 0 && !turnout && !showAsk) return null;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="label rule-label">The rest of the shop</h3>

      {lines.length > 0 && (
        <ul className="flex flex-col gap-2 text-[14px] leading-relaxed text-ink-body">
          {lines.map((line) => (
            <li key={line} className="border-l-2 border-rule pl-3">
              {line}
            </li>
          ))}
        </ul>
      )}

      {turnout && <p className="label">{turnout}</p>}

      {showAsk && <HomeAsk onAnswer={answer} />}
    </section>
  );
}
