"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function YearPicker({ years, initial }: { years: number[]; initial: number }) {
  const router = useRouter();
  const [year, setYear] = useState(initial);

  function go(e: React.FormEvent) {
    e.preventDefault();
    trackEvent("years_pick", { year });
    router.push(`/years/${year}`);
  }

  return (
    <form onSubmit={go} className="flex max-w-md items-stretch gap-2">
      <label className="flex flex-1 flex-col gap-1">
        <span className="label">Year you were born</span>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          data-testid="year-picker"
          className="border border-rule bg-paper-raised px-3 py-3 font-mono text-[1.1rem] text-ink focus:border-ink focus:outline-none"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="self-end bg-ink px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
      >
        Show me
      </button>
    </form>
  );
}
