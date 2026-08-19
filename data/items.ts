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
  {
    id: "diesel-1l",
    name: "Diesel (1 litre)",
    shortName: "Diesel",
    slug: "diesel",
    unit: "one litre at the pump",
    imageUrl: "/items/diesel.svg",
    sourceNote:
      "GlobalPetrolPrices.com, which publishes a weekly retail diesel price for around 170 countries in both the local currency and US dollars.",
    blurb:
      "Diesel and petrol leave the same refinery, so the gap between them in any country is almost entirely tax. Much of Europe spent decades taxing diesel more lightly than petrol to favour freight and diesel cars, and has been closing that gap since 2015. Elsewhere the ordering flips: plenty of countries price diesel above petrol because it is the fuel of business rather than of voters.",
  },
  {
    id: "lpg-1l",
    name: "LPG (1 litre)",
    shortName: "LPG",
    slug: "lpg",
    unit: "one litre of autogas at the pump",
    imageUrl: "/items/lpg.svg",
    sourceNote:
      "GlobalPetrolPrices.com's weekly LPG (autogas) series. It covers far fewer countries than the diesel one, because a country only appears if LPG is sold as a road fuel at all.",
    blurb:
      "Liquefied petroleum gas is the cheap third fuel: a by-product of gas processing and oil refining that a car can burn after a conversion costing a few hundred dollars. It only becomes a mass-market fuel where a government decides to tax it lightly, which is why the LPG map looks nothing like the petrol map. Poland, Turkey and Italy run large autogas fleets; most of the English-speaking world barely sells it.",
  },
  {
    id: "electricity-100kwh",
    name: "Electricity (100 kWh)",
    shortName: "Electricity",
    slug: "electricity",
    unit: "100 kilowatt-hours on a household tariff",
    imageUrl: "/items/electricity.svg",
    sourceNote:
      "GlobalPetrolPrices.com's residential electricity series, which includes the cost of power, distribution and transmission plus all taxes and fees. Published per kWh and stored here per 100 kWh.",
    blurb:
      "A hundred kilowatt-hours is roughly what a small flat draws in a month, and what it costs ranges from under a dollar-fifty a week to the price of a restaurant meal. Almost none of that spread is the cost of generating the power. It is network charges, carbon and energy taxes, and in several countries a subsidy that holds the household tariff below what the grid actually spends.",
  },
  {
    id: "natural-gas-100kwh",
    name: "Natural gas (100 kWh)",
    shortName: "Natural gas",
    slug: "natural-gas",
    unit: "100 kilowatt-hours on a household tariff",
    imageUrl: "/items/natural-gas.svg",
    sourceNote:
      "GlobalPetrolPrices.com's residential natural gas series, quoted per kWh of gas delivered and stored here per 100 kWh. Only countries with a domestic gas grid appear.",
    blurb:
      "Gas is the one energy price that still depends on geography, because moving it needs either a pipeline or a liquefaction plant at one end and a regasification terminal at the other. A country at the end of a pipe pays something close to the wellhead price; a country buying cargoes on the spot market pays whatever Asia and Europe are bidding that week. The 2022 European price shock, and the year of bills that followed it, was that distinction becoming visible.",
  },
  {
    id: "cigarettes-20",
    name: "Cigarettes (20-pack)",
    shortName: "Cigarettes",
    slug: "cigarettes",
    unit: "a pack of 20, most sold brand",
    imageUrl: "/items/cigarettes.svg",
    sourceNote:
      "The WHO Global Health Observatory's 2024 tobacco tax survey, which records the retail price of the most sold brand in each country, in local currency and in US dollars at the official exchange rate.",
    blurb:
      "No other item in the game is this deliberately priced. Tobacco taxes are set to make cigarettes unaffordable, and the WHO tracks the result precisely because it is a policy instrument rather than a market outcome. Australia's pack costs more than thirty times Lebanon's, and the same manufacturers sell in both.",
  },
  {
    id: "beer-330ml",
    name: "Beer (330ml)",
    shortName: "Beer",
    slug: "beer",
    unit: "a 330ml bottle or can of the most sold brand, from a shop",
    imageUrl: "/items/beer.svg",
    sourceNote:
      "The WHO Global Health Observatory's 2024 alcohol tax survey. Prices are collected for the most sold brand in each country and standardised to 330ml, in local currency and in US dollars.",
    blurb:
      "Beer is heavy, mostly water, and brewed close to where it is drunk, so a shop-bought bottle is a fairly clean read on local costs plus local excise duty. It is also the item where the shop and the bar diverge most: the same bottle carries a markup of three or four times once someone hands it to you across a counter, which is why this figure is the retail one.",
  },
  {
    id: "spirits-750ml",
    name: "Spirits (750ml bottle)",
    shortName: "Spirits",
    slug: "spirits",
    unit: "a 750ml bottle of the most sold type, from a shop",
    imageUrl: "/items/spirits.svg",
    sourceNote:
      "The WHO Global Health Observatory's 2024 alcohol tax survey, standardised to a 750ml bottle of the most sold brand of the most sold type of spirit, which is not the same drink in every country.",
    blurb:
      "This is the widest spread of any drink here, and two different things cause it. One is excise duty, which is usually charged per litre of pure alcohol and can be most of the shelf price in the Nordics or Oceania. The other is that the most sold spirit is soju in Korea, vodka in Poland and whisky in India, and those are not comparable products at comparable prices.",
  },
  {
    id: "eliquid-1ml",
    name: "Vape e-liquid (1 ml)",
    shortName: "Vape liquid",
    slug: "vape-e-liquid",
    unit: "one millilitre from the cheapest disposable device",
    imageUrl: "/items/vape.svg",
    sourceNote:
      "The WHO Global Health Observatory's 2024 tobacco and nicotine survey, which prices the cheapest closed disposable vape available in each country and standardises it to 1ml of e-liquid.",
    blurb:
      "The sparsest item in the game, and for a reason worth knowing: a country is only listed if disposable vapes are legally on sale there. Several of the largest markets in this table ban or restrict them outright, so an empty row is a policy fact rather than a gap in the data.",
  },
  {
    id: "mobile-data-1gb",
    name: "Mobile data (1 GB)",
    shortName: "Mobile data",
    slug: "mobile-data",
    unit: "one gigabyte, averaged across a country's plans",
    imageUrl: "/items/mobile-data.svg",
    sourceNote:
      "Cable.co.uk's worldwide mobile data pricing league table, which averages over 5,600 prepaid and postpaid plans across 237 countries. Published in US dollars only, so these rows carry no local-currency figure, and it is the oldest edition in the game: read the year printed next to the price.",
    blurb:
      "The only price in the game that has collapsed rather than risen: the world average fell from $8.18 a gigabyte in 2019 to $2.61 four years later. Countries that built dense 4G networks early and then let operators fight over them are pennies a gigabyte; countries running data over satellite or through a single incumbent are still tens of dollars. Rich and cheap are almost unrelated here, which is what makes it hard to guess.",
  },
  {
    id: "healthy-diet-day",
    name: "A day's healthy diet",
    shortName: "Healthy diet",
    slug: "healthy-diet",
    unit: "one person, one day",
    imageUrl: "/items/healthy-diet.svg",
    sourceNote:
      "The World Bank and FAO's Food Prices for Nutrition database: the cost of the cheapest locally available basket that meets dietary guidelines, per person per day. Published in local currency, converted here at the World Bank's own official exchange rate for the same year.",
    blurb:
      "This is not a shopping basket anyone actually buys. It is the cheapest combination of foods on sale locally that would meet dietary guidelines, which makes it a floor rather than an average, and the number economists use to count how many people cannot reach it. Over two and a half billion people live in countries where a day of it costs more than they have to spend on food.",
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
