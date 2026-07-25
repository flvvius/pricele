import Game from "@/components/Game";
import FaqSection from "@/components/FaqSection";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { HOME_FAQ } from "@/lib/faq";
import { faqJsonLd, ITEM_NAME } from "@/lib/seo";

// Statically generated (SSG): this renders to real HTML at build time for SEO,
// then <Game/> hydrates and takes over client-side. The prose and FAQ below are
// server-rendered so crawlers and AI answer engines read them without running JS.
export const dynamic = "force-static";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-10 px-4 py-6">
      <Game />

      <section aria-labelledby="about-heading" className="flex flex-col gap-3">
        <h2 id="about-heading" className="text-lg font-bold text-neutral-100">
          A new price puzzle every day
        </h2>
        <p className="text-sm text-neutral-400">
          Pricele is a free daily game about what things cost around the world.
          Every day you get one country and one everyday item (a {ITEM_NAME} this
          month), and you try to guess the price in US dollars. You get five
          guesses, with higher-or-lower hints along the way, and you win if you
          land within 5% of the real price. The country changes every day at
          midnight your time, so there&apos;s always a fresh one waiting when you
          wake up.
        </p>
        <p className="text-sm text-neutral-400">
          If you play Wordle or Globle, it&apos;s the same kind of thing: a quick
          puzzle you do once a day, plus a streak you&apos;ll want to keep going.
          Check back tomorrow for a new country.
        </p>
      </section>

      <FaqSection items={HOME_FAQ} />

      <SiteFooter />

      <JsonLd data={faqJsonLd(HOME_FAQ)} />
    </main>
  );
}
