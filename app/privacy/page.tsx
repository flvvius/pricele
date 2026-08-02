import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SITE_NAME, SITE_URL, SITE_EMAIL } from "@/lib/seo";

export const dynamic = "force-static";

// Last substantive update. Bump when the policy content changes.
const LAST_UPDATED = "July 24, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles data, cookies, and advertising, including Google AdSense.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const host = SITE_URL.replace(/^https?:\/\//, "");
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-6">
      <SiteHeader />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-neutral-100">Privacy Policy</h1>
        <p className="text-xs text-neutral-500">Last updated: {LAST_UPDATED}</p>
      </header>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-neutral-400">
        <section className="flex flex-col gap-2">
          <p>
            This Privacy Policy explains how {SITE_NAME} (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;, or &ldquo;the site&rdquo;), available at {host},
            handles information when you play the game. By using the site you
            agree to the practices described here.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-100">
            Information we collect
          </h2>
          <p>
            {SITE_NAME} does not require an account and we do not ask you for
            personal information such as your name, email address, or payment
            details. We do not run our own analytics or tracking scripts.
          </p>
          <p>
            To make the game work, your progress — your guesses for the day, your
            win/loss result, your streak, and a couple of interface preferences —
            is saved locally in your own browser using{" "}
            <code className="text-neutral-300">localStorage</code>. This data
            stays on your device, is not transmitted to us, and you can clear it
            at any time through your browser settings.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-100">
            Cookies and advertising
          </h2>
          <p>
            {SITE_NAME} is supported by advertising served through{" "}
            <strong className="text-neutral-300">Google AdSense</strong>, a
            third-party advertising service provided by Google. To show ads,
            Google and its partners may use cookies and similar technologies.
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            <li>
              Third-party vendors, including Google, use cookies to serve ads
              based on your prior visits to this and other websites.
            </li>
            <li>
              Google&rsquo;s use of advertising cookies enables it and its
              partners to serve ads to you based on your visits to {SITE_NAME}{" "}
              and/or other sites on the Internet.
            </li>
            <li>
              You can opt out of personalized advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-200 underline hover:text-neutral-100"
              >
                Google Ads Settings
              </a>
              . You can also opt out of some third-party vendors&rsquo; use of
              cookies for personalized advertising at{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-200 underline hover:text-neutral-100"
              >
                aboutads.info
              </a>
              .
            </li>
          </ul>
          <p>
            For more information about how Google uses data when you use our
            site, see{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-200 underline hover:text-neutral-100"
            >
              Google&rsquo;s Privacy &amp; Terms
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-100">
            Consent for EEA, UK, and Switzerland
          </h2>
          <p>
            If you are visiting from the European Economic Area, the United
            Kingdom, or Switzerland, you will be shown a consent message before
            personalized ads are served. You can choose to accept, decline, or
            manage your options, and you may change your choice at any time.
            Where required, non-personalized ads may be shown if you decline
            consent.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-100">
            Your choices
          </h2>
          <p>
            You can control or delete cookies through your browser settings and
            clear the locally stored game data at any time. Blocking cookies may
            affect the ads you see but will not stop you from playing the game.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-100">
            Children&rsquo;s privacy
          </h2>
          <p>
            {SITE_NAME} is a general-audience game and is not directed at
            children under the age of 13. We do not knowingly collect personal
            information from children.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-100">
            Changes to this policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we
            will revise the &ldquo;Last updated&rdquo; date at the top of this
            page. Continued use of the site after changes take effect means you
            accept the revised policy.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-100">Contact</h2>
          <p>
            If you have any questions about this Privacy Policy, email us at{" "}
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="text-neutral-200 underline hover:text-neutral-100"
            >
              {SITE_EMAIL}
            </a>{" "}
            or visit the{" "}
            <Link
              href="/contact"
              className="text-neutral-200 underline hover:text-neutral-100"
            >
              contact page
            </Link>
            .
          </p>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
