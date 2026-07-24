import Link from "next/link";
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
          Pricele is a free daily guessing game about the cost of living around
          the world. Each day you are shown one country and one everyday item —
          this month a {ITEM_NAME} — and your job is to guess what it costs in US
          dollars. You have five tries, with hotter/colder hints after each
          guess, and you win by landing within 10% of the real price. A brand-new
          country goes live every day at your local midnight, so a fresh puzzle is
          always waiting at the start of your day.
        </p>
        <p className="text-sm text-neutral-400">
          If you like Wordle, Globle, or other daily games, Pricele scratches the
          same itch: one quick puzzle a day, a streak to protect, and a result
          you can share. Curious how much things cost elsewhere? Browse the{" "}
          <Link href="/prices" className="text-neutral-200 underline underline-offset-2">
            price of a {ITEM_NAME} in every country
          </Link>
          .
        </p>
      </section>

      <FaqSection items={HOME_FAQ} />

      <SiteFooter />

      <JsonLd data={faqJsonLd(HOME_FAQ)} />
    </main>
  );
}
