// Editorial notes and consumption-tax facts for the per-country pages.
//
// These exist so /prices/<country> is not just a table with the country name
// swapped in. Each note says something specific and true about why that
// country's prices look the way they do: a subsidy, a currency regime, a
// climate, a tax. The tables are generated; these are written.
//
// Keep them factual and hedged where the underlying economics is contested. If
// you can't say something specific about a country, leave it out rather than
// padding it with a generic sentence.
//
// WHY THESE ARE AS LONG AS THEY ARE:
//   Search Console reported two of the then-33 country pages as "Crawled – currently
//   not indexed". Measured against each other with country names and numbers
//   normalised out, the pages were 82-87% identical template and carried only
//   ~60 genuinely distinct words each, of which the note was about 44. Google
//   indexed 31 and declined 2, which is the expected outcome for near-duplicate
//   templated pages on a young domain. Generated prose does not fix that: swap
//   the numbers and it collapses onto the same skeleton. Only written, country-
//   specific text does. That is what these are for, and it is why they should
//   never be shortened back towards a formula or auto-generated from the data.

/**
 * The country roster: every country the game knows about, and the four facts
 * about it that are properties of the country rather than of any one price.
 *
 * data/prices.json repeats these on every row, because that file is what the
 * client actually reads and a row has to be self-describing. This is the
 * editorial source they are written from, and a test asserts the two agree, so
 * a country's name or currency is corrected in exactly one place.
 *
 * A country appears here only once it has price rows. Adding one means adding
 * it to this table, to COUNTRY_TAX and COUNTRY_NOTES below, to the name maps in
 * scripts/refresh-open-prices.ts and scripts/refresh-big-mac.ts, and to
 * countryOrder in data/rotation.ts (read the stability note there first). Then
 * run both refresh scripts. Tests fail if any of those steps is missed.
 *
 * WAGES, AND WHY THERE ARE TWO KINDS
 *   `avgHourlyWageUSD` drives the "about 20 minutes of the average local wage"
 *   line, and it is the weakest number on the site. The 33 countries the game
 *   launched with carry in-house estimates, marked "estimate". Countries added
 *   since carry the ILO's published average hourly earnings of employees,
 *   converted to US dollars by the ILO itself, marked with the survey year:
 *   /methodology explicitly said we would rather use an official series than
 *   keep estimating, and for a new country there was no estimate to inherit.
 *
 *   The mix is deliberate but not permanent. Replacing the 33 estimates would
 *   move every work-time figure on the site at once, including on archive pages
 *   for puzzles already played, so it is a separate decision rather than a side
 *   effect of adding countries. The ILO does not publish an hourly figure for
 *   six of them (the UAE, Australia, China, Japan, New Zealand and Saudi
 *   Arabia), so some estimates will survive any migration. Whichever a row
 *   uses is printed on /methodology rather than left for a reader to guess.
 */
export interface CountryMeta {
  name: string;
  flag: string;
  /** ISO 4217 code. Every price row for this country is quoted in it. */
  localCurrency: string;
  avgHourlyWageUSD: number;
  /** "estimate" for an in-house figure, "ILO <year>" for a published one. */
  wageSource: string;
}

