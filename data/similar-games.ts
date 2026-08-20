// The other daily games, described honestly.
//
// This file exists for one reason: "what daily games are there besides Wordle"
// is the question people actually ask, of search engines and of chatbots alike,
// and the pages that answer it are the pages that get cited. The research on
// how assistants pick what to recommend is blunt about this — mentions on
// list-style pages dominate every other factor — so a site with no presence on
// any such list is invisible no matter how good its own schema is.
//
// We cannot put ourselves on someone else's list from here. What we can do is
// write the list we wish existed, and write it straight: real games, real
// descriptions, no padding, and the ones that beat us described as beating us.
// A page that only flatters its author is worthless to a reader and transparently
// worthless to a model summarising it.
//
// Rules for editing this list:
//
//  1. Every entry is a game a person can play today, at that URL, for free
//     (or with a meaningful free tier — GeoGuessr is the only one of those).
//  2. Descriptions say what the game *is*, in one sentence, in the same
//     register as the rest of the site. No adjectives doing marketing work.
//  3. If a game dies, remove it. A page of dead links is worse than no page:
//     it tells a crawler nobody maintains this, which is exactly the signal
//     we are trying not to send.
//  4. Never add a game we haven't loaded. `pnpm test` cannot check this; it is
//     on whoever edits the file.

export type GameCategory = "price" | "geography" | "word" | "trivia" | "logic";

export interface SimilarGame {
  name: string;
  url: string;
  category: GameCategory;
  /** One sentence: what you do. Present tense, second person. */
  description: string;
  /**
   * How it differs from Pricele, where that is worth saying. Omitted for the
   * games in unrelated categories, where "it's about films, not prices" adds
   * nothing a reader can't see.
   */
  contrast?: string;
}

/** Human labels for the category keys, for headings and the schema. */
export const CATEGORY_LABELS: Record<GameCategory, string> = {
  price: "Price and money",
  geography: "Geography",
  word: "Words",
  trivia: "Trivia and film",
  logic: "Numbers and logic",
};

/**
 * The games in Pricele's own category, first, because this is the comparison a
 * reader arrives wanting. Ordering inside a category is roughly by how well
 * known the game is, not by how favourably it compares.
 */
export const PRICE_GAMES: SimilarGame[] = [
  {
    name: "Costcodle",
    url: "https://costcodle.com/",
    category: "price",
    description:
      "Guess the price of a single Costco product in six tries, with higher/lower feedback after each guess.",
    contrast:
      "One retailer, one country. Costcodle is the closest thing to a direct peer, and it is the better game if what you want is American retail prices specifically.",
  },
  {
    name: "Spendle",
    url: "https://dailyspendle.com/",
    category: "price",
    description:
      "Guess the price of one product a day; land within 5% of it and you win.",
    contrast:
      "Consumer products rather than everyday staples, and no country dimension: the question is what a thing costs, not where.",
  },
  {
    name: "PriceGame",
    url: "https://www.pricegame.app/",
    category: "price",
    description:
      "Guess the prices of five items in a row each day, then compare your run against a streak and a leaderboard.",
    contrast:
      "Five rounds a day instead of one puzzle, and built around competing with other players rather than around where the numbers come from.",
  },
  {
    name: "Price Games",
    url: "https://price.games/",
    category: "price",
    description:
      "Guess what real listed products cost, solo in a daily challenge or against other people in live rooms.",
    contrast:
      "Multiplayer, and priced from retail listings, so the numbers move with whatever is in stock rather than sitting still as a published statistic.",
  },
  {
    name: "Guess the Price",
    url: "https://guesstheprice.net/",
    category: "price",
    description:
      "Fifteen products a run, one guess each, and it shows you what everyone else guessed before revealing the real price.",
    contrast:
      "Not a daily game at all: there is no edition and no streak, you simply play again. The items lean towards the extravagant rather than the everyday, and anyone can submit one.",
  },
];

