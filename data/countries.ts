// Editorial notes and consumption-tax facts for the per-country pages.
//
// These exist so /prices/<country> is not just a table with the country name
// swapped in. Each note says something specific and true about why that
// country's prices look the way they do — a subsidy, a currency regime, a
// climate, a tax. The tables are generated; these are written.
//
// Keep them factual and hedged where the underlying economics is contested. If
// you can't say something specific about a country, leave it out rather than
// padding it with a generic sentence.
//
// WHY THESE ARE AS LONG AS THEY ARE:
//   Search Console reported two of the 33 country pages as "Crawled – currently
//   not indexed". Measured against each other with country names and numbers
//   normalised out, the pages were 82-87% identical template and carried only
//   ~60 genuinely distinct words each — of which the note was about 44. Google
//   indexed 31 and declined 2, which is the expected outcome for near-duplicate
//   templated pages on a young domain. Generated prose does not fix that: swap
//   the numbers and it collapses onto the same skeleton. Only written, country-
//   specific text does. That is what these are for, and it is why they should
//   never be shortened back towards a formula or auto-generated from the data.

/**
 * How a country taxes consumption, which is the largest single wedge between
 * two countries' prices for a physically identical good.
 *
 * `standard` is quoted as the source states it — some countries genuinely do
 * not have one number. `food` is the treatment of ordinary groceries, which
 * matters more here than the standard rate does, because six of the seven items
 * in the game are food or drink bought to take away.
 *
 * SOURCING RULE: standard rates come from PwC's Worldwide Tax Summaries VAT
 * quick chart, which is the single source used for all 33 so the figures are
 * consistent with one another rather than assembled from 33 different pages.
 * Reduced and zero rates for European countries are cross-checked against the
 * Tax Foundation's annual VAT rates in Europe table. Where a country's food
 * treatment could not be confirmed from either, `food` is left undefined rather
 * than guessed — an empty field is honest, an invented one is not.
 */
export interface CountryTax {
  /** Standard VAT/GST/consumption tax rate, as the source states it. */
  standard: string;
  /** How ordinary groceries are treated, where it could be confirmed. */
  food?: string;
}

export const COUNTRY_TAX: Record<string, CountryTax> = {
  AE: { standard: "5% VAT", food: "no reduced rate for food" },
  AR: { standard: "21% IVA", food: "many basic foods at a reduced 10.5%" },
  AU: { standard: "10% GST", food: "most basic food is GST-free" },
  BR: { standard: "multiple overlapping federal, state and municipal levies" },
  CA: { standard: "5% federal GST, 5–15% combined with provincial taxes", food: "basic groceries zero-rated" },
  CH: { standard: "8.1% VAT", food: "2.6% on food" },
  CN: { standard: "13%, 9% or 6% by category", food: "9% on agricultural and food products" },
  DE: { standard: "19% VAT", food: "7% on most food" },
  EG: { standard: "14% VAT", food: "several basic foods exempt" },
  ES: { standard: "21% IVA", food: "10% on food, 4% on staples like bread, milk and eggs" },
  FR: { standard: "20% TVA", food: "5.5% on most foodstuffs" },
  GB: { standard: "20% VAT", food: "most supermarket food zero-rated" },
  ID: { standard: "12% VAT", food: "basic necessities exempt" },
  IE: { standard: "23% VAT", food: "most basic food zero-rated" },
  IN: { standard: "GST tiered 5% to 28%, general rate 18%", food: "most fresh unprocessed food nil-rated" },
  IT: { standard: "22% IVA", food: "4% on basic food" },
  JP: { standard: "10% consumption tax", food: "8% on food and non-alcoholic drinks bought to take away" },
  KR: { standard: "10% VAT", food: "basic unprocessed foodstuffs exempt" },
  LB: { standard: "11% VAT" },
  MX: { standard: "16% IVA", food: "0% on food and medicines" },
  NL: { standard: "21% BTW", food: "9% on food" },
  NO: { standard: "25% MVA", food: "15% on food" },
  NZ: { standard: "15% GST", food: "no food exemption — GST applies to groceries" },
  PL: { standard: "23% VAT", food: "5% on basic food" },
  PT: { standard: "23% IVA", food: "6% on essential food" },
  SA: { standard: "15% VAT", food: "no reduced rate for food" },
  SE: { standard: "25% moms", food: "12% on food" },
  SG: { standard: "9% GST", food: "no food exemption — GST applies to groceries" },
  TH: { standard: "7% VAT", food: "fresh unprocessed food exempt" },
  TR: { standard: "20% KDV", food: "reduced rates of 10% and 1% cover most food" },
  US: { standard: "no VAT; state and local sales taxes instead", food: "most states exempt groceries from sales tax" },
  VN: { standard: "10% VAT", food: "5% on foodstuffs" },
  ZA: { standard: "15% VAT", food: "a defined basket of basic foods is zero-rated" },
};

