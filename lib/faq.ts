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
      "Each day you get one country and one item. Type in your best guess of the price in US dollars. After every guess, Pricele tells you whether the real price is higher or lower and how close you got. Land within 5% of the real price to win. You have five guesses.",
  },
  {
    question: "Is Pricele free to play?",
    answer:
      "Yes, it's completely free. You don't need an account or a download, and it works in any browser on your phone or computer.",
  },
  {
    question: "How often does Pricele update?",
    answer:
      "The country changes every day at midnight your time, so there's a new puzzle each morning. The item itself changes about once a month.",
  },
  {
    question: "How are the prices decided?",
    answer:
      "Each country has one representative price, shown in US dollars and the local currency, along with the average local wage used for the reveal stat. The prices are rough estimates for a daily game, not shopping advice.",
  },
  {
    question: "Does Pricele save my streak?",
    answer:
      "Yes. Your results and streak are saved right in your browser, so just play each day to keep the streak going. Nothing gets uploaded and there's no sign-in.",
  },
];