export const COUNTRY_META: Record<string, CountryMeta> = {
  AE: { name: "United Arab Emirates", flag: "🇦🇪", localCurrency: "AED", avgHourlyWageUSD: 15, wageSource: "estimate" },
  AR: { name: "Argentina", flag: "🇦🇷", localCurrency: "ARS", avgHourlyWageUSD: 3.5, wageSource: "estimate" },
  AU: { name: "Australia", flag: "🇦🇺", localCurrency: "AUD", avgHourlyWageUSD: 26, wageSource: "estimate" },
  BD: { name: "Bangladesh", flag: "🇧🇩", localCurrency: "BDT", avgHourlyWageUSD: 0.64, wageSource: "ILO 2024" },
  BR: { name: "Brazil", flag: "🇧🇷", localCurrency: "BRL", avgHourlyWageUSD: 4.5, wageSource: "estimate" },
  CA: { name: "Canada", flag: "🇨🇦", localCurrency: "CAD", avgHourlyWageUSD: 22, wageSource: "estimate" },
  CH: { name: "Switzerland", flag: "🇨🇭", localCurrency: "CHF", avgHourlyWageUSD: 34, wageSource: "estimate" },
  CL: { name: "Chile", flag: "🇨🇱", localCurrency: "CLP", avgHourlyWageUSD: 6.26, wageSource: "ILO 2024" },
  CN: { name: "China", flag: "🇨🇳", localCurrency: "CNY", avgHourlyWageUSD: 5.5, wageSource: "estimate" },
  CO: { name: "Colombia", flag: "🇨🇴", localCurrency: "COP", avgHourlyWageUSD: 2.66, wageSource: "ILO 2025" },
  CR: { name: "Costa Rica", flag: "🇨🇷", localCurrency: "CRC", avgHourlyWageUSD: 6.33, wageSource: "ILO 2025" },
  CZ: { name: "Czechia", flag: "🇨🇿", localCurrency: "CZK", avgHourlyWageUSD: 10.8, wageSource: "ILO 2021" },
  DE: { name: "Germany", flag: "🇩🇪", localCurrency: "EUR", avgHourlyWageUSD: 22, wageSource: "estimate" },
  EG: { name: "Egypt", flag: "🇪🇬", localCurrency: "EGP", avgHourlyWageUSD: 1.8, wageSource: "estimate" },
  ES: { name: "Spain", flag: "🇪🇸", localCurrency: "EUR", avgHourlyWageUSD: 12, wageSource: "estimate" },
  FR: { name: "France", flag: "🇫🇷", localCurrency: "EUR", avgHourlyWageUSD: 18, wageSource: "estimate" },
  GB: { name: "United Kingdom", flag: "🇬🇧", localCurrency: "GBP", avgHourlyWageUSD: 18, wageSource: "estimate" },
  GH: { name: "Ghana", flag: "🇬🇭", localCurrency: "GHS", avgHourlyWageUSD: 1.22, wageSource: "ILO 2024" },
  HU: { name: "Hungary", flag: "🇭🇺", localCurrency: "HUF", avgHourlyWageUSD: 8.57, wageSource: "ILO 2022" },
  ID: { name: "Indonesia", flag: "🇮🇩", localCurrency: "IDR", avgHourlyWageUSD: 2.2, wageSource: "estimate" },
  IE: { name: "Ireland", flag: "🇮🇪", localCurrency: "EUR", avgHourlyWageUSD: 20, wageSource: "estimate" },
  IL: { name: "Israel", flag: "🇮🇱", localCurrency: "ILS", avgHourlyWageUSD: 20.43, wageSource: "ILO 2021" },
  IN: { name: "India", flag: "🇮🇳", localCurrency: "INR", avgHourlyWageUSD: 2.5, wageSource: "estimate" },
  IT: { name: "Italy", flag: "🇮🇹", localCurrency: "EUR", avgHourlyWageUSD: 14, wageSource: "estimate" },
  JP: { name: "Japan", flag: "🇯🇵", localCurrency: "JPY", avgHourlyWageUSD: 16, wageSource: "estimate" },
  KR: { name: "South Korea", flag: "🇰🇷", localCurrency: "KRW", avgHourlyWageUSD: 14, wageSource: "estimate" },
  LB: { name: "Lebanon", flag: "🇱🇧", localCurrency: "LBP", avgHourlyWageUSD: 3.2, wageSource: "estimate" },
  MX: { name: "Mexico", flag: "🇲🇽", localCurrency: "MXN", avgHourlyWageUSD: 4, wageSource: "estimate" },
  MY: { name: "Malaysia", flag: "🇲🇾", localCurrency: "MYR", avgHourlyWageUSD: 3.81, wageSource: "ILO 2020" },
  NG: { name: "Nigeria", flag: "🇳🇬", localCurrency: "NGN", avgHourlyWageUSD: 0.37, wageSource: "ILO 2024" },
  NL: { name: "Netherlands", flag: "🇳🇱", localCurrency: "EUR", avgHourlyWageUSD: 20, wageSource: "estimate" },
  NO: { name: "Norway", flag: "🇳🇴", localCurrency: "NOK", avgHourlyWageUSD: 29, wageSource: "estimate" },
  NZ: { name: "New Zealand", flag: "🇳🇿", localCurrency: "NZD", avgHourlyWageUSD: 22, wageSource: "estimate" },
  PE: { name: "Peru", flag: "🇵🇪", localCurrency: "PEN", avgHourlyWageUSD: 3.31, wageSource: "ILO 2025" },
  PH: { name: "Philippines", flag: "🇵🇭", localCurrency: "PHP", avgHourlyWageUSD: 2.02, wageSource: "ILO 2023" },
  PK: { name: "Pakistan", flag: "🇵🇰", localCurrency: "PKR", avgHourlyWageUSD: 0.5, wageSource: "ILO 2025" },
  PL: { name: "Poland", flag: "🇵🇱", localCurrency: "PLN", avgHourlyWageUSD: 8, wageSource: "estimate" },
  PT: { name: "Portugal", flag: "🇵🇹", localCurrency: "EUR", avgHourlyWageUSD: 9, wageSource: "estimate" },
  RO: { name: "Romania", flag: "🇷🇴", localCurrency: "RON", avgHourlyWageUSD: 7.86, wageSource: "ILO 2021" },
  SA: { name: "Saudi Arabia", flag: "🇸🇦", localCurrency: "SAR", avgHourlyWageUSD: 12, wageSource: "estimate" },
  SE: { name: "Sweden", flag: "🇸🇪", localCurrency: "SEK", avgHourlyWageUSD: 21, wageSource: "estimate" },
  SG: { name: "Singapore", flag: "🇸🇬", localCurrency: "SGD", avgHourlyWageUSD: 16, wageSource: "estimate" },
  TH: { name: "Thailand", flag: "🇹🇭", localCurrency: "THB", avgHourlyWageUSD: 3.5, wageSource: "estimate" },
  TR: { name: "Turkey", flag: "🇹🇷", localCurrency: "TRY", avgHourlyWageUSD: 4, wageSource: "estimate" },
  TZ: { name: "Tanzania", flag: "🇹🇿", localCurrency: "TZS", avgHourlyWageUSD: 1.08, wageSource: "ILO 2024" },
  US: { name: "United States", flag: "🇺🇸", localCurrency: "USD", avgHourlyWageUSD: 25, wageSource: "estimate" },
  UY: { name: "Uruguay", flag: "🇺🇾", localCurrency: "UYU", avgHourlyWageUSD: 7.66, wageSource: "ILO 2024" },
  VN: { name: "Vietnam", flag: "🇻🇳", localCurrency: "VND", avgHourlyWageUSD: 2.8, wageSource: "estimate" },
  ZA: { name: "South Africa", flag: "🇿🇦", localCurrency: "ZAR", avgHourlyWageUSD: 4.5, wageSource: "estimate" },
};

