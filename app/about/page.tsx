import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { SITE_NAME, SITE_EMAIL, ITEM_NAME } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Pricele is, how the daily price puzzle works, and where the price estimates come from.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-neutral-100">About {SITE_NAME}</h1>
        <p className="text-sm text-neutral-400">
          A free daily guessing game about the cost of living around the world.
        </p>
      </header>

      <section className="flex flex-col gap-3 text-sm leading-relaxed text-neutral-400">
        <h2 className="text-lg font-bold text-neutral-100">What it is</h2>
        <p>
          {SITE_NAME} is a quick, free browser game you can play once a day. Each
          day you are shown one country and one everyday item — currently a{" "}
          {ITEM_NAME} — and your job is to guess what it costs in US dollars. You
          get five tries, with hotter/colder hints after each guess, and you win
          by landing within 10% of the real price. A brand-new country goes live
          every day at your local midnight.
        </p>
        <p>
          If you enjoy Wordle, Globle, or other daily puzzles, {SITE_NAME}{" "}
          scratches the same itch: one short round a day, a streak to protect,
          and a result you can share with friends.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-sm leading-relaxed text-neutral-400">
        <h2 className="text-lg font-bold text-neutral-100">
          Where the prices come from
        </h2>
        <p>
          Prices are approximate, everyday retail figures compiled from publicly
          available cost-of-living data and converted to US dollars. They are
          meant to be reasonable ballpark values for a fun daily game — not
          exact, current, or location-specific quotes. Real prices vary by city,
          shop, brand, and season, so please treat the numbers as estimates for
          entertainment, not as shopping or financial advice.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-sm leading-relaxed text-neutral-400">
        <h2 className="text-lg font-bold text-neutral-100">Who makes it</h2>
        <p>
          {SITE_NAME} is an independent side project. Questions, corrections, or
          feedback are always welcome — email{" "}
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="text-neutral-200 underline hover:text-neutral-100"
          >
            {SITE_EMAIL}
          </a>{" "}
          or see the{" "}
          <Link
            href="/contact"
            className="text-neutral-200 underline hover:text-neutral-100"
          >
            contact page
          </Link>
          .
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
