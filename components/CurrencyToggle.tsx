"use client";

import { currencySymbol, type Currency } from "@/lib/currency";

const CURRENCIES: Currency[] = ["USD", "EUR"];

/**
 * A two-position segmented control, set into the guess field where the static
 * currency symbol used to sit.
 *
 * Both options are always visible rather than one tappable symbol that swaps.
 * A lone "$" reads as a caption, not a control, so a player who wants euros has
 * no reason to believe tapping it would do anything; showing the pair makes the
 * choice legible without spending a slot in the masthead on it.
 */
export default function CurrencyToggle({
  currency,
  onChange,
  disabled = false,
}: {
  currency: Currency;
  onChange: (currency: Currency) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Guess currency"
      className="flex shrink-0 items-center self-center gap-px pl-2"
    >
      {CURRENCIES.map((c) => {
        const active = c === currency;
        return (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => onChange(c)}
            aria-pressed={active}
            aria-label={c === "EUR" ? "Guess in euros" : "Guess in US dollars"}
            className={`px-1.5 py-1 font-mono text-[13px] leading-none transition-colors duration-fast ease-out disabled:opacity-40 ${
              active
                ? "bg-ink text-paper-raised"
                : "text-ink-faint hover:text-ink-body"
            }`}
          >
            {currencySymbol(c)}
          </button>
        );
      })}
    </div>
  );
}
