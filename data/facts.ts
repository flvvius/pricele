// One sourced line for the foot of the reveal, rotating by puzzle number.
//
// SOURCING RULE, the same one data/prices.json is under. Every entry names where
// the figure came from, and the reveal prints that name. A fun fact with no
// source behind it is exactly the content this site exists to be an alternative
// to, and on a page half of whose readers are teaching from it, that matters
// more here than it would anywhere else.
//
// SPOILER RULE, and this one caught real mistakes on the first pass. An entry
// may not quote a price figure for an (item, country) pair the table carries,
// because a fact is permanent and every pair comes round again. The first draft
// of this file quoted Israeli mobile data at $0.02, Swiss Big Macs at $8.17 and
// American eggs at $3.59, all three of which are rows in prices.json and all
// three of which would have handed over a future day's answer to anyone who read
// the reveal twice.
//
// The `quotes` field lists the countries whose figure the text gives, and
// lib/facts.test.ts asserts against the live table that none of those pairs
// exists. That check has to be mechanical, because the table grows: a fact that
// is safe today becomes a spoiler the moment somebody adds the country it names,
// and nobody is going to remember to re-read this file when they do.

export interface Fact {
  /** The line itself. One or two sentences. */
  text: string;
  /** Where it came from, printed underneath in the meta face. */
  source: string;
  /** Which item it belongs beside, when it belongs beside one. */
  itemId?: string;
  /**
   * Countries whose price figure this text quotes. Every one of these must be
   * absent from the table for `itemId`. Naming a country without giving its
   * price does not go here; the rule is about figures, not mentions.
   */
  quotes?: string[];
}

export const FACTS: Fact[] = [
  {
    text: "Petrol costs about three cents a litre in Iran and Libya, against over $3 in Hong Kong. Crude trades at one world price, so effectively the whole hundredfold spread is tax at one end and subsidy at the other.",
    source: "GlobalPetrolPrices country comparison, 2025",
    itemId: "gasoline-1l",
    quotes: ["IR", "LY", "HK"],
  },
  {
    text: "A gigabyte of mobile data costs about $43.75 in Zimbabwe and under five cents in the cheapest countries on earth, a spread of more than two thousand times. It is the only price in this game that has fallen rather than risen.",
    source: "Cable.co.uk worldwide mobile data pricing league table",
    itemId: "mobile-data-1gb",
    quotes: ["ZW"],
  },
  {
    text: "The Economist has published the Big Mac Index since 1986 as a light-hearted test of purchasing power parity. In July 2024 the cheapest burger in the survey was $2.46 in Taiwan, and the dearest cost more than three times that.",
    source: "The Economist Big Mac Index, July 2024",
    itemId: "big-mac",
    quotes: ["TW"],
  },
  {
    text: "In Czech pubs beer is routinely cheaper than bottled water, and a health minister once proposed obliging bars to sell at least one soft drink for less than the cheapest beer on the list.",
    source: "Czech Ministry of Health proposal, reported 2017",
    itemId: "beer-330ml",
  },
  {
    text: "Qatar has the world's most expensive beer at about $11.26 for a 330ml bottle. Almost all of the difference is a 100% import duty rather than anything to do with the beer.",
    source: "Deutsche Bank, Mapping the World's Prices",
    itemId: "beer-330ml",
    quotes: ["QA"],
  },
  {
    text: "A pack of cigarettes runs from around 72p in Mali to £42 in the Marshall Islands. Tobacco costs much the same to grow everywhere, so the entire range is excise policy.",
    source: "WHO report on the global tobacco epidemic",
    itemId: "cigarettes-20",
    quotes: ["ML", "MH"],
  },
  {
    text: "A Zurich worker could buy an iPhone after about 9 hours of work. A Kyiv worker needed 627. Working time is the one price unit that needs no exchange rate.",
    source: "UBS Prices and Earnings",
  },
  {
    text: "In 2022, 2.8 billion people, 35% of humanity, could not afford a healthy diet, at a global average cost of $3.96 a day in purchasing power terms.",
    source: "FAO, The State of Food Security and Nutrition in the World, 2024",
    itemId: "healthy-diet-day",
  },
  {
    text: "Eggs are the most volatile line in this game. An avian influenza outbreak can double a country's egg price inside a few months and pull it back just as fast, so an egg price is as much a snapshot of flock health as of cost of living.",
    source: "US Department of Agriculture, Egg Markets Overview",
    itemId: "eggs-12",
  },
  {
    text: "Vietnamese bia hoi is brewed fresh and drunk the same day, and in Hanoi it sells for less than a bottle of water bought in the same street.",
    source: "Vietnam National Administration of Tourism",
    itemId: "beer-330ml",
  },
  {
    text: "Coffee beans trade on a world market at roughly the same price everywhere, so nearly the whole gap between a cheap cappuccino and an expensive one is local rent, wages and what the market will bear.",
    source: "International Coffee Organization composite indicator price",
    itemId: "cappuccino",
  },
  {
    text: "Milk is heavy, perishable and awkward to ship, so it is almost always produced near where it is drunk. In much of the EU the retail price sits below what production alone would imply, because of farm subsidy.",
    source: "European Commission, CAP milk market observatory",
    itemId: "milk-1l",
  },
];

/** The fact for a given day, preferring one written about today's item. */
export function factFor(puzzleNumber: number, itemId?: string): Fact {
  const matching = itemId ? FACTS.filter((f) => f.itemId === itemId) : [];
  const pool = matching.length > 0 ? matching : FACTS;
  const i = ((puzzleNumber % pool.length) + pool.length) % pool.length;
  return pool[i];
}
