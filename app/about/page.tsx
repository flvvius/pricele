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
          {SITE_NAME} is a quick, free browser game you play once a day. Each day
          you get one country and one everyday item (right now it&apos;s a{" "}
          {ITEM_NAME}), and you try to guess what it costs in US dollars. You get
          five tries, with higher-or-lower hints after each guess, and you win if
          you land within 5% of the real price. The country changes every day at
          midnight your time.
        </p>
        <p>
          If you like Wordle or Globle, this is the same kind of thing: a short
          daily puzzle and a streak you&apos;ll want to keep going. When
          you&apos;re done, you can share your result with friends.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-sm leading-relaxed text-neutral-400">
        <h2 className="text-lg font-bold text-neutral-100">
          Where the prices come from
        </h2>
        <p>
          The prices are everyday retail figures put together from publicly
          available cost-of-living data and converted to US dollars. They&apos;re
          meant to be sensible ballpark numbers for a fun game, not exact or
          up-to-the-minute quotes. Real prices change a lot depending on the city,
          the shop, the brand, and the time of year, so treat the numbers here as
          estimates for fun rather than shopping or financial advice.
        </p>
      </section>

      <section className="flex flex-col gap-3 text-sm leading-relaxed text-neutral-400">
        <h2 className="text-lg font-bold text-neutral-100">Who makes it</h2>
        <p>
          {SITE_NAME} is an independent side project. If you have a question,
          spot a mistake, or just want to say hi, email{" "}
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
