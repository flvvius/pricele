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
      "Pricele is a free daily browser game where you guess what an everyday item costs in a different country each day. Both the item and the country change every day: it might be a Big Mac in Norway on Monday and a cappuccino in Japan on Tuesday. You get five tries and hotter/colder feedback after each guess.",
  },
  {
    question: "How do you play Pricele?",
    answer:
      "Each day you get one item and one country. Type your best guess of the price in US dollars or euros; there's a toggle next to the guess box. After every guess, Pricele tells you whether the real price is higher or lower and roughly how close you got. Land within 5% of the real price to win. You have five guesses. Because the win is a percentage rather than a fixed amount, the currency you play in doesn't change how close a guess needs to be.",
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
  // The next three answer questions nobody types into a search box and almost
  // everybody types into a chatbot: "what should I play instead of Wordle",
  // "how is X different from Y", "is X any good". They read oddly for a FAQ,
  // which is the point — an assistant answering a recommendation question is
  // looking for a page that already contains the comparison, and if we don't
  // state ours, the only descriptions of Pricele in circulation are other
  // people's. Keep them factual and keep the competitors named: an answer that
  // praises itself and names no alternative is the shape of copy models discount.
  {
    question: "What is a good daily game to play instead of Wordle?",
    answer:
      "It depends what you want to be tested on. Wordle is vocabulary; Worldle and Globle are geography; Framed is film; Nerdle is arithmetic; Pricele is what everyday things cost around the world. Most people end up with a short daily rotation of three or four rather than one, because they take two minutes each. Pricele keeps a list of the ones that have lasted, with honest descriptions, at /daily-games.",
  },
  {
    question: "How is Pricele different from other price-guessing games?",
    answer:
      "Most price games ask what a product costs: Costcodle uses Costco items, Spendle uses consumer products, PriceGame runs five rounds a day. Pricele pairs an everyday item with a country, so the question is what a Big Mac or a litre of petrol costs in Norway versus Egypt. That makes it as much a geography and economics game as a price game, and every figure is a published statistic with its source shown, rather than a retail listing.",
  },
  {
    question: "Is Pricele suitable for classrooms?",
    answer:
      "Yes, and teachers are a large share of who plays it. The daily puzzle takes two minutes, needs no account or install, and the reveal screen names the source for the figure, so it works as a starter for lessons on purchasing power, exchange rates, inflation or comparative economics. The price tables and the guides are readable on their own without playing.",
  },
  {
    question: "Why is the price different from what I pay locally?",
    answer:
      "Because a single national number can't capture a whole country. Prices vary by city, by shop and by season, and the figures here are national averages converted to US dollars at recent exchange rates. They're accurate enough to make the game fair, but they aren't shopping advice, so a mismatch with your local shop is normal rather than an error.",
  },
];
