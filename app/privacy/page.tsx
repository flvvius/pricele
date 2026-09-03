import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SITE_NAME, SITE_URL, SITE_EMAIL, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

// Last substantive update. Bump when the policy content changes.
const LAST_UPDATED = "August 16, 2026";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles data, cookies, and advertising, including Google AdSense.`,
});

/**
 * One clause of the policy. Every heading on the page is the same size and
 * weight, so it is said once here.
 *
 * From lg up the heading moves into a left rail beside its copy, matching the
 * reference pages; below lg it is the same plain gap-2 stack it has always
 * been. The opening clause has no heading and holds the rail column empty.
 */
function Clause({
  heading,
  children,
}: {
  heading?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12">
      {heading ? (
        <h2 className="display text-[1.75rem] text-ink">{heading}</h2>
      ) : (
        <div aria-hidden className="hidden lg:block" />
      )}
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

/** Shared by the outbound policy links and the two internal ones. */
const POLICY_LINK =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

export default function PrivacyPage() {
  const host = SITE_URL.replace(/^https?:\/\//, "");
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-6 lg:max-w-5xl">
      <SiteHeader />
      <header className="flex flex-col gap-2 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12">
        <h1 className="display text-[2.75rem] text-ink lg:col-span-2">
          Privacy Policy
        </h1>
        <p className="label lg:col-start-2">Last updated: {LAST_UPDATED}</p>
      </header>

      <div className="flex flex-col gap-6 text-base leading-relaxed text-neutral-400">
        <Clause>
          <p>
            This Privacy Policy explains how {SITE_NAME} (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;, or &ldquo;the site&rdquo;), available at {host},
            handles information when you play the game. By using the site you
            agree to the practices described here.
          </p>
        </Clause>

        <Clause heading="Information we collect">
          <p>
            {SITE_NAME} does not require an account and we do not ask you for
            personal information such as your email address or payment
            details. There is no sign-in and no profile. Two features ask for
            something and both are optional: the classroom asks for a display
            name, and the reveal can ask which country you live in.
          </p>
          <p>
            We do use{" "}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className={POLICY_LINK}
            >
              Vercel Web Analytics and Speed Insights
            </a>{" "}
            to see which pages are read and how quickly they load. These are
            cookieless and do not track visitors across sites or build a profile
            of you: each page view is recorded with the page address, a coarse
            country, and technical details such as browser and screen size, from
            which Vercel derives a temporary, non-reversible identifier that is
            discarded within the day. We see totals, never individuals.
          </p>
          <p>
            To make the game work, your progress (your guesses for the day, your
            win/loss result, your streak, and a couple of interface preferences)
            is saved locally in your own browser using{" "}
            <code className="font-mono text-[14px] text-ink">localStorage</code>. This data
            stays on your device and you can clear it at any time through your
            browser settings.
          </p>
          <p>
            When you finish a puzzle, five numbers are sent to us so the reveal
            can tell you how the rest of the field did: the date, the item, the
            country, your opening bid, and how close your best bid landed. They
            are added to that day&apos;s running totals rather than stored as a
            row about you. If you have told us which country you live in, that
            two-letter code is added as well, which is what makes the
            &ldquo;players in your country misjudge their own prices by X&rdquo;
            figure possible. Telling us is optional, it is asked once, and
            declining is a complete answer.
          </p>
          <p>
            One further thing is sent: a random string your browser makes up
            about itself the first time you play. Its only job is to stop the
            same browser being counted twice in a day, and to know whether you
            have bid in a classroom yet. It is not derived from anything about
            you or your device, it is never attached to your bids in the daily
            totals, and clearing your site data replaces it.
          </p>
          <p>
            <strong className="font-semibold text-ink">Classrooms</strong> work
            differently, and have to. A room board shows who bid what, so it
            cannot be aggregate. Joining one stores the display name you typed
            and that day&apos;s bids against a room code, visible to everyone
            else in that room. Rooms are deleted on a timer. Do not put anything
            in the name field you would not read out to the class.
          </p>
        </Clause>

        <Clause heading="Cookies and advertising">
          <p>
            {SITE_NAME} is supported by advertising served through{" "}
            <strong className="font-semibold text-ink">Google AdSense</strong>, a
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
                className={POLICY_LINK}
              >
                Google Ads Settings
              </a>
              . You can also opt out of some third-party vendors&rsquo; use of
              cookies for personalized advertising at{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className={POLICY_LINK}
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
              className={POLICY_LINK}
            >
              Google&rsquo;s Privacy &amp; Terms
            </a>
            .
          </p>
        </Clause>

        <Clause heading="Consent for EEA, UK, and Switzerland">
          <p>
            If you are visiting from the European Economic Area, the United
            Kingdom, or Switzerland, a consent message is shown before
            personalized ads are served. It is delivered by Google&rsquo;s own
            consent management platform, which is certified against the IAB
            Transparency and Consent Framework, and it is the mechanism that
            records your choice for every advertising partner at once.
          </p>
          <p>
            You can accept, decline, or manage individual purposes and vendors,
            and you can change your mind at any time: the{" "}
            <strong className="font-semibold text-ink">
              Cookie preferences
            </strong>{" "}
            link in the footer of every page reopens the same message. If you
            decline, non-personalized ads may be shown instead, and the game
            works exactly as it did before.
          </p>
        </Clause>

        <Clause heading="Legal bases for processing">
          <p>
            Where the GDPR or UK GDPR applies, the legal bases are as follows.
            Personalized advertising and the cookies it requires rest on your{" "}
            <strong className="font-semibold text-ink">consent</strong>, given
            through the message described above and withdrawable at any time.
            Serving the site itself, keeping it secure, and measuring aggregate
            page performance rest on our{" "}
            <strong className="font-semibold text-ink">
              legitimate interest
            </strong>{" "}
            in running a working website. The end-of-round figures folded into
            the daily totals rest on the same legitimate interest, and they are
            aggregated on arrival rather than stored and summed later. Joining a
            classroom rests on your acting to join one: you type a code and a
            name, and nothing is posted to a board you have not entered. Your
            saved progress, your streak and your history are processed by us not
            at all, because those never leave your device.
          </p>
        </Clause>

        <Clause heading="Retention and transfers">
          <p>
            What we hold is counters. There is no per-person record on our side
            to export or correct, because there is no record of you as an
            individual to find: no IP addresses, no user agents, no accounts, no
            bid history. Classroom rooms are the one exception and they are
            swept on a timer. Game progress stays in your browser until you
            clear it. Email you
            send us is kept in the mailbox it arrived in for as long as it takes
            to answer, and correspondence about a correction is kept as a record
            of the change.
          </p>
          <p>
            Google and the advertising vendors you consent to operate globally
            and set their own retention periods, which are described in their
            own policies. That processing may involve transfers outside your
            country, made under the safeguards those companies publish.
          </p>
        </Clause>

        <Clause heading="Your rights">
          <p>
            Depending on where you live, you have rights to access, correct,
            delete, port, or object to the processing of your personal data, and
            to withdraw consent at any time without affecting processing already
            carried out. Residents of California and other US states with similar
            laws additionally have the right to opt out of the sale or sharing of
            personal information; the consent controls above are how that choice
            is exercised here.
          </p>
          <p>
            Because {SITE_NAME} keeps no account, no profile and no user
            database, most requests of this kind concern data held by Google
            rather than by us, and are best made through Google&rsquo;s own
            controls. Write to us anyway if you are unsure and we will point you
            at the right place. If you believe your data has been mishandled, you
            may also complain to your local data protection authority.
          </p>
        </Clause>

        <Clause heading="Your choices">
          <p>
            You can control or delete cookies through your browser settings and
            clear the locally stored game data at any time. Blocking cookies may
            affect the ads you see but will not stop you from playing the game.
          </p>
          <p>
            Browser-level signals are respected where the ad stack supports them,
            including Global Privacy Control, which Google treats as an opt-out
            of the sale and sharing of personal information in the US states that
            recognise it.
          </p>
        </Clause>

        <Clause heading="Children’s privacy">
          <p>
            {SITE_NAME} is a general-audience game and is not directed at
            children under the age of 13. We do not knowingly collect personal
            information from children.
          </p>
        </Clause>

        <Clause heading="Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we
            will revise the &ldquo;Last updated&rdquo; date at the top of this
            page. Continued use of the site after changes take effect means you
            accept the revised policy.
          </p>
        </Clause>

        <Clause heading="Contact">
          <p>
            If you have any questions about this Privacy Policy, email us at{" "}
            <a
              href={`mailto:${SITE_EMAIL}`}
              className={POLICY_LINK}
            >
              {SITE_EMAIL}
            </a>{" "}
            or visit the{" "}
            <Link
              href="/contact"
              className={POLICY_LINK}
            >
              contact page
            </Link>
            .
          </p>
        </Clause>
      </div>

      <SiteFooter />
    </main>
  );
}
