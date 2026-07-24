import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://pricele.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Pricele — the daily price guessing game",
  description:
    "Guess the price of an everyday item around the world in 5 tries. A new country every day. How well do you know global prices?",
  keywords: [
    "price guessing game",
    "daily game",
    "wordle-like",
    "cost of living game",
    "guess the price",
  ],
  openGraph: {
    title: "Pricele — the daily price guessing game",
    description:
      "Guess the price of an everyday item around the world in 5 tries. A new country every day.",
    url: SITE_URL,
    siteName: "Pricele",
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Pricele" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricele — the daily price guessing game",
    description:
      "Guess the price of an everyday item around the world in 5 tries.",
    images: ["/og.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