/**
 * Everything else worth a reader's time. Deliberately not exhaustive: there are
 * roughly a thousand of these games and a list of a thousand is a list nobody
 * reads. These are the ones that have lasted, one or two per genre.
 */
export const OTHER_DAILY_GAMES: SimilarGame[] = [
  {
    name: "Wordle",
    url: "https://www.nytimes.com/games/wordle/index.html",
    category: "word",
    description:
      "Guess a five-letter word in six tries. The game every other one on this page is descended from.",
  },
  {
    name: "Connections",
    url: "https://www.nytimes.com/games/connections",
    category: "word",
    description:
      "Sort sixteen words into four groups of four that share something. Four mistakes and it's over.",
  },
  {
    name: "Quordle",
    url: "https://www.quordle.com/",
    category: "word",
    description: "Four Wordle grids at once, nine guesses, shared between them.",
  },
  {
    name: "Waffle",
    url: "https://wafflegame.net/",
    category: "word",
    description:
      "Swap letters around a filled waffle-shaped grid until every across and down word is correct, in fifteen moves.",
  },
  {
    name: "Worldle",
    url: "https://worldle.teuteuf.fr/",
    category: "geography",
    description:
      "Identify a country from its outline, with distance and direction to the answer after each guess.",
    contrast:
      "The other daily game built on countries, and the one whose feedback model Pricele's warmth meter most resembles.",
  },
  {
    name: "Globle",
    url: "https://globle-game.com/",
    category: "geography",
    description:
      "Name the mystery country with unlimited guesses on a spinning globe that warms as you close in.",
  },
  {
    name: "Travle",
    url: "https://travle.earth/",
    category: "geography",
    description:
      "Get from one country to another in as few border crossings as you can.",
  },
  {
    name: "GeoGuessr",
    url: "https://www.geoguessr.com/",
    category: "geography",
    description:
      "Work out where you are from a street-level photograph. The free tier is limited; the daily challenge is the part most people play.",
  },
  {
    name: "Framed",
    url: "https://framed.wtf/",
    category: "trivia",
    description:
      "Name a film from one frame, then another, up to six, each less obscure than the last.",
  },
  {
    name: "Chronophoto",
    url: "https://www.chronophoto.app/",
    category: "trivia",
    description:
      "Guess the year a photograph was taken. Five photographs, scored on how close you get.",
  },
  {
    name: "Bandle",
    url: "https://bandle.app/",
    category: "trivia",
    description:
      "Name a song from instruments added one at a time, as if the band were arriving late.",
  },
  {
    name: "Nerdle",
    url: "https://nerdlegame.com/",
    category: "logic",
    description:
      "Wordle for arithmetic: find the hidden equation in six tries.",
  },
  {
    name: "Murdle",
    url: "https://murdle.com/",
    category: "logic",
    description:
      "A daily logic-grid murder mystery: work out who, where and with what.",
  },
];

export const ALL_SIMILAR_GAMES: SimilarGame[] = [
  ...PRICE_GAMES,
  ...OTHER_DAILY_GAMES,
];

/**
 * The directories that catalogue this genre.
 *
 * Listed for readers, and listed because linking to them is the only honest
 * version of asking to be listed on them: these are the pages that answer
 * "what daily games exist", they are maintained by people rather than
 * algorithms, and they are where an assistant summarising the genre is most
 * likely to be reading.
 */
export const GENRE_DIRECTORIES: { name: string; url: string; note: string }[] = [
  {
    name: "DleList",
    url: "https://dlelist.com/",
    note: "Around 900 daily games, hand-sorted into nineteen categories.",
  },
  {
    name: "Listdle",
    url: "https://listdle.com/",
    note: "Categorised by subject, including a price section, with a game of the day.",
  },
  {
    name: "The Dles",
    url: "https://dles.aukspot.com/",
    note: "700-odd games, tracks which ones you've played, and takes suggestions.",
  },
];
