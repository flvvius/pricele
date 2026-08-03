import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/**
 * Shell for every non-game page. The game owns the viewport and has its own
 * chrome; everything else is a normal scrolling document with nav, a title
 * block and a footer, so the reading experience is consistent site-wide.
 *
 * Wider than the game column (max-w-2xl vs max-w-md) because these pages carry
 * tables that need the room.
 */
export default function ContentPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-4 py-6">
      <SiteHeader />
      <main className="flex flex-1 flex-col gap-8">
        <div className="flex flex-col gap-4">
          {/* Set at broadsheet scale with the display face. A page title is the
              one place on a reference page that gets to be loud. */}
          <h1 className="display text-[2.5rem] text-ink sm:text-[3.25rem]">
            {title}
          </h1>
          {intro && (
            <div className="flex max-w-prose flex-col gap-3 text-[15px] leading-relaxed text-ink-muted">
              {intro}
            </div>
          )}
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** A titled block of prose or a table. Keeps section spacing uniform. */
export function Section({
  heading,
  children,
  id,
}: {
  heading: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} aria-labelledby={id ?? undefined} className="flex flex-col gap-4">
      <h2 className="display text-[1.75rem] text-ink">{heading}</h2>
      {children}
    </section>
  );
}

/** Body copy. Used everywhere so paragraph rhythm matches across pages. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="flex max-w-prose flex-col gap-3.5 text-[15px] leading-[1.7] text-ink-body">
      {children}
    </div>
  );
}
