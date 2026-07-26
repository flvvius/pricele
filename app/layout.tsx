import type { Metadata, Viewport } from "next";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { ADSENSE_CLIENT, ADSENSE_LOADER_SRC, adsEnabled } from "@/lib/ads";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  gameJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pricele — Guess the Price, a New Country Daily",
    template: "%s · Pricele",
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
  alternates: {
    canonical: "/",
  },
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Pricele — Guess the Price, a New Country Daily",
    description: SITE_DESCRIPTION,
    images: [
      { url: "/og.svg", width: 1200, height: 630, alt: "Pricele — guess the price" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricele — Guess the Price, a New Country Daily",
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
  themeColor: "#171717",
  colorScheme: "dark",
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
    <html lang="en">
      <head>
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
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