export const COUNTRY_NOTES: Record<string, string> = {
  AE: "The UAE imports almost all of its food, so groceries track global shipping and wholesale costs more than local production. Fuel is the exception: it was deregulated in 2015 and now moves with world oil prices, which is unusual for a Gulf producer and leaves petrol dearer here than in Saudi Arabia. VAT arrived only in 2018, at 5%, and it is one of the few consumption taxes in the world that makes no exception for food — so the tax line on a Dubai grocery bill is small in rate terms but applies to everything on it. The result is a country where the tax wedge is nearly invisible and almost the entire price is import logistics.",

  AR: "Argentina is the hardest country in the game to price. Years of high inflation and a gap between official and parallel exchange rates mean a peso figure can be weeks out of date, and converting it to dollars gives very different answers depending on which rate you use. Read the Argentine numbers as the roughest in the table. The tax layer is real but secondary to that: IVA runs at 21%, with many basic foods at a reduced 10.5%, and neither rate is what moves an Argentine price from one month to the next. When a currency loses a large fraction of its dollar value inside a year, every other explanation for a price becomes a rounding error.",

  AU: "Australia combines high wages with high retail costs and long domestic supply lines. Groceries are concentrated between two supermarket chains, which the country's competition regulator has repeatedly examined, and fuel carries an excise that puts it above US levels but well below European ones. The GST is a flat 10% and most basic food is GST-free, so the tax explanation for expensive Australian groceries is weaker than it looks — what you are paying for is distance and wages, not tax. That distinction shows up clearly in the work-time column, where Australia looks far more ordinary than its dollar prices suggest.",

  BR: "Brazil grows a great deal of what it eats, so staples are cheap in dollar terms even though local incomes are modest. Coffee is the clearest example: Brazil is the world's largest producer, and a café cappuccino costs a fraction of the European price. Brazilian indirect tax is the one case in this table where no single rate can be quoted honestly — federal, state and municipal levies overlap, and the effective burden on an identical item genuinely differs between states. That complexity is why the Brazilian rows here should be read as national approximations, and why a Brazilian reader may find their own supermarket disagrees.",

  CA: "Canadian dairy sits under a supply-management system that sets production quotas and import tariffs, holding milk prices notably above US levels. Most other groceries track the US closely, which makes the dairy gap stand out in the table. Tax does not explain it: basic groceries are zero-rated for GST, so the milk premium is a production-side policy rather than something added at the till. Canada is a useful control case for exactly that reason — it shares a border, a language and most of a retail market with the US, so where the two diverge, the cause is almost always a specific Canadian policy rather than a general cost-of-living difference.",

  CH: "Switzerland is the most expensive country in the game for almost every item, and the Big Mac Index has used it as the standing example of an overvalued currency for years. High wages are the main cause — Swiss prices look far less extreme once you divide by what people earn. It is also, strikingly, a low-tax country on consumption: VAT is 8.1%, among the lowest in Europe, and food is charged at just 2.6%. Switzerland is therefore the cleanest disproof in this table of the idea that expensive countries are expensive because of tax. Almost none of the Swiss premium is collected by the state.",

  CN: "Chinese prices vary enormously between tier-one cities and smaller ones, so a single national figure hides a wide spread. Imported and branded goods carry a premium; domestically produced staples are among the cheapest in the game. VAT is banded rather than flat — 13%, 9% or 6% depending on category, with food and agricultural products at 9% — which means the tax wedge itself differs between two items in the same basket. Read the Chinese column as an urban average with a wide error bar around it, not as a price any particular shopper pays.",

  DE: "Germany has some of the cheapest groceries in Western Europe, largely because of intense competition between discount chains like Aldi and Lidl. Fuel goes the other way: energy taxes and levies make up roughly half the pump price. The VAT structure sharpens both effects — 19% standard but 7% on most food, so the German state takes a far smaller cut of a grocery basket than of a tank of petrol. Germany is the clearest illustration in the table of why food and fuel prices in the same country can sit at opposite ends of the European range.",

  EG: "Egypt has the cheapest fuel in the game by a wide margin — the state has subsidised petrol for decades, though it has been cutting those subsidies under IMF programmes since 2016. Successive devaluations of the pound also make Egyptian prices look very low once converted to dollars. VAT is 14% with several basic foods exempt, but in a country where the currency has repeatedly halved against the dollar, the exchange rate does more to the numbers on this page than the tax code does. Egyptian figures are best read alongside the date they were collected.",

  ES: "Spain is cheaper than the northern eurozone across the board despite sharing the currency, which is a clean illustration of why a single exchange rate cannot equalise prices. Fresh produce is especially cheap — Spain is one of Europe's main growers. Spanish VAT reinforces the pattern with an unusually generous food regime: 10% on food generally, but a super-reduced 4% on staples including bread, milk and eggs. Comparing Spain with Ireland or Portugal, which share the currency and charge 23% standard, is the most direct way this table shows what national tax policy does to prices inside a single monetary union.",

  FR: "France sits in the middle of the eurozone range. Its grocery sector is shaped by decades of price-control law governing what supermarkets may charge relative to what they pay suppliers, which compresses the spread between chains. Food carries 5.5% TVA against a 20% standard rate, one of the wider gaps in Europe between what a country charges on groceries and what it charges on everything else. The café items are the ones to watch here: prepared food and drink consumed on the premises are taxed differently from the same items taken away, which is part of why a French cappuccino and a French litre of milk sit in such different places relative to their neighbours.",

  GB: "The UK's prices sit between the eurozone and North America. Fuel duty plus VAT accounts for well over half the pump price, and most supermarket food is zero-rated for VAT, which is why the gap between British food and fuel prices is unusually wide. Zero-rating is not the same as exemption — it is a deliberate 0% band that still lets retailers reclaim VAT on their inputs, and it is one of the most generous food regimes in Europe against a fairly high 20% standard rate. Britain is the sharpest example in the table of a country that taxes driving heavily and eating barely at all.",

  ID: "Indonesia is among the cheapest countries in the game for prepared food and fuel, both of which have long histories of state price management. Dairy is the outlier: little is produced domestically, so milk is imported and priced accordingly. VAT rose to 12% recently, with basic necessities exempt, which keeps the tax wedge off exactly the staples that dominate an Indonesian household budget. The interesting tension in the Indonesian row is between cheap prepared food and expensive imported dairy — two items from the same shop with completely different explanations behind their prices.",

  IE: "Ireland is the most expensive eurozone country in most of this table. Wages are high, the retail market is small and geographically isolated, and hospitality prices in particular have run ahead of the euro-area average since 2021. Its tax structure is unusually polarised: 23% standard, among the highest in the EU, alongside zero-rating for most basic food. So an Irish grocery basket carries almost no VAT while an Irish restaurant bill carries a great deal, and the two Irish figures in this table that diverge most from their eurozone neighbours are the prepared ones. Ireland and Spain make the sharpest pair here — same currency, opposite tax philosophies.",

  IN: "India has the cheapest Big Mac in the Economist's index — though the Indian sandwich is a Maharaja Mac, since McDonald's does not sell beef there, which is the one place the index's like-for-like premise breaks down. Local staples are inexpensive; imported and branded goods are not. GST is tiered from 5% to 28% with a general rate of 18%, and most fresh unprocessed food is nil-rated, so the tax system draws a hard line between what comes from a farm and what comes from a factory. That line is visible directly in this table: the unbranded items sit near the bottom of the global range while the branded ones climb toward the middle.",

  IT: "Italy runs close to the eurozone average on groceries but below it on café prices. An espresso taken standing at the bar is still priced at a level many Italians treat as near-fixed, and that convention holds cappuccino prices down relative to northern Europe. Basic food carries just 4% IVA against a 22% standard rate — one of the largest such gaps anywhere in the EU. Italy is therefore a country where the state has decided, in tax law, that groceries are close to untaxable, and the cappuccino convention is a second, entirely informal version of the same instinct applied to coffee.",

  JP: "Japan is the clearest case in the game of a country that stopped feeling expensive. A weak yen has pushed dollar prices well below where they sat a decade ago, and the Big Mac Index now scores the yen as one of the most undervalued major currencies. Fruit is the exception — premium apples are a gift category and priced like one. Japan also runs one of the few consumption taxes that changes with how you consume: 10% standard, but 8% on food and non-alcoholic drinks bought to take away, so the same coffee is taxed differently depending on whether you sit down with it. For a table built partly out of café items, that distinction is not academic.",

  KR: "South Korea has notably expensive fruit. Tariffs and quarantine rules restrict imports of many fresh products, and domestic orchard land is limited, so apples cost several times what they do in producing countries. Prepared food and transport, by contrast, are cheap for a high-income country. VAT is a flat 10% with basic unprocessed foodstuffs exempt, so tax explains almost none of the fruit premium — it is border policy and land, not the till. Korea is the strongest case in the table for reading a single item's price as a story about trade rules rather than about the general cost of living.",

  LB: "Lebanon's currency collapsed after 2019, and for several years official and market exchange rates diverged so far that dollar conversions were close to meaningless. Prices have since re-anchored around the US dollar in practice. Only two items are listed here, because the crowd-sourced surveys that cover the rest do not have reliable Lebanese samples. VAT is 11% on paper, but in an economy that dollarised informally after a banking collapse, the published rate tells you much less about a real transaction than it would anywhere else in this table. Lebanon is included for completeness and should be read as the least reliable column here.",

  MX: "Mexico produces much of its own fresh food, keeping groceries cheap in dollar terms, but the peso has been comparatively strong in recent years, which lifts Mexican prices when converted. Fuel is taxed but has also been subject to periodic government caps. Food and medicines carry 0% IVA against a 16% standard rate — a true zero rate rather than an exemption, and one of the more far-reaching food carve-outs in the Americas. Between domestic production and a zero rate on groceries, the Mexican food column has very little in it beyond the cost of growing and moving the food itself.",

  NL: "The Netherlands is a major agricultural exporter despite its size, and its dairy and produce prices reflect that. Fuel is among the most expensive in the game — Dutch excise duties are near the top of the EU range. Food sits at 9% against a 21% standard rate, a middling European carve-out rather than a generous one. The Dutch pattern is the mirror image of Germany's next door: comparable food prices, but a noticeably heavier hand on fuel, which is a policy choice rather than a difference in the cost of importing petrol into two adjacent North Sea ports.",

  NO: "Norway is an oil exporter with some of the most expensive petrol in the world, which is not a contradiction: fuel is heavily taxed as climate policy, and the revenue funds the sovereign wealth fund. Food is expensive too, protected by high agricultural tariffs. VAT is 25%, among the highest anywhere, though food is charged at a reduced 15% — which is still higher than the standard rate of several countries in this table. Norway is where the two halves of this dataset diverge most: it has the resources to be a cheap place to drive and has deliberately chosen not to be.",

  NZ: "New Zealand exports most of what it farms, so domestic dairy prices track world markets rather than local production costs — which is why milk is not as cheap as a country of that many cows might suggest. Groceries generally run above Australian levels. Its GST is the purest in the table: 15% on essentially everything, with no food exemption at all, a design economists often hold up as the textbook version of a consumption tax. Comparing New Zealand with Australia is therefore unusually clean — similar economies and supply chains, but one exempts basic food from GST and the other does not.",

  PL: "Poland is among the cheapest EU countries in the game while having wages well above the global median, which makes its work-time figures unusually good. The złoty floats independently of the euro, so Polish prices move against eurozone neighbours from year to year. Basic food carries 5% VAT against a 23% standard rate, so a Polish grocery basket is taxed at roughly a fifth of the rate applied to everything else. Poland is the best illustration here of why work time is a better comparison than dollars: on price alone it looks like a poor country, and on hours worked it does not.",

  PT: "Portugal has eurozone prices on a lower wage base, so its work-time figures are among the least favourable in Western Europe. Café prices are a notable exception and remain some of the cheapest in the eurozone. Essential food is charged at 6% against a 23% standard rate — the same headline rate as Ireland and Poland, applied to a very different income level. That combination is what makes Portugal the country in this table where the gap between the dollar column and the work-time column is most worth reading carefully: the prices are Western European and the wages are not.",

  SA: "Saudi Arabia has some of the cheapest fuel in the game — domestic petrol is priced well below world markets, though the kingdom has raised it repeatedly since 2016 as part of budget reform. Food is largely imported and priced closer to global levels. VAT was introduced in 2018 and tripled to 15% in 2020, with no reduced rate for food, so Saudi groceries now carry a heavier tax load than groceries in most of Europe. The kingdom is a useful reminder that a country can subsidise one item heavily and tax the rest at a high flat rate at the same time.",

  SE: "Sweden has high fuel taxes and high wages, a combination that puts it near the top of the table in dollar terms and much nearer the middle once measured in work time. Groceries are cheaper than in Norway, since Sweden's agricultural protection is lighter. Food is taxed at 12% against a 25% standard rate, so the Swedish food carve-out is real but less generous than the southern European ones. Sweden and Norway make the most informative Nordic pair in this table: comparable wages and climates, meaningfully different agricultural and fuel policies, and a visible price gap that follows from them.",

  SG: "Singapore imports more than 90% of its food, so grocery prices are set by shipping and wholesale markets rather than local farming. Fuel and vehicle costs are deliberately high as congestion policy, which is why petrol here sits near the European range despite low taxes elsewhere in the economy. GST is 9% and applies to groceries with no exemption — Singapore is one of the few high-income countries that taxes food at the full rate on principle, preferring to compensate lower-income households directly rather than through the tax code. It is the clearest case in the table of a country whose food prices are set almost entirely offshore.",

  TH: "Thailand is among the cheapest countries in the game for prepared food and produce, both grown domestically in quantity. Dairy is the exception — it is not traditionally a large part of the diet and much of the supply is imported. VAT is 7%, the lowest headline rate of any country in this table apart from the Gulf states, and fresh unprocessed food is exempt on top of that. Between domestic agriculture and a very light consumption tax, the Thai food rows are close to a floor for what these items can cost anywhere in the world.",

  TR: "Turkey has run high inflation for several years, so lira prices climb quickly while the currency falls against the dollar. The two roughly offset, which keeps Turkish dollar prices low but makes any single reading unusually time-sensitive. KDV is 20% standard with reduced bands of 10% and 1% covering most food, and those bands have themselves been moved repeatedly during the inflation of recent years. Turkey is the country in this table where the collection date matters most after Argentina: the figures are not wrong so much as perishable.",

  US: "The United States is the reference point for the Big Mac Index, so its burger price is the baseline every other country is measured against. American fuel is cheap by rich-country standards — federal and state fuel taxes are a fraction of European levels — while its food prices sit mid-range. It is also the only country here with no VAT at all: sales tax is set by states and municipalities, most states exempt groceries entirely, and the rate genuinely differs between two towns an hour apart. Every other column in this table has a national tax rate that can be quoted; the American one does not, and the figure here is a national average papering over real internal variation.",

  VN: "Vietnam is among the cheapest countries in the game across nearly every item. It is also the world's second-largest coffee producer, which shows up directly in café prices. Dairy is the usual exception for a country without a large domestic herd. VAT is 10% with foodstuffs at a reduced 5%, a modest wedge by regional standards. What makes Vietnam interesting in this table is that its cheapness is mostly genuine production advantage rather than a weak currency or a subsidy — the coffee is cheap because it is grown next door, which is the simplest explanation for a price anywhere on this site.",

  ZA: "South Africa has low prices in dollar terms but the widest gap in the game between price and affordability: measured in work time at the average wage, its groceries cost far more than the dollar figures suggest. Fuel is regulated and adjusted monthly by the government. VAT is 15% with a defined basket of basic foods zero-rated, a list that is explicitly a poverty measure and has been publicly debated and extended over the years. South Africa is the strongest argument in this dataset for not reading dollar prices as a cost of living: on the dollar column it looks affordable, and on the work-time column it is the hardest country in the table.",
};
