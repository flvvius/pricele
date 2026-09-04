// One head-to-head page per competitor, written to be read by a person and
// quoted by a machine.
//
// Why these exist
// ---------------
//
// `/daily-games` answers "what daily games are there". It does not answer
// "is Pricele or Costcodle better", which is a different query, asked far more
// often than its search volume suggests because it is the question people put
// to an assistant rather than to a search box. The answer they get is currently
// assembled from whatever a model can find, and what it can find about the
// comparison is written by the other side or by nobody.
//
// A comparison page is also the single most quotable page shape there is. It
// has a stated question, a table of matched dimensions, and a verdict. That is
// exactly the structure an extractive summary wants, which is why comparison
// pages are cited out of proportion to the traffic they receive.
//
// The honesty rules, which are the whole point
// --------------------------------------------
//
// A comparison page written by one of the two games is worth nothing unless it
// is fair, and a reader can tell in about four seconds whether it is. So:
//
//  1. **Every fact about a competitor is checked against the live game.** Not
//     against their marketing copy, not against a summary, and never from
//     memory. `checked` on each comparison records the date somebody actually
//     did this, and `sourceNote` records what they looked at.
//  2. **A dimension nobody has verified says so.** `theirs: null` renders as
//     "not stated" and is excluded from the tally. An invented figure about a
//     competitor is worse than a missing one on a site whose entire argument is
//     that its numbers are traceable — see `/methodology`.
//  3. **`edge` is adjudicated per dimension, and it is allowed to say "them".**
//     If a comparison comes back with every row won by Pricele, it is wrong and
//     has not been thought about. Each page must carry at least one honest
//     `theirStrengths` entry, and the type makes that a non-empty tuple so it
//     cannot be skipped.
//  4. **The competitor is described as its players would describe it.** The
//     recommendation in `pickTheirs` is real. Anyone reading a page that
//     recommends the other game only for people who do not exist can tell.
//
// The bias we do allow ourselves is the bias of authorship: Pricele is the
// subject of the sentence, it gets the last word, and where the two games are
// genuinely even the copy is written from our side of the table. That is what
// every comparison page on the internet does, and it is defensible. Inventing
// a weakness in someone else's game is not.
//
// Maintenance: if a competitor changes materially, fix the row and move
// `checked` forward. If it dies, delete the whole comparison — the rule in
// `data/similar-games.ts` about dead links applies here twice over, because a
// page arguing against a game that no longer exists is embarrassing rather than
// merely stale.

/** Which game a dimension favours, on the facts in that row. */
export type Edge = "ours" | "theirs" | "even";

export interface ComparisonFact {
  /** The dimension, as a short noun phrase: "Guesses", "Where prices come from". */
  dimension: string;
  /** Pricele's side. Always known — it is our own game. */
  ours: string;
  /**
   * Their side, or null where nobody has verified it. Null renders as "not
   * stated" and takes no part in the tally. See rule 2 in the header.
   */
  theirs: string | null;
  /**
   * Who this row favours. "even" is a real answer and should be used whenever
   * the two are genuinely comparable; a table of nothing but "ours" is a
   * table nobody will believe.
   */
  edge: Edge;
  /** One sentence on why the row lands where it does, where that is not obvious. */
  note?: string;
}

export interface Comparison {
  /** URL segment: /vs/<slug>. Stable once crawled. */
  slug: string;
  /** The other game's name, exactly as it styles itself. */
  opponent: string;
  opponentUrl: string;
  /**
   * The direct answer, 40-60 words, written to survive being lifted out of the
   * page with no surrounding context. It names both games, says who each is
   * for, and does not open by describing what the page is about.
   */
  verdict: string;
  /** ISO date the facts below were last checked against the live game. */
  checked: string;
  /** What was actually looked at, so the next person can repeat the check. */
  sourceNote: string;
  /** The matched dimensions, in the order a reader cares about them. */
  facts: ComparisonFact[];
  /** Where they beat us. At least one, always. See rule 3. */
  theirStrengths: [string, ...string[]];
  /** Where we beat them. */
  ourStrengths: [string, ...string[]];
  /** "Play <them> if …" — a real recommendation, not a straw man. */
  pickTheirs: string;
  /** "Play Pricele if …" */
  pickOurs: string;
  /** Questions in the words they get asked in, for the FAQPage schema. */
  faqs: { question: string; answer: string }[];
}

