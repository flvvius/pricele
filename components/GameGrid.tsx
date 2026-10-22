import Link from "next/link";
import { GAMES } from "@/lib/games";

export default function GameGrid({ exclude }: { exclude?: string }) {
  const games = GAMES.filter((g) => g.slug !== exclude);
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {games.map((g) => (
        <li key={g.slug}>
          <Link
            href={g.href}
            className="group flex h-full flex-col gap-1.5 border border-rule border-t-2 border-t-ink bg-paper-raised px-4 py-4 transition-colors duration-fast ease-out hover:bg-paper"
          >
            <span className="display text-[1.4rem] text-ink group-hover:text-accent">{g.name}</span>
            <span className="text-[14px] leading-snug text-ink-body">{g.blurb}</span>
            <span className="mt-auto pt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              {g.source} · Play →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
