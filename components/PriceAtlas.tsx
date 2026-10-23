"use client";

import { useEffect, useState } from "react";
import {
  COUNTRIES,
  MAX_GUESSES,
  feedback,
  isOver,
  isWon,
  loadState,
  matchCountries,
  puzzleFor,
  result,
  saveState,
  shareText,
  visibleClues,
  type AtlasState,
  KEY,
  EPOCH,
} from "@/lib/priceatlas";
import { isoDate } from "@/lib/puzzle";
import { archiveDate, archiveKey } from "@/lib/gamedate";
import ArchiveNote from "./ArchiveNote";
import { trackEvent } from "@/lib/analytics";
import NextUp from "./NextUp";
import ScoreRank from "./ScoreRank";
import ShareButton from "./ShareButton";

const usd = (n: number) => (n >= 100 ? `$${Math.round(n)}` : `$${n.toFixed(2)}`);
const km = (n: number) => `${n.toLocaleString("en-US")} km`;

function levelText(level: number | null): string {
  if (level === null) return "";
  const pct = Math.round(Math.abs(level) * 100);
  if (pct < 5) return "Mystery prices about the same";
  return `Mystery ${pct}% ${level > 0 ? "pricier" : "cheaper"}`;
}

export default function PriceAtlas() {
  const [date, setDate] = useState<string | null>(null);
  const [state, setState] = useState<AtlasState | null>(null);
  const [archived, setArchived] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const past = archiveDate(window.location.search, EPOCH);
    const d = past ?? isoDate();
    setArchived(past !== null);
    setDate(d);
    setState(loadState(d, past ? archiveKey(KEY) : KEY));
  }, []);

  if (!date || !state) return <p className="min-h-[100svh] text-ink-muted">Loading today&apos;s puzzle…</p>;

  const p = puzzleFor(date);
  const over = isOver(p, state);
  const won = isWon(p, state);
  const misses = state.guesses.filter((g) => g !== p.answer.code).length;
  const clues = over ? p.clues : visibleClues(p, misses);
  const matches = matchCountries(query, state.guesses).slice(0, 6);
  const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));

  function guess(code: string) {
    if (!state || over || state.guesses.includes(code)) return;
    const next = { ...state, guesses: [...state.guesses, code] };
    setState(next);
    saveState(next, archived ? archiveKey(KEY) : KEY);
    setQuery("");
    if (isOver(p, next)) {
      trackEvent("atlas_complete", { won: isWon(p, next), guesses: next.guesses.length });
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (matches[0]) guess(matches[0].code);
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      {archived && <ArchiveNote date={date} href="/games/price-atlas" />}
      <figure className="border border-rule border-t-2 border-t-ink bg-paper-raised px-4 py-4">
        <figcaption className="label text-center">
          Price Atlas #{p.number} · {over ? `${p.answer.flag} ${p.answer.name}` : "Mystery country"}
        </figcaption>
        <ul className="mt-3 flex flex-col">
          {clues.map((c, i) => (
            <li
              key={c.itemId}
              className={`flex justify-between gap-3 border-b border-rule-soft py-2 text-[15px] ${
                !over && i >= visibleClues(p, Math.max(0, misses - 1)).length && misses > 0
                  ? "text-accent"
                  : "text-ink"
              }`}
            >
              <span>{c.label}</span>
              <span className="font-mono">{usd(c.priceUSD)}</span>
            </li>
          ))}
        </ul>
        {!over && clues.length < p.clues.length && (
          <p className="mt-2 text-center text-[13px] text-ink-muted">
            Each miss adds another price to the basket.
          </p>
        )}
      </figure>

      {state.guesses.length > 0 && (
        <ol className="flex flex-col gap-1.5" aria-label="Your guesses" aria-live="polite">
          {state.guesses.map((g) => {
            const c = byCode.get(g);
            const f = feedback(p, g);
            return (
              <li
                key={g}
                className="flex items-center justify-between gap-3 border-b border-rule-soft py-1.5 text-[14px]"
              >
                <span className="min-w-0 truncate">
                  {c?.flag} {c?.name}
                </span>
                <span className="shrink-0 text-right font-mono text-[13px]">
                  {f.km === 0 ? (
                    "🎯 Got it"
                  ) : (
                    <>
                      {km(f.km)} {f.arrow}
                      <span className="block text-[11px] text-ink-muted">{levelText(f.level)}</span>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {over ? (
        <div className="flex flex-col gap-3">
          <p className="text-[16px] text-ink-body">
            {won ? `Found it in ${result(p, state).split("/")[0]}. ` : ""}
            The basket was from <strong>{p.answer.name}</strong> {p.answer.flag}.
          </p>
          <ShareButton
            score={result(p, state)}
            text={(url) => shareText(p, state, url)}
            path="/games/price-atlas"
            event="atlas_share"
          />
          <p className="text-[13px] text-ink-muted">A new basket at your local midnight.</p>
          <ScoreRank game="price-atlas" name="Price Atlas" date={date} state={state} archived={archived} />
          <NextUp current="price-atlas" />
        </div>
      ) : (
        <form onSubmit={submit} className="relative flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              aria-label="Guess a country"
              placeholder="Type a country"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-0 flex-1 border border-rule bg-paper-raised px-3 py-2.5 text-ink"
            />
            <button
              type="submit"
              disabled={!matches[0]}
              className="bg-ink px-5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised disabled:opacity-40"
            >
              Guess
            </button>
          </div>
          {matches.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Matching countries">
              {matches.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => guess(c.code)}
                    className="border border-rule bg-paper-raised px-3 py-2 text-[14px] text-ink hover:bg-paper"
                  >
                    {c.flag} {c.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[13px] text-ink-muted">
            {MAX_GUESSES - state.guesses.length} guesses left. Distance and direction are measured
            capital to capital.
          </p>
        </form>
      )}

      <p className="text-[13px] leading-relaxed text-ink-muted">
        Prices are the same sourced figures as the daily Pricele puzzle, in U.S. dollars. See the{" "}
        <a className="underline" href="/methodology">
          methodology
        </a>{" "}
        for where each one comes from. The price comparison uses the items both countries have.
      </p>
    </div>
  );
}
