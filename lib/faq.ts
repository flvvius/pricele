// Homepage FAQ, authored once and rendered twice: as visible, crawlable HTML
// and as FAQPage JSON-LD. Written in plain language that mirrors how people
// actually search ("is pricele free", "how do you play pricele").

import type { FaqItem } from "@/lib/seo";
import { ITEM_NAME } from "@/lib/seo";

export const HOME_FAQ: FaqItem[] = [
  {
    question: "What is Pricele?",
    answer:
      "Pricele is a free daily browser game where you guess the price of an everyday item in a different country each day. This month the item is a " +
      ITEM_NAME +
      ". You get five tries and hotter/colder feedback after each guess.",
  },
  {
    question: "How do you play Pricele?",
    answer:
      "Each day you are shown one country and one item. Enter your best guess of the price in US dollars. After every guess Pricele tells you whether the real price is higher or lower and how close you are. Land within 10% of the real price to win. You have five guesses.",
  },
  {
    question: "Is Pricele free to play?",
    answer:
      "Yes. Pricele is completely free, needs no account or download, and runs in any web browser on phone or desktop.",
  },
  {
    question: "How often does Pricele update?",
    answer:
      "A new country goes live every day at midnight UTC, so everyone in the world plays the same puzzle. The featured item changes once a month.",
  },
  {
    question: "How are the prices decided?",
    answer:
      "Each country has one representative price in US dollars and its local currency, plus the average local wage that powers the reveal stat. Prices are rough estimates for a daily game, not shopping advice.",
  },
  {
    question: "Does Pricele save my streak?",
    answer:
      "Yes. Your daily results and streak are stored privately in your browser, so come back each day to keep your streak alive. Nothing is uploaded and no sign-in is required.",
  },
];
