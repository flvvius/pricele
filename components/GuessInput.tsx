"use client";

import { useState, type FormEvent } from "react";
import { toUSD, type Currency } from "@/lib/currency";
import CurrencyToggle from "./CurrencyToggle";

interface Props {
  disabled: boolean;
  remaining: number;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  /** Receives the guess in USD, whatever currency it was typed in. */
  onGuess: (usd: number) => void;
}

// Keep only digits and a single decimal separator. Allowing both "." and ","
// means the guess still parses on keyboards that only offer a comma.
function sanitize(raw: string): string {
  const cleaned = raw.replace(/[^0-9.,]/g, "");
  const sep = cleaned.search(/[.,]/);
  if (sep === -1) return cleaned;
  return cleaned.slice(0, sep + 1) + cleaned.slice(sep + 1).replace(/[.,]/g, "");
}

export default function GuessInput({
  disabled,
  remaining,
  currency,
  onCurrencyChange,
  onGuess,
}: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(value.replace(",", "."));
    if (!value.trim() || Number.isNaN(n) || n <= 0) {
      setError("Enter a price greater than 0.");
      return;
    }
    setError(null);
    setValue("");
    // The game is scored in dollars, so the typed figure is converted here and
    // nothing downstream has to care which currency it was entered in.
    onGuess(toUSD(n, currency));
  }

  // Switching currency mid-entry would silently reinterpret a half-typed number
  // with "6" meant as dollars becoming 6 euros, so the field is cleared.
  function changeCurrency(next: Currency) {
    if (next === currency) return;
    setValue("");
    setError(null);
    onCurrencyChange(next);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      {/* Field and button share one frame with a rule between them, so the pair
          reads as a single instrument rather than two floating controls. The
          frame, not the input, carries the focus state, which is why there is
          no ring stacked on top of a border here.

          The frame never recolours on an invalid guess: the status line below
          already says what is wrong, and aria-invalid carries it to assistive
          tech. */}
      <div className="flex items-stretch border border-rule bg-paper-raised transition-[border-color,box-shadow] duration-fast ease-out focus-within:border-ink focus-within:shadow-[inset_0_0_0_1px_rgb(var(--ink))]">
        <CurrencyToggle
          currency={currency}
          onChange={changeCurrency}
          disabled={disabled}
        />
        <input
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          autoComplete="off"
          autoFocus
          disabled={disabled}
          value={value}
          onChange={(e) => {
            setValue(sanitize(e.target.value));
            if (error) setError(null);
          }}
          placeholder="0.00"
          aria-label={
            currency === "EUR" ? "Your guess in euros" : "Your guess in US dollars"
          }
          aria-invalid={error ? true : undefined}
          // `outline-none` alone is not enough: the app-wide :focus-visible rule
          // in globals.css puts an offset accent ring on whatever has keyboard
          // focus, and this field is autofocused on load, so on a desk that ring
          // was drawn on top of the currency toggle sitting inside the same
          // frame. The frame's own focus-within border is the indicator here.
          className="w-full min-w-0 bg-transparent py-3.5 pl-2 pr-3 font-mono text-xl tabular-nums text-ink outline-none placeholder:text-ink-faint focus-visible:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          // Submitting is the most repeated action in the game, so it gets
          // press feedback and nothing else: no hover lift, no glow. The
          // scale is on transform only, which never touches layout.
          className="shrink-0 border-l border-rule bg-ink px-5 font-mono text-sm font-semibold uppercase tracking-[0.16em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.97] disabled:opacity-40"
        >
          Guess
        </button>
      </div>

      {/* One compact status line: the error replaces the hint when present, so
          the input block never changes height and the board doesn't jump. */}
      <p
        className={`text-center font-mono text-[11px] uppercase tracking-[0.14em] ${
          error ? "text-accent" : "text-ink-meta"
        }`}
        role={error ? "alert" : undefined}
      >
        {error ??
          `${remaining} ${remaining === 1 ? "guess" : "guesses"} left · win within 5%`}
      </p>
    </form>
  );
}
