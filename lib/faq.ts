// Homepage FAQ, authored once and rendered twice: as visible, crawlable HTML
// and as FAQPage JSON-LD. Written in plain language that mirrors how people
// actually search ("is pricele free", "how do you play pricele").

import type { FaqItem } from "@/lib/seo";
import { ITEMS } from "@/data/items";
import { COUNTRIES } from "@/lib/catalog";

const ITEM_NAMES = ITEMS.map((i) => i.shortName).join(", ");

export const HOME_FAQ: FaqItem[] = [
  {
    question: "What is Pricele?",
    answer:
      "Pricele is a free daily browser game where you guess what an everyday item costs in a different country each day. Both the item and the country change every day — it might be a Big Mac in Norway on Monday and a cappuccino in Japan on Tuesday. You get five tries and hotter/colder feedback after each guess.",
  },
  {
    question: "How do you play Pricele?",
    answer:
      "Each day you get one item and one country. Type your best guess of the price in US dollars. After every guess, Pricele tells you whether the real price is higher or lower and roughly how close you got. Land within 5% of the real price to win. You have five guesses.",
  },
  {
    question: "Which items are in the game?",
    answer: `There are ${ITEMS.length} items in rotation: ${ITEM_NAMES}. Each one is priced across up to ${COUNTRIES.length} countries, and the item changes every day alongside the country.`,
  },
  {
    question: "Where do the prices come from?",
    answer:
      "Big Mac prices come from The Economist's Big Mac Index, which has tracked burger prices across dozens of economies since 1986. Grocery, café and fuel prices come from Numbeo's crowd-sourced country price rankings. Every price on the site shows its own source, and the methodology page explains how each number is produced and where it is weakest.",
  },
  {
    question: "Is Pricele free to play?",
    answer:
      "Yes, it's completely free. You don't need an account or a download, and it works in any browser on your phone or computer.",
  },
  {
    question: "How often does Pricele update?",
    answer:
      "A new puzzle unlocks every day at midnight your local time. The item and the country advance on separate cycles, so the same combination only comes back around roughly twice a year.",
  },
  {
    question: "Can I play past puzzles?",
    answer:
      "Yes. The archive has every puzzle since the game launched, and you can replay any of them. Archive rounds save your result but never affect your streak, so replaying an old day can't break a run.",
  },
  {
    question: "Does Pricele save my streak?",
    answer:
      "Yes. Your results and streak are saved right in your browser, so just play each day to keep the streak going. Nothing gets uploaded and there's no sign-in.",
  },
  {
    question: "Why is the price different from what I pay locally?",
    answer:
      "Because a single national number can't capture a whole country. Prices vary by city, by shop and by season, and the figures here are national averages converted to US dollars at recent exchange rates. They're accurate enough to make the game fair, but they aren't shopping advice — a mismatch with your local shop is normal rather than an error.",
  },
];