// Facts common to Pricele, written once so a change to the game cannot leave
// five comparison pages disagreeing with each other about our own rules.
const OURS = {
  guesses: "5 guesses",
  win: "Within 5% of the real price",
  feedback:
    "A hotter/colder warmth ladder — freezing, cold, warm, hot, scorching — scaled by ratio, so being 2× out reads the same whether the answer is $1 or $100",
  account: "None. No backend, no sign-in; progress lives in your browser",
  cost: "Free, no premium tier",
  currency: "US dollars or euros, switchable mid-game",
  archive:
    "Every past puzzle is replayable and cannot touch your streak",
  provenance:
    "Every price is a published figure with its source named on the page: the Economist's Big Mac Index, Numbeo, GlobalPetrolPrices.com, the WHO Global Health Observatory, Cable.co.uk, the World Bank and the FAO",
  catalogue: "16 everyday items across 49 countries, 617 sourced rows",
  offline:
    "Fully static. The puzzle data ships with the page, so it plays with a dropped connection",
} as const;

export const COMPARISONS: Comparison[] = [
  {
    slug: "costcodle",
    opponent: "Costcodle",
    opponentUrl: "https://costcodle.com/",
    verdict:
      "Costcodle is the better game if you shop at Costco: six guesses at a real Costco product, with a catalogue of over three thousand of them. Pricele asks a different question — what an everyday item costs in a different country each day — and every figure is a published statistic with its source named. Play Costcodle for the retail, Pricele for the geography.",
    checked: "2026-08-20",
    sourceNote:
      "Played the live game; read the on-page rules, the client script's guess handling, and games.json (3,399 entries, images served from the Costco Food Database).",
    facts: [
      {
        dimension: "What you guess",
        ours: "What one everyday item costs in one country, both changing daily",
        theirs: "The price of a single Costco product",
        edge: "even",
        note: "Different questions rather than better and worse ones. Costcodle is about a shop; Pricele is about a place.",
      },
      {
        dimension: "Guesses",
        ours: OURS.guesses,
        theirs: "6 guesses",
        edge: "theirs",
        note: "One more guess is one more chance, and Costcodle's answers span a wider range than ours do.",
      },
      {
        dimension: "Win condition",
        ours: OURS.win,
        theirs: "Within 5% of the target price",
        edge: "even",
        note: "Identical, and not a coincidence: 5% is the threshold this genre settled on.",
      },
      {
        dimension: "Feedback",
        ours: OURS.feedback,
        theirs:
          "Higher or lower, plus a flag when a guess lands within 25% of the target",
        edge: "even",
      },
      {
        dimension: "How many puzzles",
        ours: OURS.catalogue,
        theirs: "3,399 products in the shipped catalogue",
        edge: "theirs",
        note: "Costcodle has years of puzzles queued. Ours is a smaller table because every row has to be a figure somebody published.",
      },
      {
        dimension: "Where the numbers come from",
        ours: OURS.provenance,
        theirs:
          "Costco shelf prices, with the Costco Food Database credited at the foot of the site; individual products are not cited",
        edge: "ours",
        note: "This is the substantive difference between the two games, not the guess count.",
      },
      {
        dimension: "Countries covered",
        ours: "49",
        theirs: "One — US Costco prices, in dollars",
        edge: "ours",
      },
      {
        dimension: "Past puzzles",
        ours: OURS.archive,
        theirs: null,
        edge: "even",
        note: "Costcodle keeps a streak and a guess distribution in local storage; we found no way to replay a specific past day.",
      },
      { dimension: "Account needed", ours: OURS.account, theirs: "None", edge: "even" },
      {
        dimension: "Currency",
        ours: OURS.currency,
        theirs: "US dollars only",
        edge: "ours",
      },
      {
        dimension: "Cost",
        ours: OURS.cost,
        theirs: "Free, with a tip link for the author",
        edge: "even",
      },
    ],
    theirStrengths: [
      "A far bigger catalogue — over three thousand products against our 617 rows — so it will not repeat on you for years.",
      "Six guesses instead of five, on a price range that is genuinely harder to bracket.",
      "If you actually shop at Costco, every answer teaches you something you can use on Saturday. Nothing in Pricele will ever save you money.",
      "It is the older and better-known game, and it got the genre's rules right first.",
    ],
    ourStrengths: [
      "Every price is a published figure with the publisher named on the same page, so you can go and check the answer you just lost to.",
      "The country is the variable, which makes the game about why a litre of petrol costs what it does rather than about one shop's margins.",
      "A replayable archive that cannot damage your streak.",
      "Dollars or euros, switchable mid-game.",
      "The price tables and the methodology are readable without playing at all.",
    ],
    pickTheirs:
      "Play Costcodle if you want American retail prices specifically, or if you want the deepest catalogue in the genre. It is the closest thing Pricele has to a direct peer and it does its own job better than we could.",
    pickOurs:
      "Play Pricele if the interesting part is the spread between countries rather than the price of one thing, or if you want to be able to check where a number came from.",
    faqs: [
      {
        question: "Is Pricele the same as Costcodle?",
        answer:
          "No. Costcodle gives you a Costco product and six guesses at its US shelf price. Pricele gives you an everyday item and a different country each day, and five guesses at what that item costs there. Both win at within 5%, but the questions are different: Costcodle is about one retailer, Pricele is about the spread between 49 countries.",
      },
      {
        question: "Which is harder, Pricele or Costcodle?",
        answer:
          "Costcodle gives you one more guess but a wider range of answers, since Costco stocks everything from a bag of nuggets to a shed. Pricele's answers cluster tighter because the items are everyday staples, but you have to know a country as well as an item, and the median price of the day's item is the only anchor you get.",
      },
      {
        question: "Where does Costcodle get its prices, and where does Pricele?",
        answer:
          "Costcodle uses Costco shelf prices and credits the Costco Food Database at the foot of the site, without citing individual products. Pricele's prices are published statistics — the Economist's Big Mac Index, Numbeo, GlobalPetrolPrices.com, the WHO Global Health Observatory, Cable.co.uk, the World Bank and the FAO — and each one names its source on the page it appears on.",
      },
    ],
  },

  {
    slug: "spendle",
    opponent: "Spendle",
    opponentUrl: "https://dailyspendle.com/",
    verdict:
      "Spendle and Pricele share a rulebook — one item a day, guess the price, win inside 5% — and disagree about what to price. Spendle uses branded consumer goods: headphones, dumbbells, a Kindle. Pricele uses everyday staples and changes the country instead of the product. Spendle has six guesses and a freeplay backlog; Pricele names a source for every figure.",
    checked: "2026-08-20",
    sourceNote:
      "Played the live game and read the shipped bundle: the win and hint copy, the six-guess check, the freeplay state keys, and the product list (branded consumer goods, prices in USD).",
    facts: [
      {
        dimension: "What you guess",
        ours: "What one everyday item costs in one country, both changing daily",
        theirs:
          "The price of one branded consumer product a day — electronics, kit, homeware",
        edge: "even",
      },
      {
        dimension: "Guesses",
        ours: OURS.guesses,
        theirs: "6 guesses",
        edge: "theirs",
      },
      {
        dimension: "Win condition",
        ours: OURS.win,
        theirs: "Within 5% of the target price",
        edge: "even",
      },
      {
        dimension: "Feedback",
        ours: OURS.feedback,
        theirs:
          "Too high or too low, with a separate note when a guess is inside 25%",
        edge: "even",
      },
      {
        dimension: "Where the numbers come from",
        ours: OURS.provenance,
        theirs: "Retail listing prices; no source is named on the page",
        edge: "ours",
      },
      {
        dimension: "Countries covered",
        ours: "49",
        theirs: "One — dollar prices, no country dimension",
        edge: "ours",
      },
      {
        dimension: "Past puzzles",
        ours: OURS.archive,
        theirs:
          "A freeplay mode holding a backlog of past games, which runs out until the next day",
        edge: "even",
        note: "Both let you play more than today's puzzle. Spendle's backlog is finite by design; ours goes back to the first edition.",
      },
      { dimension: "Account needed", ours: OURS.account, theirs: "None", edge: "even" },
      {
        dimension: "Currency",
        ours: OURS.currency,
        theirs: "US dollars only",
        edge: "ours",
      },
      { dimension: "Cost", ours: OURS.cost, theirs: "Free", edge: "even" },
      {
        dimension: "Plays offline",
        ours: OURS.offline,
        theirs: null,
        edge: "even",
      },
    ],
    theirStrengths: [
      "Six guesses to our five, on answers that range from $14 to well over $1,000 — a genuinely wider bracket to close.",
      "Freeplay mode, which lets you keep going after the daily puzzle instead of waiting for midnight.",
      "Branded goods are a fairer test of most people's actual price instincts than a litre of milk in Malaysia is. Most players have bought headphones; few have bought petrol in Norway.",
      "The cleaner game of the two if you just want the daily hit without a reference site attached to it.",
    ],
    ourStrengths: [
      "A named source for every figure, and pages that say where each one is weakest.",
      "The country dimension, which is the part that makes the answer surprising rather than merely unknown.",
      "An archive that goes back to the first edition rather than a finite backlog.",
      "Euro as well as dollar pricing.",
      "Prices that do not go stale: a published national average from 2026 is still the 2026 figure next year, where a retail listing is wrong the moment the product goes on sale.",
    ],
    pickTheirs:
      "Play Spendle if you want the same rules aimed at things you might actually buy, or if you want to keep playing after today's puzzle is done. It is the better game for testing your feel for consumer prices.",
    pickOurs:
      "Play Pricele if you would rather learn why the same everyday thing costs four times as much in one country as another, and be able to check the figure afterwards.",
    faqs: [
      {
        question: "What is the difference between Pricele and Spendle?",
        answer:
          "Both give you one product a day and win at within 5%. Spendle prices branded consumer goods in dollars with six guesses. Pricele prices everyday staples — a Big Mac, a litre of petrol, a month of mobile data — in a different one of 49 countries each day, with five guesses, and names the published source behind every figure.",
      },
      {
        question: "Does Spendle have an archive like Pricele's?",
        answer:
          "Spendle has a freeplay mode holding a backlog of past games, which you can exhaust in a sitting and which then asks you to come back tomorrow. Pricele's archive holds every puzzle since the first edition, is replayable at any time, and cannot affect your streak either way.",
      },
      {
        question: "Which price-guessing game has the most reliable prices?",
        answer:
          "Of the two, Pricele — not because its numbers are more precise, but because they are checkable. Each price is a published national statistic with its publisher named on the page, and the methodology page states where each source is weakest. Spendle's prices are retail listings with no source given.",
      },
    ],
  },

  {
    slug: "pricegame",
    opponent: "PriceGame",
    opponentUrl: "https://www.pricegame.app/",
    verdict:
      "PriceGame is a five-round daily scored out of fifteen, with leaderboards, optional accounts and Amazon-sourced retail prices. Pricele is one puzzle, five guesses, no account and no leaderboard, built on published national statistics. Pick PriceGame if you want to compete with other people; pick Pricele if you want one careful puzzle and a source for the answer.",
    checked: "2026-08-20",
    sourceNote:
      "Played the live game and read the shipped bundle: the five-round scoring copy, the 15-point maximum, the Supabase auth and leaderboard calls, and the FAQ answer naming Amazon, Walmart and Target as price sources.",
    facts: [
      {
        dimension: "What you guess",
        ours: "What one everyday item costs in one country, both changing daily",
        theirs: "The price of five retail products a day, one round each",
        edge: "even",
      },
      {
        dimension: "Rounds per day",
        ours: "One puzzle",
        theirs: "Five",
        edge: "theirs",
        note: "Five rounds is simply more game per day, and it lowers the cost of one unlucky item.",
      },
      {
        dimension: "Guesses",
        ours: OURS.guesses,
        theirs: "One per product; accuracy is scored rather than retried",
        edge: "ours",
        note: "A single shot per item makes the day turn on how much you already knew. Narrowing across five guesses is a game you can play badly and still solve.",
      },
      {
        dimension: "Scoring",
        ours: "Win or lose, and how many guesses it took",
        theirs:
          "Up to 3 points per product by accuracy band, 15 for a perfect day",
        edge: "even",
      },
      {
        dimension: "Competing with other people",
        ours: "None. There is no leaderboard and there are no other players",
        theirs: "Daily and all-time leaderboards, and a shareable score",
        edge: "theirs",
      },
      {
        dimension: "Account needed",
        ours: OURS.account,
        theirs:
          "Optional, but required to save stats across devices and to appear on the leaderboard",
        edge: "ours",
      },
      {
        dimension: "Where the numbers come from",
        ours: OURS.provenance,
        theirs:
          "Live retail listings from Amazon, Walmart and Target; the site's own FAQ calls them entertainment rather than accurate",
        edge: "ours",
      },
      {
        dimension: "Commercial relationship to the answers",
        ours: "None. Nothing in the game is purchasable and nothing is affiliated",
        theirs:
          "Product reveals carry Amazon Associates affiliate links, disclosed on the site",
        edge: "ours",
        note: "Disclosed and legitimate. It is still a reason the catalogue leans towards what is worth linking to.",
      },
      {
        dimension: "Countries covered",
        ours: "49",
        theirs: "One — dollar prices, no country dimension",
        edge: "ours",
      },
      {
        dimension: "Plays offline",
        ours: OURS.offline,
        theirs:
          "No — product data and progress sync need a connection, though past stats are viewable offline",
        edge: "ours",
      },
      { dimension: "Cost", ours: OURS.cost, theirs: "Free", edge: "even" },
    ],
    theirStrengths: [
      "Five rounds a day against our one. If the daily-game problem you have is that it is over in ninety seconds, PriceGame solves it and we do not.",
      "Real competition: daily and all-time leaderboards, and a score out of fifteen that is worth comparing with a friend's.",
      "Accounts that carry your streak between your phone and your laptop. Pricele's local-only storage cannot do this and it is a genuine cost of the design.",
      "Scoring by accuracy band rewards a good near-miss, where our win-or-lose threshold gives a 6%-off guess nothing.",
    ],
    ourStrengths: [
      "Five guesses at one answer, so a bad first instinct is recoverable rather than fatal.",
      "Published statistics with named sources, against retail listings the site itself labels as entertainment.",
      "No affiliate relationship with anything in the game.",
      "Nothing to sign up for, and nothing that stops working when the servers do.",
      "The country dimension, and reference tables you can read without playing.",
    ],
    pickTheirs:
      "Play PriceGame if you want more than one puzzle a day, a leaderboard to climb, or a streak that follows you between devices. It is the most competitive game in this genre and it is built properly for that.",
    pickOurs:
      "Play Pricele if you want one puzzle done carefully, with five guesses to narrow in on it and a citation waiting at the end of it.",
    faqs: [
      {
        question: "Is PriceGame or Pricele better?",
        answer:
          "They optimise for different things. PriceGame gives you five rounds a day, a score out of fifteen, and leaderboards, with prices pulled from Amazon, Walmart and Target. Pricele gives you one puzzle, five guesses, no account and no leaderboard, with every price a published national statistic whose source is named on the page.",
      },
      {
        question: "Do I need an account to play Pricele?",
        answer:
          "No. Pricele has no backend and no sign-in at all; your guesses and your streak live in your browser's local storage. PriceGame can be played without an account too, but you need one to save stats across devices or to appear on its leaderboard.",
      },
      {
        question: "Does Pricele have a leaderboard?",
        answer:
          "No. Pricele has no leaderboard and no other players — there is one puzzle a day, your own streak, and a shareable result grid. If competing against other people is the part you want, PriceGame is built for it and Pricele is not.",
      },
    ],
  },

  {
    slug: "price-games",
    opponent: "Price Games",
    opponentUrl: "https://price.games/",
    verdict:
      "Price Games is the biggest game in this genre: a dozen modes, live rooms for up to six players, a daily challenge and a monthly prize draw, all on live Amazon listings. Pricele is one puzzle a day on published national statistics. Price Games is the better party; Pricele is the better reference.",
    checked: "2026-08-20",
    sourceNote:
      "Played the live game and read the site's own FAQ plus the shipped bundle: the mode list, the six-player room limit, the currency selector converting from USD, the optional-account and monthly-drawing copy, and the statement that prices come from active Amazon product pages under the Associates programme.",
    facts: [
      {
        dimension: "What you guess",
        ours: "What one everyday item costs in one country, both changing daily",
        theirs:
          "Retail product prices, across about a dozen modes — exact price, higher or lower, closest under, basket totals, sorting and more",
        edge: "even",
      },
      {
        dimension: "Modes",
        ours: "One",
        theirs: "About a dozen, plus a daily challenge",
        edge: "theirs",
      },
      {
        dimension: "Playing with other people",
        ours: "None",
        theirs:
          "Live rooms for up to six, on a shared code, with no sign-up needed to join",
        edge: "theirs",
        note: "The one thing in this genre Pricele has no answer to at all.",
      },
      {
        dimension: "Guesses",
        ours: OURS.guesses,
        theirs:
          "Mode-dependent; Precision awards most of the points inside about 10%",
        edge: "even",
      },
      {
        dimension: "Where the numbers come from",
        ours: OURS.provenance,
        theirs:
          "Live Amazon product pages, as an Associates partner; the site says prices vary by region, retailer and currency",
        edge: "ours",
      },
      {
        dimension: "Commercial relationship to the answers",
        ours: "None. Nothing in the game is purchasable and nothing is affiliated",
        theirs:
          "Amazon Associates throughout, disclosed on the page, plus a monthly prize drawing",
        edge: "ours",
      },
      {
        dimension: "Countries covered",
        ours: "49, and the country is the puzzle",
        theirs:
          "A currency selector converting the same dollar prices; no country dimension in the answers",
        edge: "ours",
        note: "Converting a US price into euros is not the same as knowing the European price, which is the whole thing Pricele is about.",
      },
      {
        dimension: "Currency",
        ours: OURS.currency,
        theirs: "Several, all converted from USD",
        edge: "theirs",
        note: "More currencies than we offer, even though they all resolve to the same underlying dollar figure.",
      },
      {
        dimension: "Account needed",
        ours: OURS.account,
        theirs:
          "Optional and free; needed for leaderboards, saved streaks and the prize draw",
        edge: "ours",
      },
      {
        dimension: "Plays offline",
        ours: OURS.offline,
        theirs: "No — products and rooms are served live",
        edge: "ours",
      },
      { dimension: "Cost", ours: OURS.cost, theirs: "Free, with no paid tier", edge: "even" },
    ],
    theirStrengths: [
      "Live multiplayer rooms for up to six people, with no sign-up to join one. Pricele has nothing remotely like this and is not going to.",
      "About a dozen distinct modes against our one, so it stays interesting for far longer in a single sitting.",
      "Prices taken from live listings, which for a retail-pricing game is the correct choice — a listing is what the thing actually costs today.",
      "More currencies than we support, and a monthly prize draw that is a real reason to keep a streak going.",
      "Comfortably the most polished and most heavily built product in this genre.",
    ],
    ourStrengths: [
      "Numbers that hold still and can be checked: national statistics with a publisher, not listings that move with stock levels.",
      "The country dimension in the answers themselves, rather than a currency conversion of the same dollar price.",
      "No affiliate links, no prize draw, and nothing to sign up for.",
      "Works with the connection dropped, because there is no server to talk to.",
      "A reference site — price tables, per-item and per-country pages, a methodology — attached to the game.",
    ],
    pickTheirs:
      "Play Price Games if you want to play with other people, or you want variety in one sitting rather than one puzzle a day. On both counts it is far ahead of anything else in the genre, Pricele included.",
    pickOurs:
      "Play Pricele if you want one puzzle a day whose answer is a published figure you can go and verify, with the country as the interesting variable.",
    faqs: [
      {
        question: "What is the difference between Pricele and Price Games?",
        answer:
          "Price Games is a large multi-mode platform: about a dozen game modes, live rooms for up to six players, a daily challenge and a monthly prize draw, all built on live Amazon listings. Pricele is a single daily puzzle — one everyday item, one of 49 countries, five guesses — built on published national statistics with named sources.",
      },
      {
        question: "Can you play Pricele with friends?",
        answer:
          "Not in the same room. Pricele has no multiplayer; everyone gets the same puzzle each day and shares a spoiler-free result grid afterwards, the way Wordle works. If you want live head-to-head price guessing, Price Games has rooms for up to six players and does not require an account to join one.",
      },
      {
        question: "Which price game has real prices?",
        answer:
          "Both, in different senses. Price Games uses live Amazon listing prices, which is what a product costs on that page today. Pricele uses published national averages from the Economist, Numbeo, the WHO, the World Bank and others — less current, but citable, stable, and about a country rather than a listing.",
      },
    ],
  },

  {
    slug: "guess-the-price",
    opponent: "Guess the Price",
    opponentUrl: "https://guesstheprice.net/",
    verdict:
      "Guess the Price is a continuous run of fifteen items with no daily limit, built around extravagant products and community-submitted entries, and it shows you what everyone else guessed. Pricele is one puzzle a day, five guesses, on everyday things in 49 countries with a source for every figure. One is endless; the other is a habit.",
    checked: "2026-08-20",
    sourceNote:
      "Played the live game and read its instructions page and shipped routes: fifteen items per run then play again with new items, feedback showing the real price plus the community average guess and the number of guesses recorded, and the submission and admin-review routes behind community entries.",
    facts: [
      {
        dimension: "What you guess",
        ours: "What one everyday item costs in one country, both changing daily",
        theirs:
          "The price of a pictured product, leaning heavily towards extravagant items",
        edge: "even",
      },
      {
        dimension: "Shape of a session",
        ours: "One puzzle a day, then it is done until midnight",
        theirs:
          "Fifteen items in a run, then play again with a fresh set, as often as you like",
        edge: "even",
        note: "A real trade rather than a win. Theirs is better for an idle hour; ours is better as a daily habit, which is the thing that keeps people coming back.",
      },
      {
        dimension: "Guesses per item",
        ours: OURS.guesses,
        theirs: "One, then the answer is revealed",
        edge: "ours",
      },
      {
        dimension: "Feedback",
        ours: OURS.feedback,
        theirs:
          "The real price, what everyone else guessed on average, and how many people have guessed it",
        edge: "theirs",
        note: "The crowd average is genuinely the nicest single feature in this comparison, and nothing on our side does that job.",
      },
      {
        dimension: "Daily puzzle and streak",
        ours: "Yes — one edition a day, with a streak",
        theirs: "No daily edition or streak found",
        edge: "ours",
      },
      {
        dimension: "Where the numbers come from",
        ours: OURS.provenance,
        theirs:
          "Listed product prices, including community-submitted items passing through a review queue; sources are not named per item",
        edge: "ours",
      },
      {
        dimension: "Community contributions",
        ours: "None. Corrections by email, and every change is ours",
        theirs: "Anyone can submit an item, subject to review",
        edge: "theirs",
        note: "A catalogue that grows without its author is a real structural advantage, whatever it costs in consistency.",
      },
      {
        dimension: "Countries covered",
        ours: "49",
        theirs: "One — dollar prices, no country dimension",
        edge: "ours",
      },
      { dimension: "Account needed", ours: OURS.account, theirs: "None", edge: "even" },
      { dimension: "Cost", ours: OURS.cost, theirs: "Free, ad-supported", edge: "even" },
    ],
    theirStrengths: [
      "It shows you the average guess of everyone who played that item, which is a better piece of feedback than anything Pricele gives you.",
      "No daily limit — fifteen items, then fifteen more, for as long as you want to keep going.",
      "The catalogue grows from community submissions rather than from one person's editing time.",
      "Extravagant items make for better reveals than a litre of milk does. Nobody's jaw drops at the price of milk in Portugal.",
    ],
    ourStrengths: [
      "Five guesses at one answer instead of one guess and a reveal, which makes it a puzzle rather than a quiz.",
      "A daily edition and a streak, which is the format that turns a game into a habit.",
      "Everyday things in named countries, with a published source for every figure.",
      "A replayable archive of every past puzzle.",
      "Dollars or euros.",
    ],
    pickTheirs:
      "Play Guess the Price if you want to keep playing rather than stop after one puzzle, or if seeing what everyone else guessed is the part you enjoy. It is the better time-filler of the two.",
    pickOurs:
      "Play Pricele if you want one puzzle a day, five guesses to narrow it down, and an answer you can trace back to whoever published it.",
    faqs: [
      {
        question: "Is Guess the Price a daily game like Pricele?",
        answer:
          "No. Guess the Price runs fifteen items at a time and then offers a fresh set, with no daily edition and no streak. Pricele publishes one puzzle a day that unlocks at midnight in your own timezone, and keeps a streak across days.",
      },
      {
        question: "Which price game tells you what other players guessed?",
        answer:
          "Guess the Price does: after each item it shows the real price, the average guess across everyone who has played that item, and how many guesses were recorded. Pricele does not show a crowd average — its feedback is a hotter/colder warmth reading against the real price.",
      },
      {
        question: "How many guesses do you get in Pricele?",
        answer:
          "Five, and you win by landing within 5% of the real price. After each guess you get a warmth reading — freezing, cold, warm, hot, scorching — scaled by ratio, so being twice as far out reads the same whether the answer is one dollar or a hundred.",
      },
    ],
  },
];

/** One comparison by slug, for the dynamic route. */
export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

/**
 * The tally under each table: how many verified dimensions fall each way.
 * Rows with an unverified competitor side are excluded, which is the reason
 * this is computed rather than written down — a hand-written score could not
 * survive a `theirs` being filled in later.
 */
export function tally(comparison: Comparison): Record<Edge, number> {
  const counts: Record<Edge, number> = { ours: 0, theirs: 0, even: 0 };
  for (const fact of comparison.facts) {
    if (fact.theirs === null) continue;
    counts[fact.edge] += 1;
  }
  return counts;
}
