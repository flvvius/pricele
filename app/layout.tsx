import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Archivo, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import ThemeScript, { EDITION_THEME_COLOR } from "@/components/ThemeScript";
import { ADSENSE_CLIENT, ADSENSE_LOADER_SRC, adsEnabled } from "@/lib/ads";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  TITLE_DEFAULT,
  TITLE_TEMPLATE,
  gameJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

// Self-hosted and subset at build time, so there is no third-party font request
// and no layout shift. `display: swap` on the two text faces keeps first paint
// readable; the display face is only ever used at large sizes where a swap is
// less disruptive than invisible text.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE_DEFAULT,
    template: TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "games",
  keywords: [
    "pricele",
    "price guessing game",
    "daily game",
    "wordle-like game",
    "cost of living game",
    "guess the price",
    "global prices game",
    "price of coca-cola by country",
    "daily puzzle",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // No canonical here on purpose. Metadata is inherited, so a canonical set on
  // the layout is a canonical on every route that doesn't override it —
  // including 404s and any page whose generateMetadata bails out, all of which
  // would then declare themselves to be the home page. Each page sets its own
  // through pageMetadata(); a route that forgets now emits none, which is a far
  // better failure than a wrong one.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Site-wide fallback only; every page builds its own from pageMetadata(), and
  // Next.js replaces this object rather than merging into it when they do.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    images: [
      { url: "/og.svg", width: 1200, height: 630, alt: "Pricele — guess the price" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DEFAULT,
    description:
      "A free daily game: guess the price of an everyday item around the world in 5 tries. New country every day.",
    images: ["/og.svg"],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  // Set these env vars to verify ownership in the respective webmaster tools.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  // The browser chrome should match whichever edition the reader is in, so the
  // status bar never sits as a bright band above a dark page (or vice versa).
  // These cover the OS-preference case; once the reader picks an edition by
  // hand, ThemeScript/ThemeToggle overwrite both tags with the chosen colour.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: EDITION_THEME_COLOR.paper },
    { media: "(prefers-color-scheme: dark)", color: EDITION_THEME_COLOR.night },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  // Make the on-screen keyboard shrink the viewport instead of covering the
  // page, so the guess input stays visible while typing on mobile.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        {/* Google AdSense: verification meta + loader, on every page. Both are
            gated on a well-formed publisher id (enabled by default). */}
        {adsEnabled() && (
          <>
            <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
            <script async src={ADSENSE_LOADER_SRC} crossOrigin="anonymous" />
          </>
        )}
        <JsonLd data={[websiteJsonLd(), gameJsonLd()]} />
      </head>
      <body className="min-h-dvh bg-paper font-sans text-ink-body antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
