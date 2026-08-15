// The item catalog. Every puzzle is one item in one country, so an item needs
// enough copy to carry a page of its own: a name for the game header, a slug for
// /items/<slug>, a unit the price is quoted in, and a paragraph explaining what
// the number actually measures and where it comes from.
//
// STABILITY RULE. Read this before editing:
//   Item ids are baked into data/prices.json and into the daily schedule (see
//   data/rotation.ts). Never rename or reorder an existing id; only append. A
//   reorder silently rewrites which item every past puzzle used, which breaks
//   the archive and every share card people have already posted.

export interface Item {
  /** Stable id, matches `itemId` in data/prices.json. Never change. */
  id: string;
  /** Full name, used in the game header and page titles. */
  name: string;
  /** Compact name for tight spots (share text, table headers). */
  shortName: string;
  /** URL slug for /items/<slug>. */
  slug: string;
  /** What one unit is, e.g. "a 330ml can". Used in "how much does X cost" copy. */
  unit: string;
  imageUrl: string;
  /** Where this item's numbers come from, in one sentence, for /methodology. */
  sourceNote: string;
  /** Two or three sentences of real context, used on /items/<slug>. */
  blurb: string;
}

export const ITEMS: Item[] = [
  {
    id: "big-mac",
    name: "Big Mac",
    shortName: "Big Mac",
    slug: "big-mac",
    unit: "one burger",
    imageUrl: "/items/big-mac.svg",
    sourceNote:
      "The Economist's Big Mac Index, January 2026 edition, which collects local-currency prices from McDonald's outlets and franchisee sites in 54 economies.",
    blurb:
      "The Big Mac is the most-quoted price in economics. The Economist started publishing its Big Mac Index in 1986 as a light-hearted way to test purchasing-power parity, the theory that a currency should buy the same basket of goods anywhere. Because the burger is close to identical everywhere it is sold, the gap between what it costs in two countries is a rough read on whether a currency is over- or undervalued.",
  },
  {
    id: "coke-330ml",
    name: "Coca-Cola (330ml can)",
    shortName: "Coca-Cola",
    slug: "coca-cola",
    unit: "a 330ml can",
    imageUrl: "/items/coke.svg",
    sourceNote:
      "A curated table of everyday retail prices assembled from published cost-of-living figures and converted to US dollars. These are the least precise numbers in the game and are best read as ballpark figures.",
    blurb:
      "Coca-Cola is sold in more countries than almost any other branded product, which makes it a useful yardstick, though a noisy one. The same can costs very different amounts in a supermarket, a corner shop and a hotel minibar, and Coca-Cola deliberately prices to the local market rather than converting a single global price.",
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    shortName: "Cappuccino",
    slug: "cappuccino",
    unit: "one regular cup, sit-down café",
    imageUrl: "/items/cappuccino.svg",
    sourceNote:
      "Numbeo's country price rankings for 'Cappuccino (regular)' in the restaurant category, retrieved August 2026.",
    blurb:
      "A cappuccino is priced almost entirely by what surrounds it. Coffee beans are a global commodity that costs roughly the same everywhere, so nearly all of the difference between a $1.50 cup and a $6.50 cup is local rent, wages and what the market will bear. That makes it one of the sharpest signals of local cost of living in the game.",
  },
  {
    id: "milk-1l",
    name: "Milk (1 litre)",
    shortName: "Milk",
    slug: "milk",
    unit: "one litre",
    imageUrl: "/items/milk.svg",
    sourceNote:
      "Numbeo's country price rankings for 'Milk (regular), 1 litre' in the markets category, retrieved August 2026.",
    blurb:
      "Milk is heavy, perishable and awkward to ship, so it is almost always produced close to where it is drunk. That makes its price a read on local farming costs rather than world markets, and in much of the EU on agricultural subsidies, which push retail prices below what production alone would imply.",
  },
  {
    id: "eggs-12",
    name: "Eggs (dozen)",
    shortName: "Eggs",
    slug: "eggs",
    unit: "twelve large eggs",
    imageUrl: "/items/eggs.svg",
    sourceNote:
      "Numbeo's country price rankings for 'Eggs (12, large size)' in the markets category, retrieved August 2026.",
    blurb:
      "Eggs are the most volatile item in the game. Avian influenza outbreaks can double a country's egg price within a few months and pull it back down just as fast, so an egg price is as much a snapshot of this year's flock health as it is of local cost of living.",
  },
  {
    id: "apples-1kg",
    name: "Apples (1 kg)",
    shortName: "Apples",
    slug: "apples",
    unit: "one kilogram",
    imageUrl: "/items/apples.svg",
    sourceNote:
      "Numbeo's country price rankings for 'Apples (1 kg)' in the markets category, retrieved August 2026.",
    blurb:
      "Apples separate the countries that grow them from the countries that fly them in. They need a temperate climate and cold storage, so in tropical and high-income import markets a kilogram can cost several times what it does in a producing country, which is why the top of this table looks nothing like the top of the others.",
  },
  {
    id: "gasoline-1l",
    name: "Gasoline (1 litre)",
    shortName: "Gasoline",
    slug: "gasoline",
    unit: "one litre",
    imageUrl: "/items/gasoline.svg",
    sourceNote:
      "Numbeo's country price rankings for 'Gasoline (1 litre)' in the transportation category, retrieved August 2026.",
    blurb:
      "Crude oil trades on a world market at one price, so the pump price is almost pure policy. Countries that tax fuel heavily land near the top of the table; oil producers that subsidise it land at the bottom, sometimes below what it costs to refine. The spread between the cheapest and most expensive country here is wider than for any other item in the game.",
  },
];

const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));
const BY_SLUG = new Map(ITEMS.map((i) => [i.slug, i]));

export function getItem(id: string): Item | undefined {
  return BY_ID.get(id);
}

export function getItemBySlug(slug: string): Item | undefined {
  return BY_SLUG.get(slug);
}
