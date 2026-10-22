"use client";

import { GAMES, lastDays, type ResultLog } from "@/lib/games";
import { dateFromISO } from "@/lib/puzzle";

const weekday = (iso: string) =>
  dateFromISO(iso).toLocaleDateString(undefined, { weekday: "narrow" });

export default function HubWeek({ log, today }: { log: ResultLog; today: string }) {
  const days = lastDays(today, 7);
  if (!days.some((d) => log[d])) return null;
  return (
    <section aria-labelledby="hub-week" className="flex flex-col gap-2">
      <h2 id="hub-week" className="label">
        Your last 7 days
      </h2>
      <table className="w-full table-fixed border-collapse text-center font-mono text-[11px]">
        <thead>
          <tr>
            <th className="w-[40%]" />
            {days.map((d) => (
              <th key={d} scope="col" className={`py-1 font-normal ${d === today ? "text-ink" : "text-ink-muted"}`}>
                <abbr title={d} className="no-underline">
                  {weekday(d)}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GAMES.map((g) => (
            <tr key={g.slug} className="border-t border-rule-soft">
              <th scope="row" className="truncate py-1.5 text-left font-normal text-ink-body">
                {g.name.replace(/ Daily$/, "")}
              </th>
              {days.map((d) => {
                const r = log[d]?.[g.slug];
                return (
                  <td key={d} className="py-1.5" title={r ?? "Not played"}>
                    {r ? (r.startsWith("X") ? "🟥" : "🟩") : <span className="text-rule">·</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
