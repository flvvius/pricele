"use client";

import { useState, type FormEvent } from "react";

interface Props {
  disabled: boolean;
  remaining: number;
  onGuess: (value: number) => void;
}

export default function GuessInput({ disabled, remaining, onGuess }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(value);
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
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            autoFocus
            disabled={disabled}
            value={value}
            onChange={(e) => setValue(e.target.value)}
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
