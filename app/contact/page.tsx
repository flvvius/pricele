import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import { SITE_NAME, SITE_EMAIL } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Contact",
  description: `How to get in touch with the ${SITE_NAME} team.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-neutral-100">Contact</h1>
        <p className="text-sm text-neutral-400">
          Questions, feedback, corrections, or a price that looks off? Get in
          touch.
        </p>
      </header>

      <section className="flex flex-col gap-3 text-sm leading-relaxed text-neutral-400">
        <p>
          The best way to reach {SITE_NAME} is by email. We read every message
          and try to reply within a few days.
        </p>
        <p>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="inline-block rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-2 font-semibold text-neutral-100 hover:border-neutral-700"
          >
            {SITE_EMAIL}
          </a>
        </p>
        <p>
          You can use this address for general questions, feedback about the
          game, reporting an inaccurate price, or advertising and partnership
          enquiries.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
