"use client";

import { useState, type FormEvent } from "react";

interface Props {
  disabled: boolean;
  remaining: number;
  onGuess: (value: number) => void;
}

// Keep only digits and a single decimal separator. Allowing both "." and ","
// means the guess still parses on keyboards that only offer a comma.
function sanitize(raw: string): string {
  const cleaned = raw.replace(/[^0-9.,]/g, "");
  const sep = cleaned.search(/[.,]/);
  if (sep === -1) return cleaned;
  return cleaned.slice(0, sep + 1) + cleaned.slice(sep + 1).replace(/[.,]/g, "");
}

export default function GuessInput({ disabled, remaining, onGuess }: Props) {
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
    onGuess(n);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            $
          </span>
          <input
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            autoFocus
            disabled={disabled}
            value={value}
            onChange={(e) => setValue(sanitize(e.target.value))}
            placeholder="Your guess in USD"
            aria-label="Your guess in USD"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-3 pl-7 pr-3 text-lg tabular-nums outline-none focus:border-neutral-400 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-white px-5 py-3 font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-40"
        >
          Guess
        </button>
      </div>
      <p className="min-h-5 text-sm text-red-400" role="alert">
        {error ?? ""}
      </p>
      <p className="text-center text-sm text-neutral-500">
        {remaining} {remaining === 1 ? "guess" : "guesses"} left
      </p>
    </form>
  );
}