/**
 * How a country taxes consumption, which is the largest single wedge between
 * two countries' prices for a physically identical good.
 *
 * `standard` is quoted as the source states it, since some countries genuinely do
 * not have one number. `food` is the treatment of ordinary groceries, which
 * matters more here than the standard rate does, because nine of the seventeen
 * items in the game are food or drink bought to take away.
 *
 * SOURCING RULE: standard rates come from PwC's Worldwide Tax Summaries VAT
 * quick chart, which is the single source used for every country so the figures
 * are consistent with one another rather than assembled from 49 different pages.
 * Reduced and zero rates for European countries are cross-checked against the
 * Tax Foundation's annual VAT rates in Europe table. Where a country's food
 * treatment could not be confirmed from either, `food` is left undefined rather
 * than guessed. An empty field is honest, an invented one is not.
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
  BD: { standard: "15% VAT" },
  BR: { standard: "multiple overlapping federal, state and municipal levies" },
  CA: { standard: "5% federal GST, 5–15% combined with provincial taxes", food: "basic groceries zero-rated" },
  CH: { standard: "8.1% VAT", food: "2.6% on food" },
  CL: { standard: "19% IVA" },
  CN: { standard: "13%, 9% or 6% by category", food: "9% on agricultural and food products" },
  CO: { standard: "19% IVA" },
  CR: { standard: "13% VAT", food: "1% on goods of basic consumption" },
  CZ: { standard: "21% VAT", food: "12% on groceries, excluding most drinks" },
  DE: { standard: "19% VAT", food: "7% on most food" },
  EG: { standard: "14% VAT", food: "several basic foods exempt" },
  ES: { standard: "21% IVA", food: "10% on food, 4% on staples like bread, milk and eggs" },
  FR: { standard: "20% TVA", food: "5.5% on most foodstuffs" },
  GB: { standard: "20% VAT", food: "most supermarket food zero-rated" },
  GH: { standard: "15% VAT, plus NHIL and GETFL levies of 2.5% each" },
  HU: { standard: "27% ÁFA", food: "18% on milk, dairy and cereal products" },
  ID: { standard: "12% VAT", food: "basic necessities exempt" },
  IE: { standard: "23% VAT", food: "most basic food zero-rated" },
  IL: { standard: "18% VAT" },
  IN: { standard: "GST tiered 5% to 28%, general rate 18%", food: "most fresh unprocessed food nil-rated" },
  IT: { standard: "22% IVA", food: "4% on basic food" },
  JP: { standard: "10% consumption tax", food: "8% on food and non-alcoholic drinks bought to take away" },
  KR: { standard: "10% VAT", food: "basic unprocessed foodstuffs exempt" },
  LB: { standard: "11% VAT" },
  MX: { standard: "16% IVA", food: "0% on food and medicines" },
  MY: { standard: "10% sales tax on goods, 8% service tax" },
  NG: { standard: "7.5% VAT", food: "a defined list of basic food items is zero-rated" },
  NL: { standard: "21% BTW", food: "9% on food" },
  NO: { standard: "25% MVA", food: "15% on food" },
  NZ: { standard: "15% GST", food: "no food exemption; GST applies to groceries" },
  PE: { standard: "18% IGV" },
  PH: { standard: "12% VAT" },
  PK: { standard: "18% sales tax on goods; 15–16% on services, set by province" },
  PL: { standard: "23% VAT", food: "5% on basic food" },
  PT: { standard: "23% IVA", food: "6% on essential food" },
  RO: { standard: "21% TVA", food: "11% on most food, but not alcohol or high-sugar food" },
  SA: { standard: "15% VAT", food: "no reduced rate for food" },
  SE: { standard: "25% moms", food: "12% on food" },
  SG: { standard: "9% GST", food: "no food exemption; GST applies to groceries" },
  TH: { standard: "7% VAT", food: "fresh unprocessed food exempt" },
  TR: { standard: "20% KDV", food: "reduced rates of 10% and 1% cover most food" },
  TZ: { standard: "18% VAT on the mainland, 15% in Zanzibar", food: "basic agricultural products and food for human consumption exempt" },
  US: { standard: "no VAT; state and local sales taxes instead", food: "most states exempt groceries from sales tax" },
  UY: { standard: "22% IVA", food: "10% on food, milk exempt" },
  VN: { standard: "10% VAT", food: "5% on foodstuffs" },
  ZA: { standard: "15% VAT", food: "a defined basket of basic foods is zero-rated" },
};

export const COUNTRY_NOTES: Record<string, string> = {
AE: "The UAE imports almost all of its food, so groceries track global shipping and wholesale costs more than local production. Fuel is the exception: it was deregulated in 2015 and now moves with world oil prices, which is unusual for a Gulf producer and leaves petrol dearer here than in Saudi Arabia. VAT arrived only in 2018, at 5%, and it is one of the few consumption taxes in the world that makes no exception for food, so the tax line on a Dubai grocery bill is small in rate terms but applies to everything on it. The result is a country where the tax wedge is nearly invisible and almost the entire price is import logistics.",

AR: "Argentina is the hardest country in the game to price. Years of high inflation and a gap between official and parallel exchange rates mean a peso figure can be weeks out of date, and converting it to dollars gives very different answers depending on which rate you use. Read the Argentine numbers as the roughest in the table. The tax layer is real but secondary to that: IVA runs at 21%, with many basic foods at a reduced 10.5%, and neither rate is what moves an Argentine price from one month to the next. When a currency loses a large fraction of its dollar value inside a year, every other explanation for a price becomes a rounding error.",

AU: "Australia combines high wages with high retail costs and long domestic supply lines. Groceries are concentrated between two supermarket chains, which the country's competition regulator has repeatedly examined, and fuel carries an excise that puts it above US levels but well below European ones. The GST is a flat 10% and most basic food is GST-free, so the tax explanation for expensive Australian groceries is weaker than it looks: what you are paying for is distance and wages, not tax. That distinction shows up clearly in the work-time column, where Australia looks far more ordinary than its dollar prices suggest.",

  BD: "Bangladesh has the lowest hourly earnings in the game, which makes the work-time column the only one worth reading closely: a dollar price that looks trivially cheap can still be an afternoon's pay. Domestic rice and vegetables are cheap; everything that arrives by ship is not, and the taka has lost a large share of its dollar value since 2022, so a converted figure ages quickly. VAT is 15%, high for a country at this income level, and it comes with a thicket of reduced rates rather than a clean exemption for food, so the tax wedge on a basket is hard to state in one number.",

BR: "Brazil grows a great deal of what it eats, so staples are cheap in dollar terms even though local incomes are modest. Coffee is the clearest example: Brazil is the world's largest producer, and a café cappuccino costs a fraction of the European price. Brazilian indirect tax is the one case in this table where no single rate can be quoted honestly, because federal, state and municipal levies overlap, and the effective burden on an identical item genuinely differs between states. That complexity is why the Brazilian rows here should be read as national approximations, and why a Brazilian reader may find their own supermarket disagrees.",

CA: "Canadian dairy sits under a supply-management system that sets production quotas and import tariffs, holding milk prices notably above US levels. Most other groceries track the US closely, which makes the dairy gap stand out in the table. Tax does not explain it: basic groceries are zero-rated for GST, so the milk premium is a production-side policy rather than something added at the till. Canada is a useful control case for exactly that reason. It shares a border, a language and most of a retail market with the US, so where the two diverge, the cause is almost always a specific Canadian policy rather than a general cost-of-living difference.",

CH: "Switzerland is the most expensive country in the game for almost every item, and the Big Mac Index has used it as the standing example of an overvalued currency for years. High wages are the main cause, and Swiss prices look far less extreme once you divide by what people earn. It is also, strikingly, a low-tax country on consumption: VAT is 8.1%, among the lowest in Europe, and food is charged at just 2.6%. Switzerland is therefore the cleanest disproof in this table of the idea that expensive countries are expensive because of tax. Almost none of the Swiss premium is collected by the state.",

  CL: "Chile is the most open economy in South America by tariff levels, so imported goods land closer to world prices here than in its neighbours, and the peso is a cleaner conversion than the Argentine or Colombian equivalent. The tax story is unusually simple: 19% IVA on essentially everything, with no reduced band for food, which is rare in Latin America and means the state takes the same cut of a bottle of beer as of a litre of diesel. Pump prices are smoothed by MEPCO, a stabilisation mechanism that damps the weekly moves other countries pass straight through.",

CN: "Chinese prices vary enormously between tier-one cities and smaller ones, so a single national figure hides a wide spread. Imported and branded goods carry a premium; domestically produced staples are among the cheapest in the game. VAT is banded rather than flat, at 13%, 9% or 6% depending on category, with food and agricultural products at 9%, which means the tax wedge itself differs between two items in the same basket. Read the Chinese column as an urban average with a wide error bar around it, not as a price any particular shopper pays.",

  CO: "Colombian dollar prices move with the peso more than with anything happening in a Colombian shop, so read the figures here as a snapshot of an exchange rate as much as of a market. Coffee is the obvious exception: Colombia grows it, and it is priced accordingly. Fuel is the story of the last few years. Petrol and diesel were held below cost for a decade through the FEPC stabilisation fund, and the unwinding of that subsidy from 2022 raised pump prices sharply, which is why Colombia no longer looks like a cheap-fuel country. IVA is 19% with a long list of exclusions.",

  CR: "Costa Rica is conspicuously expensive for Central America, and the reasons are structural rather than fiscal: a small domestic market, wages well above its neighbours, and most manufactured goods imported. Its VAT has the most finely graded ladder in this table, running from 13% standard down through 4% for private health, 2% for medicines and 1% for goods of basic consumption, which means the headline rate says very little about what any particular item carries. Electricity is close to fully renewable and priced by a regulator rather than a market, so it moves in steps rather than with fuel.",

  CZ: "Czechia is inside the EU and outside the euro, so a koruna price converts through a rate that moves, and dollar figures here drift for reasons that have nothing to do with Czech shops. Wages are well below western Europe and rising faster. The VAT band is worth reading precisely: the reduced 12% rate covers groceries but explicitly excludes most drinks, so milk and a soft drink sitting next to each other on a shelf carry different tax. Household energy has been among Europe's dearer since 2022, which shows in the electricity and gas rows rather than in the food ones.",

DE: "Germany has some of the cheapest groceries in Western Europe, largely because of intense competition between discount chains like Aldi and Lidl. Fuel goes the other way: energy taxes and levies make up roughly half the pump price. The VAT structure sharpens both effects: 19% standard but 7% on most food, so the German state takes a far smaller cut of a grocery basket than of a tank of petrol. Germany is the clearest illustration in the table of why food and fuel prices in the same country can sit at opposite ends of the European range.",

EG: "Egypt has the cheapest fuel in the game by a wide margin, and the state has subsidised petrol for decades, though it has been cutting those subsidies under IMF programmes since 2016. Successive devaluations of the pound also make Egyptian prices look very low once converted to dollars. VAT is 14% with several basic foods exempt, but in a country where the currency has repeatedly halved against the dollar, the exchange rate does more to the numbers on this page than the tax code does. Egyptian figures are best read alongside the date they were collected.",

ES: "Spain is cheaper than the northern eurozone across the board despite sharing the currency, which is a clean illustration of why a single exchange rate cannot equalise prices. Fresh produce is especially cheap, since Spain is one of Europe's main growers. Spanish VAT reinforces the pattern with an unusually generous food regime: 10% on food generally, but a super-reduced 4% on staples including bread, milk and eggs. Comparing Spain with Ireland or Portugal, which share the currency and charge 23% standard, is the most direct way this table shows what national tax policy does to prices inside a single monetary union.",

FR: "France sits in the middle of the eurozone range. Its grocery sector is shaped by decades of price-control law governing what supermarkets may charge relative to what they pay suppliers, which compresses the spread between chains. Food carries 5.5% TVA against a 20% standard rate, one of the wider gaps in Europe between what a country charges on groceries and what it charges on everything else. The café items are the ones to watch here: prepared food and drink consumed on the premises are taxed differently from the same items taken away, which is part of why a French cappuccino and a French litre of milk sit in such different places relative to their neighbours.",

GB: "The UK's prices sit between the eurozone and North America. Fuel duty plus VAT accounts for well over half the pump price, and most supermarket food is zero-rated for VAT, which is why the gap between British food and fuel prices is unusually wide. Zero-rating is not the same as exemption. It is a deliberate 0% band that still lets retailers reclaim VAT on their inputs, and it is one of the most generous food regimes in Europe against a fairly high 20% standard rate. Britain is the sharpest example in the table of a country that taxes driving heavily and eating barely at all.",

  GH: "The cedi has repeatedly lost a large share of its dollar value, so a Ghanaian figure converted today and the same figure converted a year ago are not really comparable, and the dollar column here should be read with that in mind. The headline VAT rate of 15% also understates the wedge: two earmarked levies of 2.5% each, for health insurance and education, sit on top and are not recoverable the way VAT is. Fuel has been fully deregulated since 2015, so pump prices track the exchange rate almost immediately, which is unusual in the region.",

  HU: "Hungary charges 27% VAT, the highest standard rate in the world, and that single fact explains more about Hungarian prices than anything else in this note. Food falls to 18% for milk, dairy and cereal products and to 5% for a few others, but the gap between the headline rate and what a shopper actually pays is smaller here than almost anywhere. Pulling the other way, household energy is heavily regulated: the long-running utility price cap holds electricity and gas well below what the market would charge, so those rows look out of step with the rest of the country's prices.",

ID: "Indonesia is among the cheapest countries in the game for prepared food and fuel, both of which have long histories of state price management. Dairy is the outlier: little is produced domestically, so milk is imported and priced accordingly. VAT rose to 12% recently, with basic necessities exempt, which keeps the tax wedge off exactly the staples that dominate an Indonesian household budget. The interesting tension in the Indonesian row is between cheap prepared food and expensive imported dairy: two items from the same shop with completely different explanations behind their prices.",

IE: "Ireland is the most expensive eurozone country in most of this table. Wages are high, the retail market is small and geographically isolated, and hospitality prices in particular have run ahead of the euro-area average since 2021. Its tax structure is unusually polarised: 23% standard, among the highest in the EU, alongside zero-rating for most basic food. So an Irish grocery basket carries almost no VAT while an Irish restaurant bill carries a great deal, and the two Irish figures in this table that diverge most from their eurozone neighbours are the prepared ones. Ireland and Spain make the sharpest pair here: same currency, opposite tax philosophies.",

  IL: "Israel combines high wages with a small, geographically isolated market and heavy reliance on imports, and the cost of living has been a live political issue since the 2011 street protests over the price of cottage cheese. VAT is 18% and applies to food at the full rate, with no reduced band, which is unusual among high-income countries and pushes grocery prices up relative to Europe. Electricity is the counterweight: offshore natural gas discovered in the last fifteen years now generates most of the country's power, and it shows in a household tariff below the European average.",

IN: "India has the cheapest Big Mac in the Economist's index, though the Indian sandwich is a Maharaja Mac, since McDonald's does not sell beef there, which is the one place the index's like-for-like premise breaks down. Local staples are inexpensive; imported and branded goods are not. GST is tiered from 5% to 28% with a general rate of 18%, and most fresh unprocessed food is nil-rated, so the tax system draws a hard line between what comes from a farm and what comes from a factory. That line is visible directly in this table: the unbranded items sit near the bottom of the global range while the branded ones climb toward the middle.",

IT: "Italy runs close to the eurozone average on groceries but below it on café prices. An espresso taken standing at the bar is still priced at a level many Italians treat as near-fixed, and that convention holds cappuccino prices down relative to northern Europe. Basic food carries just 4% IVA against a 22% standard rate, one of the largest such gaps anywhere in the EU. Italy is therefore a country where the state has decided, in tax law, that groceries are close to untaxable, and the cappuccino convention is a second, entirely informal version of the same instinct applied to coffee.",

JP: "Japan is the clearest case in the game of a country that stopped feeling expensive. A weak yen has pushed dollar prices well below where they sat a decade ago, and the Big Mac Index now scores the yen as one of the most undervalued major currencies. Fruit is the exception, since premium apples are a gift category and priced like one. Japan also runs one of the few consumption taxes that changes with how you consume: 10% standard, but 8% on food and non-alcoholic drinks bought to take away, so the same coffee is taxed differently depending on whether you sit down with it. For a table built partly out of café items, that distinction is not academic.",

KR: "South Korea has notably expensive fruit. Tariffs and quarantine rules restrict imports of many fresh products, and domestic orchard land is limited, so apples cost several times what they do in producing countries. Prepared food and transport, by contrast, are cheap for a high-income country. VAT is a flat 10% with basic unprocessed foodstuffs exempt, so tax explains almost none of the fruit premium. It is border policy and land, not the till. Korea is the strongest case in the table for reading a single item's price as a story about trade rules rather than about the general cost of living.",

LB: "Lebanon's currency collapsed after 2019, and for several years official and market exchange rates diverged so far that dollar conversions were close to meaningless. Prices have since re-anchored around the US dollar in practice. Several items are missing here, because the crowd-sourced surveys that cover them do not have reliable Lebanese samples. VAT is 11% on paper, but in an economy that dollarised informally after a banking collapse, the published rate tells you much less about a real transaction than it would anywhere else in this table. Lebanon is included for completeness and should be read as the least reliable column here.",

MX: "Mexico produces much of its own fresh food, keeping groceries cheap in dollar terms, but the peso has been comparatively strong in recent years, which lifts Mexican prices when converted. Fuel is taxed but has also been subject to periodic government caps. Food and medicines carry 0% IVA against a 16% standard rate, a true zero rate rather than an exemption, and one of the more far-reaching food carve-outs in the Americas. Between domestic production and a zero rate on groceries, the Mexican food column has very little in it beyond the cost of growing and moving the food itself.",

  MY: "Malaysia is an oil and gas exporter that spends heavily on keeping fuel cheap. RON95 petrol is capped rather than priced, so the pump barely moves when crude does, and diesel carries its own managed rate. There is also no VAT here: the country replaced GST in 2018 with a narrower sales tax on goods at 10% and a service tax at 8%, so the tax wedge on an ordinary grocery basket is small by regional standards. Cheap energy plus a light consumption tax is why Malaysia sits low in the dollar rankings for a country of its income.",

  NG: "No country in this table has been repriced as violently in the last three years. The naira was floated in 2023 and the petrol subsidy removed in the same year, which multiplied the pump price several times over and reset almost every other price behind it. A Nigerian dollar figure is therefore a statement about the exchange rate at least as much as about a Nigerian shop. VAT is 7.5%, among the lowest anywhere and applied with a defined list of zero-rated basic foods, so the state is not what makes anything here expensive.",

NL: "The Netherlands is a major agricultural exporter despite its size, and its dairy and produce prices reflect that. Fuel is among the most expensive in the game, with Dutch excise duties near the top of the EU range. Food sits at 9% against a 21% standard rate, a middling European carve-out rather than a generous one. The Dutch pattern is the mirror image of Germany's next door: comparable food prices, but a noticeably heavier hand on fuel, which is a policy choice rather than a difference in the cost of importing petrol into two adjacent North Sea ports.",

NO: "Norway is an oil exporter with some of the most expensive petrol in the world, which is not a contradiction: fuel is heavily taxed as climate policy, and the revenue funds the sovereign wealth fund. Food is expensive too, protected by high agricultural tariffs. VAT is 25%, among the highest anywhere, though food is charged at a reduced 15%, which is still higher than the standard rate of several countries in this table. Norway is where the two halves of this dataset diverge most: it has the resources to be a cheap place to drive and has deliberately chosen not to be.",

NZ: "New Zealand exports most of what it farms, so domestic dairy prices track world markets rather than local production costs, which is why milk is not as cheap as a country of that many cows might suggest. Groceries generally run above Australian levels. Its GST is the purest in the table: 15% on essentially everything, with no food exemption at all, a design economists often hold up as the textbook version of a consumption tax. Comparing New Zealand with Australia is therefore unusually clean: similar economies and supply chains, but one exempts basic food from GST and the other does not.",

  PE: "Peru is a mining exporter with one of the steadier currencies in Latin America, which makes its dollar figures more durable than Argentina's or Colombia's. Domestic food is cheap and largely home-grown, and Lima's much-praised restaurant scene is invisible in national averages. The IGV runs at 18% and applies broadly, so the consumption-tax wedge on ordinary purchases is higher than in Mexico, where food is zero-rated. Pump prices are close to unsubsidised, which puts Peruvian fuel above its Andean neighbours and roughly at world levels.",

  PH: "The Philippines pays for its geography. Moving goods between more than seven thousand islands adds a freight cost to almost everything, and it lands on top of a 12% VAT. Electricity is the sharpest case: generation is privately owned, largely coal-fired and largely imported, and there is no household subsidy, which leaves Filipino households paying among the highest power tariffs in Asia in dollar terms, and far more than that measured against local wages. Rice is the countervailing example, managed through tariffs and an import fund precisely because it is politically impossible to let it float.",

  PK: "Pakistani hourly earnings are among the lowest in the game, so the work-time column is where this country's prices actually live: figures that read as cheap in dollars are not cheap to the person paying them. Sales tax on goods is 18%, high for the income level, and provinces levy their own 15% to 16% on services on top. Successive devaluations and the energy tariff increases required under IMF programmes have pushed electricity and fuel up faster than wages, which is why those two rows sit oddly high against everything else here.",

PL: "Poland is among the cheapest EU countries in the game while having wages well above the global median, which makes its work-time figures unusually good. The złoty floats independently of the euro, so Polish prices move against eurozone neighbours from year to year. Basic food carries 5% VAT against a 23% standard rate, so a Polish grocery basket is taxed at roughly a fifth of the rate applied to everything else. Poland is the best illustration here of why work time is a better comparison than dollars: on price alone it looks like a poor country, and on hours worked it does not.",

PT: "Portugal has eurozone prices on a lower wage base, so its work-time figures are among the least favourable in Western Europe. Café prices are a notable exception and remain some of the cheapest in the eurozone. Essential food is charged at 6% against a 23% standard rate, the same headline rate as Ireland and Poland, applied to a very different income level. That combination is what makes Portugal the country in this table where the gap between the dollar column and the work-time column is most worth reading carefully: the prices are Western European and the wages are not.",

  RO: "Romania raised its standard VAT from 19% to 21% in 2025 to close a budget deficit, making it one of the few countries in Europe to put its rate up rather than down in recent years. Most food sits at a reduced 11%, but the relief stops at alcohol and at food with added sugar above a threshold, so the beer and spirits rows carry the full rate. Wages have risen quickly from a low base and are still below the EU average, which is why Romania often looks cheap in dollars and much less so in work time.",

SA: "Saudi Arabia has some of the cheapest fuel in the game, with domestic petrol priced well below world markets, though the kingdom has raised it repeatedly since 2016 as part of budget reform. Food is largely imported and priced closer to global levels. VAT was introduced in 2018 and tripled to 15% in 2020, with no reduced rate for food, so Saudi groceries now carry a heavier tax load than groceries in most of Europe. The kingdom is a useful reminder that a country can subsidise one item heavily and tax the rest at a high flat rate at the same time.",

SE: "Sweden has high fuel taxes and high wages, a combination that puts it near the top of the table in dollar terms and much nearer the middle once measured in work time. Groceries are cheaper than in Norway, since Sweden's agricultural protection is lighter. Food is taxed at 12% against a 25% standard rate, so the Swedish food carve-out is real but less generous than the southern European ones. Sweden and Norway make the most informative Nordic pair in this table: comparable wages and climates, meaningfully different agricultural and fuel policies, and a visible price gap that follows from them.",

SG: "Singapore imports more than 90% of its food, so grocery prices are set by shipping and wholesale markets rather than local farming. Fuel and vehicle costs are deliberately high as congestion policy, which is why petrol here sits near the European range despite low taxes elsewhere in the economy. GST is 9% and applies to groceries with no exemption. Singapore is one of the few high-income countries that taxes food at the full rate on principle, preferring to compensate lower-income households directly rather than through the tax code. It is the clearest case in the table of a country whose food prices are set almost entirely offshore.",

TH: "Thailand is among the cheapest countries in the game for prepared food and produce, both grown domestically in quantity. Dairy is the exception, as it is not traditionally a large part of the diet and much of the supply is imported. VAT is 7%, the lowest headline rate of any country in this table apart from the Gulf states, and fresh unprocessed food is exempt on top of that. Between domestic agriculture and a very light consumption tax, the Thai food rows are close to a floor for what these items can cost anywhere in the world.",

TR: "Turkey has run high inflation for several years, so lira prices climb quickly while the currency falls against the dollar. The two roughly offset, which keeps Turkish dollar prices low but makes any single reading unusually time-sensitive. KDV is 20% standard with reduced bands of 10% and 1% covering most food, and those bands have themselves been moved repeatedly during the inflation of recent years. Turkey is the country in this table where the collection date matters most after Argentina: the figures are not wrong so much as perishable.",

  TZ: "Tanzania is one of the cheaper countries here in dollar terms, on low wages and a food supply that is mostly domestic, so the interesting reading is again the work-time column rather than the price one. It is also the only country in the table with two consumption-tax systems: VAT runs at 18% on the mainland and under a separate Zanzibar regime at 15% for most supplies, and basic agricultural products and food for human consumption are exempt from both. A single national electricity tariff hides very large differences in what it costs to actually reach a household.",

US: "The United States is the reference point for the Big Mac Index, so its burger price is the baseline every other country is measured against. American fuel is cheap by rich-country standards, since federal and state fuel taxes are a fraction of European levels, while its food prices sit mid-range. It is also the only country here with no VAT at all: sales tax is set by states and municipalities, most states exempt groceries entirely, and the rate genuinely differs between two towns an hour apart. Every other column in this table has a national tax rate that can be quoted; the American one does not, and the figure here is a national average papering over real internal variation.",

  UY: "Uruguay is small, high-income by South American standards, and expensive in a way that surprises people who expect it to price like its neighbours. Part of that is a market of three and a half million people; part is a 22% IVA, the highest standard rate in the Americas. Food drops to 10% and milk is exempt outright, so the tax wedge on a grocery basket is narrower than the headline suggests. Beef is the exception that proves the rule: Uruguay exports a great deal of it, and it is priced for a local buyer accordingly.",

VN: "Vietnam is among the cheapest countries in the game across nearly every item. It is also the world's second-largest coffee producer, which shows up directly in café prices. Dairy is the usual exception for a country without a large domestic herd. VAT is 10% with foodstuffs at a reduced 5%, a modest wedge by regional standards. What makes Vietnam interesting in this table is that its cheapness is mostly genuine production advantage rather than a weak currency or a subsidy. The coffee is cheap because it is grown next door, which is the simplest explanation for a price anywhere on this site.",

ZA: "South Africa has low prices in dollar terms but the widest gap in the game between price and affordability: measured in work time at the average wage, its groceries cost far more than the dollar figures suggest. Fuel is regulated and adjusted monthly by the government. VAT is 15% with a defined basket of basic foods zero-rated, a list that is explicitly a poverty measure and has been publicly debated and extended over the years. South Africa is the strongest argument in this dataset for not reading dollar prices as a cost of living: on the dollar column it looks affordable, and on the work-time column it is the hardest country in the table.",
};
