// Long-form guides.
//
// READ THIS BEFORE WRITING ONE.
//   Every article starts life as `status: "draft"`. Drafts are reachable by
//   direct URL, but they carry a noindex tag, stay out of the sitemap, and
//   don't appear on /blog. That matters more than it sounds. A pile of
//   half-finished pages does a site's standing more harm than having no blog at
//   all, and search engines and ad reviewers both notice.
//
//   Publishing takes three edits. Fill in `body`, delete the `outline`, set
//   `status` to "published". The article then shows up on /blog, in the sitemap
//   and in the index. There is nothing else to wire up.
//
//   The outlines are a plan rather than filler. They never render on the page.
//
// COPY RULES.
//   Paragraph strings understand two inline forms and no others: **emphasis**
//   and [label](/path). See lib/richtext.tsx. Use emphasis on the number or
//   phrase a reader should walk away with, never on a whole sentence. Anything
//   structural (a table, a pulled quote, a stat row) needs its own block so
//   components/ArticleBody.tsx can style it.
//
//   Every article closes with a `cta` block. They all argue the same thing,
//   that knowing what things cost is a trainable skill, so they all end by
//   pointing at the game where you train it.

/** A source the article draws on. Rendered as a list at the foot of the page. */
export interface ArticleSource {
  /** Publication first, then what the piece is. Short enough to scan. */
  label: string;
  url: string;
}

export type ArticleBlock =
  /** Body copy, optionally under a section heading. */
  | { kind: "prose"; heading?: string; paragraphs: string[] }
  /** Three or four display-size figures. At most one block per article. */
  | {
      kind: "stats";
      heading?: string;
      items: { value: string; label: string }[];
    }
  /** Numbered by default; pass `ordered: false` for a plain bulleted list. */
  | {
      kind: "list";
      heading?: string;
      intro?: string;
      ordered?: boolean;
      items: string[];
    }
  /** First column is the row header. The rest are right-aligned figures. */
  | {
      kind: "table";
      heading?: string;
      intro?: string;
      caption?: string;
      columns: string[];
      rows: string[][];
    }
  | { kind: "quote"; text: string; attribution?: string }
  /** The paragraph without which the article has no point. */
  | { kind: "callout"; heading?: string; paragraphs: string[] }
  /** Closing call to action. Always links to the game. */
  | { kind: "cta"; heading: string; paragraphs: string[]; buttonLabel: string };

export interface Article {
  slug: string;
  title: string;
  /** Meta description, and the summary /blog shows. Aim for 140-160 chars. */
  description: string;
  /** ISO date. Use the day you actually publish, not the day you started. */
  date: string;
  /**
   * ISO date of the last substantive revision, if there has been one.
   *
   * Leave it off until the text actually changes. It drives both the visible
   * "Updated" line and `dateModified` in the article's structured data, and a
   * piece that advertises a revision it never had devalues every date on the
   * site. Fixing a typo is not a revision.
   */
  updated?: string;
  status: "draft" | "published";
  /** Rough reading time in minutes. Update it once the piece is written. */
  readingMinutes: number;
  /** Notes to yourself. Never rendered. Delete once `body` exists. */
  outline?: string[];
  /** The article itself. Rendered in order. */
  body?: ArticleBlock[];
  sources?: ArticleSource[];
}

// Sources more than one article cites. Defined once here so that fixing a URL
// fixes it everywhere at the same time.
const S = {
  today1997: {
    label: "TODAY: 1997 grocery receipt price comparison goes viral",
    url: "https://www.today.com/food/groceries/1997-grocery-receipt-price-comparison-viral-video-rcna252816",
  },
  yahoo1997: {
    label:
      "Yahoo Creators: A viral grocery receipt from 1997 is breaking people's brains",
    url: "https://creators.yahoo.com/lifestyle/story/a-viral-grocery-receipt-from-1997-is-breaking-peoples-brains-053353452.html",
  },
  aol1997: {
    label: "AOL: 1997 grocery receipt stuns TikTok",
    url: "https://www.aol.com/articles/1997-grocery-receipt-stuns-tiktok-222438795.html",
  },
  marysue1997: {
    label: "The Mary Sue: Texas woman recreates a 1997 H-E-B grocery bill",
    url: "https://www.themarysue.com/texas-woman-recreates-a-1997-h-e-b-grocery-bill-with-122-items-heres-how-much-the-total-has-changed/",
  },
  aolMilk: {
    label: "AOL: Milk isn't $2 anymore",
    url: "https://www.aol.com/lifestyle/milk-isn-t-2-anymore-162025865.html",
  },
  mirror2006: {
    label: "The Mirror: Walmart shopper's 2006 grocery bill",
    url: "https://www.themirror.com/lifestyle/shopping/walmart-shopper-2006-grocery-bill-1846764",
  },
  statcan: {
    label: "Statistics Canada: Perceived versus measured inflation",
    url: "https://publications.gc.ca/collections/collection_2022/statcan/62f0014m/62f0014m2021017-eng.pdf",
  },
  europarl: {
    label: "European Parliament: Inflation perceptions across household groups",
    url: "https://www.europarl.europa.eu/RegData/etudes/STUD/2026/779873/ECTI_STU(2026)779873_EN.pdf",
  },
  moneyProgression: {
    label: "Money Progression: Personal inflation rate calculator",
    url: "https://moneyprogression.com/personal-inflation-rate-calculator/",
  },
  nnng: {
    label: "NNNG: Personal inflation calculator and category breakdown",
    url: "https://nnng.com/personal-inflation-calculator/",
  },
  finexus: {
    label: "Finexus: The things that got cheaper",
    url: "https://finexus.net/insights/bls/price-ep6-cheaper-20260321-170000.html",
  },
  techspot: {
    label: "TechSpot: TV prices have fallen more than 90% since 2000",
    url: "https://www.techspot.com/news/110875-tv-prices-have-fallen-more-than-90-since.html",
  },
  humanProgressEgg: {
    label: "HumanProgress: Eggs in perspective",
    url: "https://humanprogress.org/egg-perspective/",
  },
  humanProgressBlueCollar: {
    label:
      "HumanProgress: Falling food prices for blue-collar workers, 1919-2019",
    url: "https://humanprogress.org/falling-food-prices-for-blue-collar-workers-in-the-united-states-1919-2019/",
  },
  pooleyPerry: {
    label: "Gale Pooley: Time pricing Mark Perry's chart of the century",
    url: "https://galepooley.substack.com/p/time-pricing-mark-perrys-chart-of",
  },
  bigMac2026: {
    label: "Big Mac Index: 2026 complete breakdown",
    url: "https://bigmacindex.app/blog/big-mac-index-2026-complete-breakdown/",
  },
  bigMacIndex: {
    label: "Big Mac Index: country comparison tool",
    url: "https://bigmacindex.com/",
  },
  iphone3tej: {
    label: "3tej: Hours of work per iPhone, 2026, by country",
    url: "https://3tej.com/blog/hours-of-work-per-iphone-2026-by-country",
  },
  jemlit: {
    label: "Jemlit: Who can afford the iPhone most easily",
    url: "https://jemlit.com/blog/who-can-afford-the-iphone-easiest/",
  },
  wealthvieuTwoIncomes: {
    label: "WealthVieu: Why two incomes aren't enough",
    url: "https://wealthvieu.com/why-two-incomes-arent-enough/",
  },
  scottBurns: {
    label: "Scott Burns: The real change in family finances",
    url: "https://scottburns.com/the-real-change-in-family-finances/",
  },
  modernMoneyLife: {
    label: "Modern Money Life: Why two incomes still feel tight",
    url: "https://modernmoneylife.com/work/why-two-incomes-still-feel-tight.html",
  },
  longitude: {
    label: "Longitude Financial Planning: The two-income trap",
    url: "https://www.longitudefinancialplanning.com/blog/the-two-income-trap-how-dual-earners-became-an-economic-necessity-and-strategies-for-single-income-survival",
  },
  cnbcSingleIncome: {
    label: "CNBC: Single-income households in a six-figure economy",
    url: "https://www.cnbc.com/2025/12/11/single-income-households.html",
  },
  anchoringPmc: {
    label: "PMC: The anchoring effect: a review of the evidence",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8860899/",
  },
  referencePrice: {
    label: "Journal of Consumer Psychology: Internal reference prices",
    url: "https://myscp.onlinelibrary.wiley.com/doi/abs/10.1002/arcp.1093",
  },
  implicitPrice: {
    label: "Research review: Implicit price memory for routine purchases",
    url: "https://seekscholar.com/sites/default/files/reference%20price%201.pdf",
  },
  anchorsPersist: {
    label:
      "ResearchGate: Uninformative anchors have persistent effects on valuation",
    url: "https://www.researchgate.net/publication/330469173_Uninformative_Anchors_Have_Persistent_Effects_on_Valuation_Judgments",
  },
  coherentArbitrariness: {
    label: "SSRN: Coherent arbitrariness: anchors and willingness to pay",
    url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=383341",
  },
  scienceDirectFraming: {
    label:
      "Journal of Retailing: Reference-price framing and perceived fairness",
    url: "https://www.sciencedirect.com/science/article/abs/pii/S0022435903000538",
  },
  frontiers: {
    label: "Frontiers in Psychology: Price anchors and willingness to pay",
    url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1497372/full",
  },
} satisfies Record<string, ArticleSource>;

export const ARTICLES: Article[] = [
  // ---------------------------------------------------------------------------
  {
    slug: "1997-grocery-receipt-vs-today",
    title: "A grocery receipt from 1997 made millions of people furious",
    description:
      "122 items for $155 in 1997. The same cart today costs just over $500. Official inflation says it should be $312, and that missing $190 is the whole story.",
    date: "2026-06-14",
    status: "published",
    readingMinutes: 7,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Zoe Dippel wasn't looking for a fight with the entire American economy. She was at her sister-in-law's house, flipping through a baby book her mother-in-law had passed down, when a folded slip of paper fell out from between the sonogram photos. A grocery receipt. H-E-B. Dated **June 20, 1997**.",
          "One hundred and twenty-two items. Produce, meat, pantry staples, baby food, diapers for twin girls. The kind of haul that fills a cart until the wheels complain.",
          "Total: **$155**.",
          "Go ahead and sit with that for a second. Before you read on, guess what that same cart costs today. Actually guess. Write the number down if you have to.",
          "Done?",
          "Dippel did the experiment for you. At her viewers' urging, she plugged all 122 items into H-E-B's shopping app, line by line, and re-bought her mother-in-law's 1997 grocery trip at today's prices. The total came to **just over $500**, an increase of roughly **220 percent**.",
          "The video went past 2 million views on TikTok. The comments read less like a comment section and more like a support group.",
        ],
      },
      {
        kind: "stats",
        items: [
          { value: "$155", label: "122 items, June 1997" },
          { value: "$500", label: "The identical cart today" },
          { value: "+220%", label: "Increase across 28 years" },
        ],
      },
      {
        kind: "prose",
        heading: "The line items are where it stops being abstract",
        paragraphs: ["Percentages are easy to shrug off. Line items are not."],
      },
      {
        kind: "table",
        columns: ["Item", "1997", "Today"],
        rows: [
          ["Little Debbie brownies", "$1.09", "$5.75"],
          ["Bag of coffee", "$2.47", "$9.43"],
          ["Jar of honey", "$2.49", "$9.95"],
          ["Cantaloupe, each", "$0.77", "$2.58"],
          ["State Fair corn dogs, 22-count", "$2.49", "$14.30"],
          ["Diapers", "$12.99", "$31.47"],
        ],
        caption:
          "Prices from the original H-E-B receipt against the same products re-priced in the H-E-B app.",
      },
      {
        kind: "prose",
        paragraphs: [
          "Look at the corn dogs, the great equalizer of 90s childhood dinners, up nearly **six times**. Then look at the diapers, which is the line on that receipt you cannot skip, cannot substitute, and cannot “just budget better” around.",
          "One commenter summed up the collective reaction to the produce prices in four words.",
        ],
      },
      {
        kind: "quote",
        text: "I'm sorry, CENTS?!?!!",
        attribution:
          "A commenter, on discovering cantaloupes once cost 77 cents",
      },
      {
        kind: "prose",
        heading: "“But that's just inflation” is exactly the wrong take",
        paragraphs: [
          "This is where I lose patience with the reflexive economics-brained reply, the one under every viral receipt saying well, actually, prices rise over time, this is normal.",
          "Run the official math. According to the Bureau of Labor Statistics inflation calculator, $155 in 1997 should be about **$312** today.",
          "The cart cost **$500**.",
        ],
      },
      {
        kind: "callout",
        heading: "The missing $190",
        paragraphs: [
          "That gap between what inflation says the cart should cost and what it actually costs is the whole story. Some of it is shrinkflation: commenters were quick to point out that many of those “same” packages now contain fewer ounces, so you're paying triple for less product. Some of it is that food has simply outrun the average of everything else.",
          "Either way, when someone quotes you the official inflation number and your gut says that's not my life, your gut is reading your receipts correctly.",
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "And prices are only half of the equation. The other half is what you earn to pay them.",
          "When that receipt was printed in June 1997, the federal minimum wage was $4.75. Today it's $7.25, an increase of **52 percent** against a grocery basket that went up **220**. To keep pace with that one cart of groceries, the minimum wage would need to be **$15.30 an hour**.",
          "One commenter did the arithmetic that every worker feels in their bones but rarely sees written out: the same basket of goods now requires about **79 percent more hours of work** than it did in 1997.",
          "Read that again. Not “prices went up.” You have to trade 79 percent more of your one finite life for the same groceries.",
        ],
      },
      {
        kind: "prose",
        heading: "The comment that should haunt you",
        paragraphs: [
          "Out of thousands of replies, one stopped Dippel cold, and it stopped me too. A woman wrote that her father earned the same salary in 1997 that she earns today. On that salary, he supported a family of five with a stay-at-home wife. Today, she and her husband both work, they have two kids, and they barely clear each month.",
        ],
      },
      {
        kind: "quote",
        text: "My parents paid $650 for a 3-bedroom house. I'm paying $1,500 for a one-bedroom apartment.",
        attribution: "Another commenter on the same video",
      },
      {
        kind: "prose",
        paragraphs: [
          "This is why the receipt hit so hard. It works as evidence rather than nostalgia. For years an entire generation has been told the problem is personal: the lattes, the takeout, the avocado toast, the “just work harder” chorus. And then a piece of thermal paper from a baby book turns up and says, in fading ink: no. The math changed. You didn't.",
          "Dippel, a 24-year-old dental hygienist who says she's fortunate to be making ends meet herself, put it plainly after reading thousands of these stories: “It shouldn't be this hard to live. An entire generation is struggling to imagine buying a home, building savings or planning for the future.”",
          "She's right. And the fact that a grocery receipt had to say it, because decades of official statistics somehow didn't, tells you how wide the gap between the data and the dinner table has grown.",
        ],
      },
      {
        kind: "prose",
        heading: "This keeps happening, because the receipts keep surfacing",
        paragraphs: [
          "The 1997 receipt isn't even an isolated case. A few months earlier, a **2006 Walmart receipt** went viral on X: 79 items, $161.87, found in a late mother's belongings. The woman who posted it said it made her fall to her knees. That post pulled 7.4 million views, and internet sleuths re-priced the haul at well over $400 today, over a period in which real wages rose maybe 10 to 15 percent.",
          "“You can sit $160 worth of groceries in the front seat now,” one reply said.",
          "Every one of these receipts is a tiny time capsule, and every time one surfaces, millions of people have the same reaction: shock, then anger, then a strange relief. Because it's validating. It's proof that the squeeze you feel at the register is not a personal failure. It's arithmetic.",
        ],
      },
      {
        kind: "prose",
        heading: "So here's a question: how good is your price radar, really?",
        paragraphs: [
          "Now the uncomfortable part, and I say this with love: most of us are terrible at prices. We anchor to whatever things cost when we first started paying attention, and then we never update. It's why parents genuinely believe milk is still $2, and why a 23-year-old spending $350 a month on basic groceries gets lectured about lattes. Everyone is walking around with a mental price list that's five, ten, thirty years out of date.",
          "You just proved it to yourself, probably. Scroll back up. What did you guess for that 1997 cart? Were you within $50 of $500? Within $100?",
          "That gap between what you think things cost and what they actually cost is exactly the blind spot these viral receipts keep exposing. And it's trainable.",
        ],
      },
      {
        kind: "cta",
        heading: "Find out how far your price radar has drifted",
        paragraphs: [
          "Pricele is a one-minute daily game: one real item, you guess what it costs, you find out how close you landed. Fair warning, the first few days are humbling.",
          "The 1997 receipt made millions of people realise they'd lost track of what things cost. Playing every day is how you get it back.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      S.today1997,
      S.yahoo1997,
      S.aol1997,
      S.marysue1997,
      S.mirror2006,
      {
        label: "Audacy: 20-year-old grocery bill sparks disbelief",
        url: "https://www.audacy.com/national/news/20-year-old-grocery-bill-sparks-disbelief",
      },
      S.aolMilk,
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "official-inflation-vs-your-receipt",
    title: "Official inflation says 87%. Your receipt says 220%.",
    description:
      "Someone is wrong about inflation, and it isn't your receipt. Four structural reasons why the official number was never measuring your life to begin with.",
    date: "2026-06-21",
    status: "published",
    readingMinutes: 9,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "There's a moment everyone has had at the checkout in the last few years. The total flashes up, and your brain does a little stutter-step. That can't be right. You scan the cart looking for the wagyu you didn't buy, the truffle oil that must have fallen in. Nope. Eggs, bread, coffee, dish soap. Just groceries.",
          "Then you go home, turn on the news, and a very calm person tells you inflation is running at 3 percent. Under control. Cooling, even.",
          "Both of these things cannot be true. And I'm going to argue something that sounds conspiratorial but is really just arithmetic: **the official number is not measuring your life**. It measures someone else's, an “average” person who does not exist, buying a basket of things you don't buy, with statistical adjustments you'd never agree to if anyone asked.",
          "Let me show you the receipts. Literally.",
        ],
      },
      {
        kind: "prose",
        heading: "The $190 hole",
        paragraphs: [
          "When a 1997 H-E-B grocery receipt went viral last year, 122 items for $155, the internet did the obvious thing and re-bought the whole haul at today's prices. The new total: **just over $500**.",
          "The part that matters comes next. According to the Bureau of Labor Statistics' own inflation calculator, $155 in 1997 should equal about **$312** today.",
          "$312 is what inflation says happened. $500 is what actually happened. That's a **$190 hole per cart**, every cart, and one commenter nailed why it stings: “Adjusted for inflation $155 would be $312. The extra $192 needed is the problem.”",
          "So where did the $190 go? Nowhere, really. It's hiding in four places the official number is structurally bad at seeing.",
        ],
      },
      {
        kind: "prose",
        heading: "Hiding place 1: the shrinking package",
        paragraphs: [
          "Before you even get to price increases, there's the increase they don't print on the tag. The 500g pack becomes 450g. The six-pack becomes five. The chocolate bar quietly loses two squares. The shelf price barely moves, the index records almost nothing, and your actual cost per unit just jumped **9 to 16 percent**.",
          "Statisticians will tell you, correctly, that CPI tries to track price per unit. But shrinkflation works precisely because you don't compare unit prices; you compare the package to your memory of the package. A cereal box that drops from 18 oz to 15 oz at the same price is a **17 percent** per-ounce increase that doesn't feel like inflation at all.",
          "One analyst called shrinkflation “a tax on consumer attention,” and I can't improve on that. Consumer research estimates that shrinkflation and its uglier cousin skimpflation, same price and worse product, added roughly **2 to 4 percentage points** to the inflation real households experienced from 2021 to 2024, on top of the official figure.",
        ],
      },
      {
        kind: "prose",
        heading: "Hiding place 2: the statisticians assume you downgraded",
        paragraphs: [
          "There's a methodological choice buried in here that most people have never heard of, and it should make you angry. Official CPI builds in **substitution**: when beef gets expensive, the model assumes you rationally switch to chicken, so measured inflation gets adjusted downward, whether or not you actually switched, and whether or not a genuine substitute exists for your situation.",
          "Think about what that means. If you kept buying the food your family actually eats, the index quietly assumed you didn't, and marked your inflation lower for it. The cheaper flat two boroughs away is not a substitute for the flat near your kid's school. The methodology isn't fraud; it's a simplifying assumption. But it is, by design, a downward distortion of the price increases faced by anyone with real constraints.",
          "Same story with **hedonic adjustments**: if this year's product is judged higher-quality than last year's, part of its price increase simply doesn't count as inflation. Defensible for laptops. Insulting for a chicken breast.",
        ],
      },
      {
        kind: "prose",
        heading: "Hiding place 3: the basket isn't your basket",
        paragraphs: [
          "CPI is a weighted average across a standardised basket for a hypothetical average urban consumer. Nobody is that consumer. If housing eats **45 percent** of your budget while the official basket weights it at **25**, and rents are rising fast, your real inflation runs well above the headline, and both numbers are technically true.",
          "And the categories that ran hottest since 2020 are precisely the ones you can't opt out of.",
        ],
      },
      {
        kind: "table",
        intro: "Approximate price change since 2020, by category:",
        columns: ["Category", "Change"],
        rows: [
          ["Auto insurance", "+35%"],
          ["Housing", "+25%"],
          ["Food away from home", "+25%"],
          ["Electricity", "+20%"],
          ["Childcare", "+15%"],
          ["Electronics and clothing", "flat or down"],
        ],
        caption:
          "Everything that rose is something you must buy this month. Everything that fell is something you can postpone forever.",
      },
      {
        kind: "prose",
        paragraphs: [
          "This is why the **Common Man CPI**, an alternative index tracking only necessities like food, energy, clothing and shelter, showed worse inflation than official CPI in nearly every month between 2020 and 2024, peaking near 12 percent when the headline peaked around 9. An Everyday Price Index of frequently purchased items shows the same pattern over a longer arc: from 2001 onward it rose about **3.1 percent a year** against CPI's **2.3**.",
          "When you strip out the discretionary stuff and measure what people are forced to buy, the gap between the news and your receipt shrinks dramatically. Funny how that works.",
          "Housing deserves its own indictment. Because CPI imputes homeownership costs from rents, one analysis found the true cost of buying a home rose roughly **80 percent** from January 2021, while the CPI's shelter component implied about **20**. Anyone who tried to buy a house in that window does not need a footnote to confirm which number is closer to reality.",
        ],
      },
      {
        kind: "prose",
        heading: "Hiding place 4: your brain (yes, some of the gap is you)",
        paragraphs: [
          "Honesty requires this section, so here it is. Part of the perception gap runs the other way. Humans weight price increases far more heavily than decreases, and when researchers built an index trimming out the steep price declines consumers mentally ignore, the gap between measured and perceived inflation **nearly vanished**.",
          "We also over-index on things we buy weekly, food and fuel, and under-index on things we buy rarely, the well-documented frequency bias. And once inflation grabs your attention, the attention sticks: perceptions stay elevated long after the actual rate falls.",
          "So no, CPI is not a conspiracy. It's a consistent, carefully defined statistical average, and its limitations come from the same standardisation that makes it useful.",
        ],
      },
      {
        kind: "callout",
        heading: "What the honest accounting actually adds up to",
        paragraphs: [
          "The statisticians' answer to “why doesn't the official number match my life?” is that it was never measuring your life. It measures an average basket you don't buy, adjusted by substitutions you didn't make, for quality improvements you didn't ask for, with your biggest cost, housing, imputed rather than observed.",
          "Your receipt, meanwhile, measures exactly one thing with perfect accuracy: what it costs to be you. When the two disagree, the receipt isn't lying.",
        ],
      },
      {
        kind: "prose",
        heading: "The only inflation rate that matters is yours",
        paragraphs: [
          "The practical takeaway is more empowering than the doom-scroll version. Since no headline number describes your life, the only useful move is knowing your own numbers. People who track their real category spending routinely find their personal inflation rate sitting **2 to 5 points** away from the official figure, in one direction or the other.",
          "A renter with a new lease and a grocery-heavy budget lives in a different economy than a homeowner on a 2021 fixed rate, and both of them live in a different economy than the evening news.",
          "Which raises an uncomfortable question: how well do you actually know what things cost right now? Not what they cost when you first started paying attention. Now. Most people's mental price list is years out of date, and the gap between remembered prices and real ones is exactly where shrinkflation and quiet repricing live.",
        ],
      },
      {
        kind: "cta",
        heading: "Calibrate the one index nobody publishes",
        paragraphs: [
          "Pricele gives you one real item a day and scores how close your guess lands. It takes a minute, and being wrong is the most useful part.",
          "The official numbers will keep saying what they say. Your job is to make sure your own numbers are sharper.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      S.aol1997,
      S.yahoo1997,
      S.moneyProgression,
      {
        label: "Sadiq: Personal inflation rate vs headline CPI",
        url: "https://sadiqbd.com/blog/calculators/inflation/personal-inflation-rate-vs-headline-cpi",
      },
      S.nnng,
      {
        label: "Citrine Capital Advisors: Personal inflation vs CPI",
        url: "https://citrinecapitaladvisors.com/blog/personal-inflation-vs-cpi",
      },
      {
        label: "Fox Business: A tale of two economies",
        url: "https://www.foxbusiness.com/economy/square-circle-biden-tale-two-economies",
      },
      {
        label:
          "BLS Monthly Labor Review: A price index that matches perceptions of inflation",
        url: "https://www.bls.gov/opub/mlr/2016/beyond-bls/a-price-index-that-matches-perceptions-of-inflation.htm",
      },
      S.statcan,
      S.europarl,
      {
        label: "CEPR VoxEU: The perceived inflation wedge",
        url: "https://cepr.org/voxeu/columns/perceived-inflation-wedge-why-households-experience-inflation-differently-official",
      },
      {
        label: "MultiCalculators: How CPI is calculated",
        url: "https://multicalculators.com/how-cpi-is-calculated/",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "time-prices-work-hours-not-dollars",
    title: "Stop asking what things cost. Ask how long you work for them.",
    description:
      "In 1919 an egg cost 12 minutes of work. Today it costs 2.4 minutes, even at panic prices. Time prices are the true price of everything, and they cut both ways.",
    date: "2026-06-28",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Bar-trivia question, and it will rewire how you think about every price you see for the rest of your life.",
          "In 1919, a dozen eggs cost 61 cents. Today they can hit $8 and beyond. So: **when were eggs more expensive?**",
          "If you answered “today,” congratulations, you've fallen for the oldest illusion in economics, the same one your grandfather falls for when he tells you a Coke used to cost a nickel. In 1919 an unskilled worker earned about 25 cents an hour, which means one egg cost roughly **12 minutes of work**. Today, at around $17 an hour, that same egg costs about **2.4 minutes**. Measured in the only currency you can never print more of, eggs are **80 percent cheaper** than in 1919, even at panic-headline prices.",
          "The nickel Coke is an even better trick. In 1900, a dime bought you a Hershey bar and a bottle of Coca-Cola, and it sounds like paradise until you learn wages were about 14 cents an hour. An ounce of chocolate cost over 21 minutes of work; today it costs about 1.25 minutes. An ounce of Coke went from 3.3 minutes to about 3.6 seconds.",
        ],
      },
      {
        kind: "callout",
        heading: "The one formula in this article",
        paragraphs: [
          "We buy things with money, but we pay for them with time. A **time price** is just the money price divided by your hourly earnings: hours and minutes of your life instead of dollars and cents.",
          "It is the true price of everything, and once you see it, you can't unsee it.",
        ],
      },
      {
        kind: "prose",
        heading: "The burger that measures the world",
        paragraphs: [
          "The best tool ever invented for this is, absurdly, a hamburger. The Economist has published the Big Mac Index since 1986 because the sandwich is nearly identical in over 100 countries, which makes it a perfect universal yardstick. But the dollar comparison is the boring half. A Big Mac costs $2.38 in Taiwan and $7.99 in Switzerland, and that tells you almost nothing about who can actually afford lunch.",
          "Now convert to time, and the world snaps into focus.",
          "In Denmark, where hourly earnings average around $57.60, a $5.49 Big Mac costs **under six minutes** of work. In Pakistan, the burger is nominally cheaper at $3.77, but with earnings around 86 cents an hour, it costs **4.4 hours**. For the time a worker in Pakistan spends earning one Big Mac, a Danish worker earns **46 of them**.",
          "Read that sentence again. Same burger. Same bun, same two patties, same special sauce. One of them costs six minutes of a human life and the other costs half a working day.",
          "UBS has tracked this for decades across dozens of cities: the global average has hovered around **35 to 37 minutes** of work per Big Mac, with Tokyo and big US cities down around 10 to 13 minutes while workers in Nairobi have needed anywhere from 90 minutes to nearly three hours.",
          "A Big Mac can be more expensive in money and cheaper in time, depending entirely on where you stand. Which means every “cheap country” listicle you've ever read was measuring the wrong thing. Cheap for whom? For you, the visitor with the foreign salary. For the person making your burger, that cheap meal might be the most expensive lunch on Earth.",
        ],
      },
      {
        kind: "prose",
        heading: "Your great-grandmother's grocery bill would horrify you",
        paragraphs: [
          "Run the time-price lens backwards and the past stops being the affordable golden age everyone's nostalgia insists on. Researchers priced a basket of 42 everyday food items (sirloin, eggs, oranges, bread) in 1919 and again in 2019, in hours of work.",
        ],
      },
      {
        kind: "table",
        columns: ["Worker", "1919", "2019"],
        rows: [
          ["Unskilled", "47 hours", "10 hours"],
          ["Blue-collar", "27 hours", "under 4 hours"],
        ],
        caption:
          "Hours of work needed to buy the same 42-item food basket. Same food, same country, a century apart.",
      },
      {
        kind: "prose",
        paragraphs: [
          "Your great-grandmother worked more than a full week to put on the table what costs you a Friday morning. “The good old days” were, for the ordinary person feeding a family, brutally expensive. We forget this because the receipts from 1919 look adorable, and because nobody's grandmother ever said “a dollar an hour” in the same breath as “bread was a nickel.”",
        ],
      },
      {
        kind: "prose",
        heading: "So why don't you feel rich? (This is where I annoy everyone)",
        paragraphs: [
          "If you've read this far you may be getting irritated, because this cheerful arithmetic seems to collide head-on with your bank account, and with those viral receipts showing groceries needing 79 percent more work-time than in 1997. Both things are true, and anyone who tells you only one of them is selling something.",
          "The honest picture goes like this. Even over the recent, painful stretch from 2000 to 2024, US wages rose **123 percent** against an **87 percent** rise in overall prices, so the average consumption basket got about **19 percent cheaper in time**. Food, cars, clothing, furnishings: all up in dollars, all down in hours. The optimists are right about the burger, the eggs, and the TV.",
          "But the same analysis shows a handful of categories where the time price rose even after that 123 percent wage growth, and they happen to be the ones you cannot skip and cannot substitute: **the roof, the hospital, the childcare, the degree**. Housing, healthcare and childcare have consistently run far above headline inflation.",
          "So the modern deal is genuinely weird: the stuff of life has never cost less of your time, while the foundations of life have rarely cost more. You can furnish an apartment for a day's wages and spend half your income on the right to put the furniture somewhere.",
          "That's the fight worth having, and the time-price lens is what lets you have it honestly. The doomer who says everything is unaffordable is wrong about the eggs. The optimist who says you've never had it better is wrong about the rent. Precision beats vibes, and precision is measured in minutes of your life.",
        ],
      },
      {
        kind: "prose",
        heading: "The lens is free. Use it.",
        paragraphs: [
          "What changes once you adopt it is this. Every price becomes a question with a real answer: **how many minutes of me is this?** A $6 latte at $30 an hour is 12 minutes. Fine, that's a fair trade for joy. A $1,099 phone at the median Swiss wage is about two days of work; the same phone at the median Indian wage is closer to six months. Same object, wildly different bite out of a life. You'll never look at a “global” price tag the same way.",
          "And you'll start noticing how badly calibrated your own price instincts are, how much your brain still runs on the prices of whatever decade you first paid rent in. Mine certainly did.",
        ],
      },
      {
        kind: "cta",
        heading: "Then try the advanced version in your head",
        paragraphs: [
          "Pricele is a one-minute daily game where you guess what real things actually cost right now and find out how far off you are. Play it for a week and you'll feel the recalibration happen.",
          "Then go one step further: don't just guess the price, divide it by your wage. That number, the minutes, is what you're really paying.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      S.humanProgressEgg,
      {
        label: "HumanProgress: The good old days were really expensive",
        url: "https://humanprogress.org/the-good-old-days-were-really-expensive/",
      },
      {
        label: "Cato Institute: Time inequality is the world's real problem",
        url: "https://www.cato.org/commentary/time-inequality-worlds-real-problem-not-income-inequality",
      },
      {
        label: "Gale Pooley: Time pricing Big Macs around the world",
        url: "https://galepooley.substack.com/p/time-pricing-big-macs-around-the",
      },
      S.bigMac2026,
      {
        label: "UBS: Prices and Earnings report",
        url: "https://londonkoreanlinks.net/wp-content/uploads/2006/08/ubs-report-eng.pdf",
      },
      {
        label: "The Spokesman-Review: Tokyo tops Big Mac survey",
        url: "https://www.spokesman.com/stories/2006/aug/10/tokyo-tops-big-mac-survey/",
      },
      {
        label: "City-Cost: The cost of money in Tokyo",
        url: "https://www.city-cost.com/blogs/City-Cost/z4mLG-money_tokyo",
      },
      {
        label:
          "HumanProgress: Falling food prices for unskilled workers, 1919-2019",
        url: "https://humanprogress.org/falling-food-prices-for-unskilled-workers-in-the-united-states-1919-2019/",
      },
      S.humanProgressBlueCollar,
      S.pooleyPerry,
      S.marysue1997,
      S.nnng,
      {
        label: "AllTools: Personal inflation calculator",
        url: "https://alltools.dev/tools/finance/personal-inflation-calculator/",
      },
      S.jemlit,
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "iphone-cost-in-days-of-work-by-country",
    title:
      "The iPhone costs 2 days of work in Switzerland and 6 months in India",
    description:
      "Same phone, same factories, same keynote. Ranked by days of work rather than dollars, the iPhone becomes an X-ray of the global wage ladder.",
    date: "2026-07-05",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "There is exactly one product on Earth that works as a global unit of measurement. Not gold, not oil, not the dollar. It's the iPhone.",
          "Think about why. It's the identical object everywhere: same chip, same camera, same glass slab, assembled in the same factories, sold with the same keynote. Apple even publishes the price in every country, in public, on its own website. Which means the iPhone accidentally does something no economist ever managed: it measures, with brutal precision, what an hour of human work is worth in every country on the planet.",
          "And the answer is ugly.",
          "A Swiss worker earns a base iPhone 17 in about **17 hours**, roughly two working days. An American needs around **21 hours**. An Indian worker on the average wage needs somewhere between **600 and 970 hours** depending on the study and the model, which is four to six months of full-time work. For the Pro Max, an average Egyptian worker needs roughly **266 working days**, most of a year.",
          "Same phone. Same Tim Cook. Somewhere between two days and one year of a human life.",
        ],
      },
      {
        kind: "prose",
        heading: "The rankings (find your country, feel your feelings)",
        paragraphs: [
          "Before you look: guess where your country lands. Not the price, the days of work for an average earner. Hold that number.",
        ],
      },
      {
        kind: "table",
        intro:
          "Estimated working days needed for an iPhone 17 Pro-class device, based on average net monthly wages:",
        columns: ["Country", "Working days"],
        rows: [
          ["Switzerland", "~3"],
          ["Luxembourg", "~4"],
          ["Singapore", "~4"],
          ["United States", "~4-5"],
          ["Norway, Denmark, Netherlands", "~5"],
          ["Germany, Canada", "~5-6.5"],
          ["United Kingdom", "~6.6"],
          ["Japan", "~5-8"],
          ["France", "~7.6"],
          ["South Korea", "~8.5"],
          ["Spain", "~10.6"],
          ["Czech Republic", "~12"],
          ["Italy", "~12"],
          ["Poland", "~17"],
          ["China", "~22"],
          ["Portugal", "~24"],
          ["Hungary", "~27"],
          ["Brazil", "~33"],
          ["Russia", "~35"],
          ["Mexico", "~44"],
          ["Türkiye", "~84"],
          ["Vietnam", "~120+"],
          ["India", "~160"],
          ["Nigeria", "~177"],
          ["Egypt", "~266"],
        ],
        caption:
          "A worker in Lisbon needs roughly six times as long as one in Zurich. Same continent, and for much of it the same currency.",
      },
      {
        kind: "prose",
        paragraphs: [
          "Cross into Türkiye and the phone costs four months of average wages. Forget gadget affordability: this is an X-ray of the global wage ladder, and most of us have never seen our own rung this clearly.",
        ],
      },
      {
        kind: "prose",
        heading: "Now the part that should actually make you angry",
        paragraphs: [
          "You'd assume, charitably, that Apple prices the phone lower where people earn less. Airlines do versions of this. Netflix does it. Spotify charges a dollar a month in some markets.",
          "**Apple does the opposite.**",
          "The US pays the benchmark price. Europe pays roughly 18 to 30 percent more. And India, where the median formal-sector worker takes home about $385 a month, pays a **38 percent premium** over the US list price: ₹125,900 for a 256GB Pro, about $1,517 at the exchange rate, versus $1,099 in America. Türkiye is worse: import duties and luxury taxes push the iPhone 17's starting price to around $1,885, some **120 percent** above the US.",
          "Stack the two effects. India's price is 38 percent higher, its median wage roughly 12 times lower, and the multiplication is merciless: **sixteen times more hours of work** for the identical object.",
          "Part of this is genuinely not Apple: import duties, VAT, currency hedging, distribution costs. Governments in Ankara and New Delhi are co-authors of those price tags. But one analysis makes the uncomfortable observation that Apple's pricing is more dispersed than its competitors', and that the dispersion runs inversely with median wages. Premium pricing aimed at poor countries is the opposite of what cost-plus pricing would predict, and it tells you something about market power. When a product becomes a status symbol, the seller can charge the most exactly where it hurts the most. And does.",
        ],
      },
      {
        kind: "list",
        heading: "Three footnotes that make the story more interesting, not less",
        items: [
          "**America isn't actually first**, and Americans should sit with that. US discourse assumes the US tops every consumer-affordability chart. On hours-of-work-per-iPhone for the median worker, it sits below Switzerland and roughly alongside the Nordics, because while American wages are high, American inequality is higher: the top decile earns about 7 times the median versus 3 to 4 times in Europe, which drags the median down. The average American is richer than the average European. The median American is less ahead than advertised.",
          "**National averages hide entire worlds.** India's 682-hour headline figure is real, and also misleading: for a Bangalore software engineer the phone costs about 85 hours, UK territory; for a Mumbai investment banker, about 32 hours, Swiss territory. The gap between an Indian engineer and an Indian farm labourer is wider than the gap between India and Switzerland. Whenever you see a country ranking, remember the ladder exists inside each country too.",
          "**The tax wedge cuts both ways.** A Dubai worker keeps every dirham of gross pay; an American on $4,583 a month keeps roughly $3,800 after federal, state and payroll taxes. Gross-wage rankings quietly flatter high-tax countries.",
        ],
      },
      {
        kind: "prose",
        heading: "Why this one stat travels further than any GDP table",
        paragraphs: [
          "My actual thesis, and the reason this article exists: nobody feels a Gini coefficient. Nobody has ever gasped at purchasing-power-parity-adjusted GDP per capita. But “you work two days for it, he works six months for it, and it's the same phone” lands in the chest rather than the spreadsheet.",
          "The iPhone works as a measuring stick precisely because you know it. You've held one. You can feel what six months of commutes, alarms and shifts means, in a way you cannot feel a decimal point of GDP.",
          "That's also the humbling part. Because if you're reading this in a rich country, the iPhone index is a mirror with a caption: the thing you upgrade out of boredom is, for most working humans alive, a major capital purchase requiring months of saving. Not because they work less hard. Because of where the ladder happened to put them.",
        ],
      },
      {
        kind: "prose",
        heading: "One last question before you go",
        paragraphs: [
          "You just spent five minutes reading about what an iPhone costs in 25 countries. Quick test: what does a litre of milk cost in your supermarket, right now, this week? A dozen eggs? The exact phone in your pocket, today, rather than when you bought it?",
          "If you hesitated, you're normal. We're all walking around with price lists in our heads that are years stale, and we mostly find out when the checkout total ambushes us.",
        ],
      },
      {
        kind: "cta",
        heading:
          "The iPhone measures the world's wages. Pricele measures your own head.",
        paragraphs: [
          "One minute a day: guess the real price of a real item and get scored on how close you land. Some days it's a grocery item, some days it's the kind of thing this article is about.",
          "Either way, you learn exactly where your instincts have drifted. Both readings are worth having.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      S.jemlit,
      S.iphone3tej,
      {
        label:
          "ShiftDelete: How many days you need to work to buy an iPhone 17 Pro Max",
        url: "https://en.shiftdelete.net/how-many-days-you-need-to-work-to-buy-iphone-17-pro-max/",
      },
      {
        label:
          "Letem Světem Applem: iPhone 17 Pro: three days of work somewhere, 160 elsewhere",
        url: "https://www.letemsvetemapplem.eu/en/2026/03/05/na-iphone-17-pro-staci-nekde-3-dny-prace-jinde-160-tohle-je-realita-dnesniho-sveta/",
      },
      {
        label:
          "Digital Information World: For millions, the iPhone 17 costs months of work",
        url: "https://www.digitalinformationworld.com/2025/09/for-millions-apples-iphone-17-costs-not-just-money-but-months-of-work.html",
      },
      {
        label:
          "The Mors: How long you work in different countries to buy an iPhone 17",
        url: "https://themors.com/how-long-to-work-in-different-countries-to-buy-an-iphone-17/",
      },
      S.bigMacIndex,
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "one-salary-used-to-buy-a-whole-life",
    title: "Your dad's salary bought a house, a car and a stay-at-home spouse",
    description:
      "Yours buys rent. Same salary, one generation apart, wildly different lives. Here's the line-by-line forensics of where the money actually went.",
    date: "2026-07-12",
    status: "published",
    readingMinutes: 9,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "There's a comment that has been circling the internet for a year now, ever since a 1997 grocery receipt went viral and cracked something open. A woman wrote that her father earned the same salary she earns today. On it, he supported a family of five, with a stay-at-home wife. Today she and her husband both work, they have two kids, and they barely clear each month.",
          "Her question was five words long: **“How does that make sense?”**",
          "It's the right question, and it deserves a real answer, not “stop buying coffee.” So let's do the forensics. Same salary, one generation apart, wildly different lives. Where did the money go?",
        ],
      },
      {
        kind: "prose",
        heading: "Exhibit A: the house ate your raise",
        paragraphs: [
          "Start with the biggest line item on any family's ledger. In 1970, the median American home cost $24,000 against a median income of $9,870: a ratio of **2.4 years** of income. By 1990 it was 2.6. Today it's roughly **5.6**, a $420,000 home against $75,000. In many major markets the mortgage-to-income ratio has gone from three-to-four times income fifty years ago to **eight-to-ten times** today.",
          "Since 2000 alone, median home prices have outpaced median household income growth nearly two to one: **177 percent** against **92**.",
          "The detail that should end the “your generation just wants luxury” argument forever is that the houses barely changed. The median owner-occupied home grew from 5.7 rooms in 1975 to 6.1 by the late 1990s, less than half a room, probably a second bathroom. Your parents' generation isn't living in smaller houses than you aspire to. They're living in the same houses. **The house didn't get better. It got repriced.**",
        ],
      },
      {
        kind: "prose",
        heading: "Exhibit B: the bills that didn't exist",
        paragraphs: [
          "Your father's budget was missing entire categories that dominate yours.",
          "**Childcare**, for one. In the single-earner 1970s household, childcare cost approximately zero, because the childcare was a person, at home, already accounted for. Today, centre-based infant care averages around **$19,000 a year**, and $1,200 to $2,500 a month is unremarkable. For a family with two little kids, childcare can exceed the mortgage.",
          "**Education**, for another. Four years of public university ran about $2,000 in 1975; it's $28,000 and up now, before room and board adds $15,000 to $20,000 a year. Adjusted for inflation, tuition is up **197 percent** since 1963. Your dad's degree, if he needed one at all, was a rounding error. Yours was a mortgage down payment you spent before you could save it.",
          "**Healthcare**: per-capita costs up **322 percent** in real terms since 1980, against real wage growth of about **9 percent** over the same stretch.",
        ],
      },
      {
        kind: "table",
        intro: "Notice the pattern in real terms:",
        columns: ["Category", "Real change"],
        rows: [
          ["Groceries", "+16%"],
          ["Gas", "+6%"],
          ["Healthcare per capita, since 1980", "+322%"],
          ["University tuition, since 1963", "+197%"],
          ["Real wages, since 1980", "+9%"],
        ],
        caption:
          "The stuff stayed roughly flat. The entry tickets to a middle-class life went vertical.",
      },
      {
        kind: "prose",
        heading: "Exhibit C: the two-income trap snapped shut",
        paragraphs: [
          "The cruellest mechanism was documented by Elizabeth Warren and Amelia Warren Tyagi, before Warren was a senator. When the second earner became normal, the market simply repriced everything around two paychecks. Housing absorbed the second income: mortgages and rents rose to what two salaries could bid, especially in the school-district bidding wars.",
          "Their data comparison is the single most damning table in modern economics. The one-earner family of the early 1970s kept **46 percent** of its income as discretionary money after fixed costs. The two-earner family of the 2000s, with nearly double the income, kept **25 percent**. By 2023, the average dual-income household was spending roughly **75 percent** of combined income on housing, transportation, childcare and healthcare, versus about **50 percent** for a 1970s single-income household.",
          "The second income didn't buy a better life. It bought the same life, at the new price, with double the labour and double the risk: lose one of two jobs and the math collapses instantly, because the mortgage was calibrated to both. As one analysis put it, the second income “just raised the minimum needed to participate in the economy.”",
          "Today, only about **4 in 10** married families with young children get by on one income or one-and-a-part, a near-record low. Six-figure earners describe single-income life as nearly impossible.",
          "So when your parents say “we made it work on one salary,” believe them. And then show them the ratios, because the game they won is not the game you're playing.",
        ],
      },
      {
        kind: "prose",
        heading: "The twist nobody on either side wants to hear",
        paragraphs: [
          "Now the part that will annoy the doomers, because honesty requires it.",
          "Measured by median net worth at the same age, adjusted for inflation, millennials are actually **ahead**: $84,941 at ages 26-41 in 2022, versus $78,333 for Gen X at the same point and $58,101 for boomers.",
          "And University of Chicago research found the real story runs within generations rather than between them: the average millennial has 30 percent less wealth at 35 than boomers did, yet the richest tenth of millennials has 20 percent more than the richest boomers did, while millennials on typical working-class trajectories did no better, and sometimes worse, than their parents' equivalents.",
        ],
      },
      {
        kind: "callout",
        heading: "The honest verdict",
        paragraphs: [
          "It's not “everything got worse.” It's sharper and, I'd argue, angrier: the floor of a normal life got repriced beyond one ordinary wage, and the escalator that used to carry an ordinary high-school-educated worker into the middle class was dismantled.",
          "Real median hourly wages for workers without a degree are lower than in 1979; for graduate degree holders they're up 34 percent. Your outcome now depends brutally on which side of that line you landed on, and on whether your parents could stake you a down payment.",
          "The one-earner idyll of the 1950s to 1970s was itself a strange historical window, built on a post-war manufacturing monopoly, 30 percent unionisation and G.I. Bill subsidies. It wasn't the natural order. But we dismantled it without replacing the ladder.",
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "That's why “just work harder” lands like an insult. They worked hard. You work hard. The difference was never effort. **It was the price of entry.**",
        ],
      },
      {
        kind: "prose",
        heading: "Have the conversation, but bring the numbers",
        paragraphs: [
          "My actual advice isn't financial. Show this to your parents, as a translation rather than an accusation, because most of the generational sniping (the avocado toast, the lazy kids, the boomers had it easy) comes from two groups of people arguing from price lists decades apart.",
          "Your dad's brain still runs 1985 prices the way yours will someday run 2015 prices. A woman on Reddit spending $350 a month on basic groceries got lectured by parents who genuinely believed milk still cost $2. Nobody in that argument was lying. They were living in different price universes.",
          "The fix is calibration, in both directions. Sit your parents down and make them guess what things cost now: a semester of college, a month of infant care, the rent on your apartment. Then let them watch you guess what things cost in 1975, because you'll be wrong too, in the other direction.",
        ],
      },
      {
        kind: "cta",
        heading: "Play it against your parents",
        paragraphs: [
          "Pricele is the one-minute version of that exercise: guess real prices of real things, find out exactly how far your mental price list has drifted.",
          "Loser does the dishes. The winner is whoever ends up understanding the other side's universe a little better.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      S.today1997,
      S.wealthvieuTwoIncomes,
      {
        label: "Yahoo Finance: Why two-income families still struggle",
        url: "https://finance.yahoo.com/economy/articles/why-two-income-families-still-150031632.html",
      },
      {
        label:
          "Institute for Family Studies: Can your family survive on one income?",
        url: "https://ifstudies.org/blog/can-your-family-survive-on-one-income-public-policy-should-do-more-to-help-",
      },
      S.scottBurns,
      S.longitude,
      {
        label: "WealthVieu: Real wage growth by category",
        url: "https://wealthvieu.com/personal-finance/income/real-wage-growth/",
      },
      S.modernMoneyLife,
      {
        label: "PNW Independent: The nostalgia trap",
        url: "https://pnwindependent.com/the-nostalgia-trap-why-the-single-income-era-was-a-historical-fluke-and-why-youre-lucky-to-live-now/",
      },
      S.cnbcSingleIncome,
      {
        label: "LendingTree: Millennials' financial condition study",
        url: "https://www.lendingtree.com/debt-consolidation/millennials-financial-condition-study/",
      },
      {
        label: "Fortune: High-status millennials versus boomers on wealth",
        url: "https://fortune.com/2024/04/30/high-status-millennials-boomers-wealth-retirement-inflation/",
      },
      S.aolMilk,
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "your-mental-price-list-is-broken",
    title: "“Milk isn't $2 anymore”: everyone's mental price list is broken",
    description:
      "Including yours. How your brain writes prices in permanent marker, why the update never installs, and the dinner-table quiz that settles the argument.",
    date: "2026-07-19",
    status: "published",
    readingMinutes: 7,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "A 23-year-old walks out of a big-box store having spent $350 on a month of groceries. Eggs, bread, store brands, nothing exotic. Their opening line online: “I'm not Jeff Bezos, I am literally just trying to survive.”",
          "Their parents' diagnosis? Must be the lattes. The takeout. Something. Because in the parents' heads, **milk is $2**, and $350 for basics simply does not compute.",
          "What makes this story interesting rather than just another generational spat: the parents aren't lying, and they aren't stupid. They're running outdated software. And before you feel smug about it, so are you. So am I.",
          "Every single one of us is walking around with a mental price list that stopped updating years ago. Today I want to show you exactly how that list gets written, why it freezes, and how to tell whose is more wrong at your next family dinner.",
        ],
      },
      {
        kind: "prose",
        heading: "Your brain writes prices in permanent marker",
        paragraphs: [
          "Psychologists have a name for the price you carry in your head: the **internal reference price**, the number you drag out of memory to judge whether today's shelf price is fair or an outrage. Every time you see $4.89 on the milk, your brain isn't evaluating $4.89. It's comparing it against a ghost, some half-remembered milk price from the era when you first started paying attention.",
          "And that ghost is stubborn. The anchoring effect, first documented by Tversky and Kahneman, is one of the most robust biases in all of human decision-making: the first number you absorb acts, in the researchers' words, like an anchor dropped into the deep sea, fixing your mind and dragging every later judgment toward it.",
          "It works even when the anchor is meaningless. In famous experiments, people's willingness to pay for products was swayed by the last digits of their own social security number. And it doesn't wash out: studies tracking people over time found that a single arbitrary anchor still bent their valuations **eight weeks later**, as if the number had been imprinted.",
          "Now consider what that means for prices you encountered not eight weeks ago but eight thousand times, at an impressionable age, when money was new and every purchase stung. The prices of your first independent years, the first rent, the first tank of gas, the first solo grocery run, aren't memories. They're the factory settings.",
          "Your parents' factory settings were installed in 1985. Yours, maybe 2010. **Neither of you ever ran the update.**",
        ],
      },
      {
        kind: "list",
        heading: "Why the update never installs",
        intro:
          "Three reasons the list stays frozen, and they're all a bit humiliating.",
        items: [
          "**You don't actually read prices most of the time.** For routine purchases, price memory is implicit: your brain retrieves it lazily, outside of awareness, using shortcuts rather than the actual number on the tag. You grab the milk. You do not study the milk.",
          "**The update is asymmetric.** Consumers weight price increases far more heavily than decreases when forming their sense of inflation; when researchers built an index excluding the price drops people mentally ignore, the gap between perceived and actual inflation nearly disappeared. So the list doesn't merely lag, it lags angrily, cataloguing every insult and forgetting every discount.",
          "**The lag gets worse with age.** Research prepared for the European Parliament found that in high-inflation periods, people over 65 show a larger inflation-perception bias than younger groups, partly because updating your beliefs takes active information-gathering that gets harder to sustain, and partly because a lifetime of past price regimes is a lot of old anchors to fight.",
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "Frequency matters too: people who shop often over-weight the stuff they buy weekly, which is exactly how a retiree who buys groceries daily and a young professional who buys them monthly end up living in different price universes.",
          "Retailers, by the way, know all of this and farm it. Every “was $89.99, now $49.99” tag is an externally supplied anchor designed to overwrite your internal one, and it works: reference-price framing measurably shifts what people judge to be fair. Your mental price list isn't just outdated. **It's been actively vandalised.**",
        ],
      },
      {
        kind: "prose",
        heading: "The dinner-table diagnostic",
        paragraphs: [
          "So back to the $350 grocery run and the latte lecture. What's actually happening in that argument is two internally consistent price lists colliding: the parents comparing today's receipt to their 1985 factory settings and concluding reckless child; the kid comparing it to 2026 shelf reality and concluding out-of-touch parents.",
          "Official data sides with the kid on this one: a few hundred dollars a month for a nutritious home-cooked diet is baseline USDA math now, not extravagance. The twist worth being honest about, though, is that on other items the kid's list is broken too. Young people who've never bought diapers, or a water heater, or car insurance in their own name routinely lowball those by half.",
          "Which suggests a better format for the family argument. Make it a quiz. Everyone guesses, then someone looks up the real number.",
        ],
      },
      {
        kind: "list",
        heading: "Try these tonight",
        ordered: false,
        items: [
          "A gallon of milk, or a litre, depending where you live",
          "A dozen eggs",
          "A month of full-time infant daycare",
          "A basic new washing machine",
          "One night in a mid-range hotel in your own city",
          "A movie ticket",
          "A year of public university tuition",
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "I'll make a prediction, and the psychology above backs it: the older generation will lowball the daycare and tuition by a factor that produces audible gasps, and the younger generation will be shockingly wrong about at least two things they've simply never had to buy.",
          "Everyone loses. Which is the point. The argument was never actually about avocado toast; it was about **two obsolete databases, each convinced it was the live feed**.",
        ],
      },
      {
        kind: "prose",
        heading: "Calibration is a skill, and it's weirdly fun to train",
        paragraphs: [
          "Now the optimistic ending. Unlike most cognitive biases, this one has a straightforward fix: **feedback**. Guess a price, see the real one, feel the gap, repeat. Your internal reference prices are learned from exposure, so deliberate exposure retrains them. The gasp when you're wrong is the update installing.",
        ],
      },
      {
        kind: "cta",
        heading:
          "Turn the world's most repetitive family argument into a scoreboard",
        paragraphs: [
          "Pricele is a one-minute daily game where you guess what a real item costs right now and get scored on how close you land. Play it solo to fix your own list, or, and I genuinely recommend this, play it against your parents.",
          "The loser buys the coffee. At whatever it costs these days. Neither of you knows. That's the bit.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      S.aolMilk,
      S.referencePrice,
      S.anchoringPmc,
      S.coherentArbitrariness,
      S.anchorsPersist,
      S.implicitPrice,
      S.statcan,
      S.europarl,
      S.scienceDirectFraming,
      S.frontiers,
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "where-your-money-is-secretly-rich",
    title: "Where your money is secretly rich",
    description:
      "The countries where $2,000 buys a $6,000 life, plus the two traps the geoarbitrage videos never mention, including the one where you become the price rise.",
    date: "2026-07-26",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Your money has a passport, and it's worth different amounts depending on where it lands. Not slightly different. Absurdly different.",
          "The cleanest way to see it is the burger. The same $10 buys nearly **five Big Macs** in South Africa and **fewer than two** in Switzerland. Six of the ten cheapest Big Macs on Earth are in Asia; Switzerland's is 38 percent dearer than America's, the highest premium among 54 countries tracked.",
          "Economists have a duller name for this, purchasing power parity, and a sharper metric buried inside World Bank data: the **price level ratio**, which tells you what a dollar actually buys on the ground. Vietnam's sits around **0.30** against the United States, meaning the same basket of goods and services costs roughly 30 cents on the dollar.",
          "Read that as a plain sentence: there are functioning, beautiful, fast-wifi countries where existence is 70 percent off.",
        ],
      },
      {
        kind: "prose",
        heading: "The arithmetic that makes people quit their leases",
        paragraphs: [
          "This is why geoarbitrage went from finance-blog jargon to a life strategy. Earn in a strong-currency job, spend in a low-price-level country, and the gap becomes your savings rate.",
          "The numbers are genuinely startling. A remote worker keeping a US salary while living in Chiang Mai on about $1,300 a month can hit an **84 percent savings rate**; the extra $32,400 a year, compounding at 7 percent, grows to over **$450,000 in a decade**. A software engineer clearing $78,000 after tax saves maybe $33,000 a year in New York and **$66,000 in Thailand**. Double, for the same job.",
        ],
      },
      {
        kind: "table",
        intro:
          "Realistic comfortable monthly budgets for one person, from 2026 cost surveys:",
        columns: ["City", "Monthly budget", "US-equivalent lifestyle"],
        rows: [
          ["Da Nang, Vietnam", "$900-1,350", "$4,000-6,000"],
          ["Chiang Mai, Thailand", "$1,000-2,000", "$4,000-6,000"],
          ["Medellín, Colombia", "$1,000-1,500", "$4,000-5,500"],
          ["Mérida / Oaxaca, Mexico", "$1,000-1,200", "$4,500-6,000"],
          ["Kuala Lumpur, Malaysia", "$1,000-2,000", "$4,500-6,500"],
          ["Mexico City", "$1,400-1,800", "$4,500-6,500"],
          ["Lisbon, Portugal", "$1,800-3,000", "$5,500-8,000"],
          ["Austin, Texas (reference)", "$3,500", "itself"],
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "In Da Nang, a modern one-bedroom near the beach runs $400-550 and a street-food lunch $1.50; private hospital visits cost $20-40. In the Philippines, $1,500 a month buys what a mid-tier US city charges $4,500 for. A dental cleaning in Thailand: **$25**.",
          "For retirees the math is even more pointed: the average US Social Security check, about $2,000 a month, barely covers rent in many American cities but funds a comfortable couple's life, rent included, in Ecuador, Colombia, Vietnam or Cambodia.",
          "If your reaction is “that can't be real,” good. Hold that feeling, because the next two sections are about the ways it's real and the ways it isn't.",
        ],
      },
      {
        kind: "prose",
        heading: "Trap 1: you probably won't get local prices",
        paragraphs: [
          "The YouTube thumbnails leave something out. The advertised paradise budget assumes **local** prices, and short-term visitors mostly don't get them. One Canadian writer who tried trading Toronto rent for São Paulo ended up on Airbnb paying more than double the neighbourhood's average rent, “not far off from the typical cost of a Toronto apartment.” The markup is systematic: in Mexico City, the median one-bedroom Airbnb runs about **66 percent above** average local rent.",
          "The $500-a-month luxury life you've seen advertised is usually describing the rent line of someone with a year-long local lease, a local SIM and local shopping habits. Real comfortable budgets start around **$1,000** in even the cheapest hubs, before you add flights home, visa runs ($480-720 a year in Vietnam, which still has no nomad visa), international health insurance at $200-400 a month, and the productivity tax of moving constantly.",
          "The arbitrage is real. The influencer version of it is a rent line cosplaying as a budget.",
        ],
      },
      {
        kind: "prose",
        heading: "Trap 2: your cheap paradise is someone's unaffordable hometown",
        paragraphs: [
          "Now the part this genre of article always skips, and shouldn't.",
          "That “bargain” €1,500 Lisbon apartment is roughly **two months of the Portuguese minimum wage**, which stood near €760 while average rents hit €1,500. A landlord choosing between €600 a month from a local family and €2,000-3,000 from Airbnb makes the obvious economic choice, with devastating social cost. Parts of central Lisbon are now estimated at over **68 percent short-term rentals**. The €0.60 bica became a €2.50 “authentic Portuguese espresso experience” because the market repriced to American budgets, not Portuguese salaries.",
          "Mexico City ran the same script: average rent for a three-bedroom near triple the average local monthly wage of about $450, a third of residents forced to move during the pandemic, evictions up 27 percent in a year. Local activists, notably, mostly don't blame individual nomads; they blame absent tenant protections and a market that privileges whoever shows up with the strongest currency.",
          "Both things are true: the individual remote worker isn't a villain, and the aggregate effect is exactly the affordability crisis they left home to escape, exported.",
        ],
      },
      {
        kind: "callout",
        heading: "The bitter symmetry",
        paragraphs: [
          "Viral grocery receipts, the two-income trap, the “how does that make sense” comments: that's what it feels like when prices decouple from local wages. Geoarbitrage is you being on the winning side of that same decoupling.",
          "None of which means don't go. It means go like a guest: long leases over Airbnb, local businesses over expat bubbles, secondary cities over the three neighbourhoods every YouTuber colonises, and learn the language of the place subsidising your savings rate. Rural Thailand at $800-1,000 a month for a couple is both cheaper and lighter-footprint than fighting locals for central Bangkok.",
        ],
      },
      {
        kind: "prose",
        heading: "The skill underneath all of this is price literacy",
        paragraphs: [
          "Strip away the palm trees and this whole subject is one skill: **knowing what things should cost, everywhere**. The person who gets fleeced abroad and the person who thrives abroad have the same salary. What differs is calibration: one of them knows the taxi is 4x the local rate, that the expat price for that apartment has a Portuguese price hiding under it, that $2.47 is a normal Big Mac in Indonesia and $6.12 is not.",
          "Most people's price instincts fail within their own zip code, let alone across a border. Test yourself honestly: what does a one-bedroom rent for in Hanoi? A doctor's visit in Bangkok? A coffee in Lisbon, 2015 versus now? If you winced, that's the gap.",
        ],
      },
      {
        kind: "cta",
        heading: "Closing that gap is literally a game now",
        paragraphs: [
          "Pricele gives you one real item a day, you guess the price, and you find out how calibrated your instincts actually are. One minute, and it trains the exact muscle that decides whether the world's price differences work for you or on you.",
          "Your money already has a passport. The question is whether the person carrying it knows what anything costs.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      S.bigMacIndex,
      S.bigMac2026,
      {
        label: "BrightCurios: Vietnam's price level ratio",
        url: "https://brightcurios.com/vietnam-usd-cheat-code-price-level-ratio/",
      },
      {
        label: "GetWhereNext: Geo-arbitrage and early retirement abroad",
        url: "https://getwherenext.com/blog/geo-arbitrage-retire-early-abroad",
      },
      {
        label: "EarnifyHub: Geographic arbitrage and remote work, 2026",
        url: "https://earnifyhub.com/blog/remote-work/geographic-arbitrage-remote-work-2026",
      },
      {
        label: "CashFlowAbroad: Geographic arbitrage playbook, 10 countries",
        url: "https://cashflowabroad.com/geographic-arbitrage-playbook-10-countries",
      },
      {
        label: "WorldRankd: Countries where the dollar buys most, 2026",
        url: "https://www.worldrankd.com/budget-living/countries-where-dollar-buys-most-2026",
      },
      {
        label: "GetWhereNext: Best countries to retire on $2,000 a month",
        url: "https://getwherenext.com/blog/best-countries-retire-2000-month",
      },
      {
        label: "The Margin: The real cost of the digital nomad life",
        url: "https://themargin.news/digital-nomad-cost",
      },
      {
        label: "AlwaysIM: Strategic geo-arbitrage for bootstrapped founders",
        url: "https://blog.alwaysim.com/strategic-geo-arbitrage-for-bootstrapped-founders-the-2026-p-2026",
      },
      {
        label: "GaminTraveler: The backlash against Americans in Lisbon",
        url: "https://www.gamintraveler.com/2026/05/10/the-backlash-against-americans-in-lisbon-what-went-wrong/",
      },
      {
        label:
          "Euronews: Digital nomads flock to Mexico City, locals face rising rents",
        url: "https://www.euronews.com/travel/2022/07/31/overtourism-as-digital-nomads-flock-to-mexico-city-locals-face-rising-rents",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "the-things-that-quietly-got-cheaper",
    title:
      "Everything is more expensive, except the things that quietly became almost free",
    description:
      "TVs fell 98%. Light fell 500,000-fold. Batteries fell 99%. Why the price collapses went uncelebrated, and why you still feel poorer anyway.",
    date: "2026-07-29",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "I want to defend a claim that sounds insane in 2026: some of the most important prices in your life have **collapsed**, are still collapsing, and you have never once celebrated it.",
          "Not “risen slower than inflation.” Collapsed. Fallen so far that the old prices read like typos. And the fact that you can't name these items off the top of your head, while you can recite the price of eggs from memory, says something fascinating about how human brains keep score.",
          "Let's start with the most extreme deflation ever recorded in an American price index.",
        ],
      },
      {
        kind: "prose",
        heading: "The television: down 98 percent, and nobody threw a parade",
        paragraphs: [
          "In 1997, Fujitsu's first 42-inch flat-screen cost around **$15,000-$22,900**. In 2005, a 40-inch Sony LCD was $4,000. Today a 65-inch 4K smart TV goes for **under $300** at Walmart.",
          "An analysis of 25 years of Black Friday ads found TV prices down more than 90 percent since 2000, before even adjusting for the fact that screens quadrupled in size and resolution. The official quality-adjusted CPI index for televisions fell **98.5 percent** since 1996, and no other item in the entire index comes close.",
          "Imagine the reverse headline. “TVs up 4,000 percent” would be civilizational news. The actual story got zero riots, zero congressional hearings, zero viral receipts. **Deflation is the tree that falls silently in the forest.**",
        ],
      },
      {
        kind: "prose",
        heading: "Light: the most beautiful price chart in human history",
        paragraphs: [
          "My favourite price of all time. In the 1700s, George Washington calculated that burning one good candle five hours a night for a year would cost him the equivalent of over **$1,000 today**.",
          "Economist William Nordhaus reconstructed the full arc: a 60-hour week of hard labour bought about **54 minutes** of quality light in the deep past; by 1990, **ten years** of light; today, around **52 years**. In the UK's long-run data, a million lumen-hours cost about £34,000 in the 1300s (in 2000 prices) and £2.15 by 2023, a 16,000-fold decline.",
          "The price of banishing darkness fell by a factor of roughly **500,000**. A thing once so precious that people rationed it minute by minute is now so cheap you forget to turn it off. That sentence describes the single greatest consumer bargain in history, and it has never once trended.",
        ],
      },
      {
        kind: "stats",
        heading: "The collapse is still happening, right now",
        items: [
          {
            value: "-99%",
            label: "Lithium-ion batteries, $9,200/kWh in 1991 to $78 in 2024",
          },
          { value: "-90%", label: "Solar modules, in the 2010s alone" },
          { value: "-98.5%", label: "Televisions, quality-adjusted, since 1996" },
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "This isn't a museum exhibit. Solar module prices fell roughly 90 percent in the 2010s alone, turning the most expensive electricity source into the cheapest in most of the world. Clothing rose only 50 percent in nominal terms since 1980 while everything else rose **319 percent**, meaning your wardrobe got dramatically cheaper in real terms without ever printing a negative number.",
          "Even the panic staples flip when you use the right lens: an egg cost an unskilled worker about 12 minutes of labour in 1919 and **2.4 minutes** today, even at post-shortage prices, and a 42-item food basket fell from 27 hours of blue-collar work in 1919 to under 4 in 2019.",
          "Zoom out to the whole 2000-2024 basket: prices rose 87 percent, wages rose 123 percent, so the average consumption bundle got about **19 percent cheaper in work-time**.",
          "At this point, half of you want to throw your phone. Good. Stay with me, because your objection is correct too.",
        ],
      },
      {
        kind: "prose",
        heading: "Why the collapses happened (and where they didn't)",
        paragraphs: [
          "The cheap things share a signature: **globally traded, technologically compounding, ferociously competitive**. TVs got cheap because LCD manufacturing scaled through billion-dollar fabs pumping out a million displays a day, mother-glass generations cut equipment cost per panel by 80 percent, and competition was so brutal one Corning presentation called the industry “a 25 year suicide pact for display manufacturers.”",
          "Batteries and solar follow learning curves: every doubling of cumulative production cuts prices roughly 18 to 20 percent, thousands of small improvements compounding with no single breakthrough.",
          "Now list what didn't collapse: **housing, healthcare, childcare, education**. They share the opposite signature: local, labour-intensive, supply-constrained and heavily gatekept. You can't manufacture an apartment in Shenzhen and ship it to Toronto. Regulation is part of the story, and one industry estimate puts government-imposed costs at roughly 24 percent of a new US single-family home's price, though how much weight to give regulation versus land scarcity, labour costs and demand is genuinely contested territory. Anyone telling you it's all one villain is selling a politics rather than an analysis.",
          "The honest summary: we got spectacularly good at making **things** cheap, and we remain terrible at making **places and care** cheap. Same economy, two opposite curves.",
        ],
      },
      {
        kind: "callout",
        heading:
          "So why do you feel poorer? Because the discount went to the optional stuff",
        paragraphs: [
          "The stuff that collapsed in price is mostly the stuff you can skip or stretch: the TV you replace every decade, the clothes, the gadgets, the lumens. The stuff that exploded is the stuff you cannot skip this month: the rent, the premium, the daycare.",
          "Your brain compounds the injury. People systematically over-weight price increases and mentally discard decreases when forming their sense of inflation, and you buy groceries 52 times a year but a TV once, so frequency bias buries the good news.",
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "So the optimist is right that your ancestors would weep at your abundance: 52 years of light for a week's wages, a supercomputer in your pocket, strawberries in January. And the doomer is right that the entry tickets to a stable adult life have inflated beyond an ordinary wage.",
          "Neither is lying. They're describing two halves of the same weird economy, and the argument between them, the one currently detonating in every family group chat, is really an argument about which half you're forced to buy more of.",
        ],
      },
      {
        kind: "prose",
        heading: "The bargains are invisible until you look",
        paragraphs: [
          "One last thought. Every price collapse in this article happened in slow motion, one or two percent per quarter, and slow-motion miracles are invisible by design. Nobody's brain flags “slightly cheaper than the anchor” as news; it just quietly re-anchors and forgets.",
          "Which means the only way to actually see the moving prices around you, up and down, is to check your instincts against reality on purpose.",
        ],
      },
      {
        kind: "cta",
        heading: "You should at least know the score",
        paragraphs: [
          "Pricele is a once-a-day ritual: one real item, you guess its price, you learn whether your mental number is stale. Most people discover they've been overestimating the collapsed stuff and underestimating the exploded stuff, which is exactly the distortion this article is about.",
          "The age you live in gives you 52 years of light for a week's work and charges you a fortune for a roof. One minute a day fixes the part you can control.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      {
        label:
          "Progressive Policy Institute: The price of a 40-inch TV has fallen 99% in 25 years",
        url: "https://www.progressivepolicy.org/ppis-trade-fact-of-the-week-the-price-of-a-40-inch-tv-set-has-fallen-by-99-in-25-years/",
      },
      {
        label: "SlashGear: How TVs became so cheap",
        url: "https://www.slashgear.com/1841280/ow-tvs-become-so-cheap/",
      },
      S.finexus,
      S.techspot,
      {
        label: "Construction Physics: How did TVs get so cheap?",
        url: "https://www.construction-physics.com/p/how-did-tvs-get-so-cheap",
      },
      {
        label: "BBC: How the price of light collapsed",
        url: "https://www.bbc.com/news/business-38650976",
      },
      {
        label:
          "Our World in Data: Light at night, and the price of lighting since 1300",
        url: "https://ourworldindata.org/light-at-night?insight=the-price-of-lighting-has-fallen-by-more-than-99-9-since-1300",
      },
      {
        label: "Our World in Data: Battery price decline",
        url: "https://ourworldindata.org/battery-price-decline",
      },
      {
        label: "The Planet Mag: The physics behind the battery cost collapse",
        url: "https://theplanetmag.com/grid-scale-battery-storage-is-scaling-faster-than-solar-did-here-is-the-physics-behind-the-cost-collapse/",
      },
      {
        label: "Independent Institute: Why televisions have become so cheap",
        url: "https://www.independent.org/article/2026/01/17/why-televisions-have-become-so-cheap/",
      },
      S.humanProgressEgg,
      S.humanProgressBlueCollar,
      S.pooleyPerry,
      S.nnng,
      S.statcan,
      S.europarl,
      S.anchoringPmc,
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "two-incomes-no-money",
    title: "Two incomes, no money: an autopsy of the modern family budget",
    description:
      "$120,000 a year, and $350 a month left for everything else. A line-by-line look at where a dual-income budget goes, and why there is nothing left to cut.",
    date: "2026-08-01",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "There's a specific kind of silence that happens at kitchen tables now. It's the end of the month. Two adults, two jobs, two incomes, sometimes two degrees. The spreadsheet is open. And the number at the bottom, after nothing extravagant has happened, no holiday, no disaster, no avocado-related indiscretions, sits close to zero.",
          "The first reaction is always private shame: **we must be doing something wrong.** So before anything else, let's run the actual numbers, because the most useful thing anyone can tell that couple is that the spreadsheet isn't lying and neither are they.",
        ],
      },
      {
        kind: "table",
        heading: "The autopsy",
        intro:
          "A representative dual-income American household earning **$120,000**, a sum that still sounds like wealth to anyone who formed their price instincts before 2015:",
        columns: ["Line item", "Monthly", "Share"],
        rows: [
          ["Taxes (federal, state, payroll)", "$2,500", "25%"],
          ["Housing (mortgage, tax, insurance)", "$2,400", "24%"],
          ["Childcare (two kids)", "$2,000", "20%"],
          ["Transportation (two cars)", "$1,000", "10%"],
          ["Food", "$800", "8%"],
          ["Healthcare (premiums + out-of-pocket)", "$650", "6.5%"],
          ["Utilities", "$300", "3%"],
          ["Everything else", "$350", "3.5%"],
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "Read that last line again. **Everything else: $350.** Clothes, birthdays, a dentist's surprise, the school trip, the car repair, savings, retirement, one pizza. On a hundred and twenty thousand dollars a year.",
          "Notice what's missing from the table: waste. There is no line to cut that fixes this. The four biggest items, taxes and housing and childcare and transport, are the price of being able to go to work at all.",
          "This is the two-income trap in a single table: the second salary didn't buy a better life, it bought the childcare and the second car required to earn the second salary, while housing repriced itself to what two salaries could bid. The 1970s single-earner family kept **46 percent** of its income as discretionary money; the 2000s dual-earner family, with nearly double the income, kept **25**. By 2023, the average dual-income household was spending about **75 percent** of everything on housing, transport, childcare and healthcare, against roughly **50 percent** for the single-income 1970s household.",
          "The math has been checked. **It's not you.**",
        ],
      },
      {
        kind: "prose",
        heading: "The people inside the spreadsheet",
        paragraphs: [
          "Now put faces on the lines, because this is a global spreadsheet.",
          "In **Sydney**, a mother the internet knows as K posted a video that detonated precisely because it was so unremarkable: two incomes, and they feel broke. Around her, the national median rent had jumped from $420 a week in 2020 to $650, the median house price hit $1.28 million, petrol passed $2.50 a litre, and a staple grocery basket rose over 15 percent in a few years. “I'm just trying to live,” another young Australian mother told reporters, in a sentence that could caption the entire decade.",
          "In **Fife, Scotland**, a single father named Andrew Anderson eats what's left on his daughter's plate after she finishes dinner. That's the meal plan. He can't remember when he last bought himself clothes; he's down to two pairs of trousers and watches her outgrow hers, because the energy price cap just rose 13 percent to £1,862 a year and something had to give.",
        ],
      },
      {
        kind: "quote",
        text: "What are you supposed to do? Are you supposed to heat your home? Are you supposed to eat food?",
        attribution: "Andrew Anderson, asked audibly close to tears",
      },
      {
        kind: "prose",
        paragraphs: [
          "In **Greater Manchester**, two sisters map the trap from both sides. Nicola receives £2,300 a month in benefits after a workplace accident, a sum that sounds substantial and still doesn't cover rent, utilities and the extra costs of her child's disability. Karen works at Tesco, her partner works full-time, and they have postponed their wedding three years running because the money is never there. One household on benefits, one on wages, both underwater: **the crisis stopped discriminating by employment status some time ago.**",
          "And lest this read as a poverty story: in the US, six-figure earners now describe living on one income as nearly impossible, and three-quarters of Americans say their incomes aren't keeping up with inflation. When the people above the median feel the squeeze, the problem is not individual discipline. It's the price of the floor.",
        ],
      },
      {
        kind: "callout",
        heading: "The cruellest part is the arithmetic of risk",
        paragraphs: [
          "The one-earner family of the past had a built-in shock absorber: if disaster struck the breadwinner, the second adult could enter the workforce. Today's family has already spent that reserve. Both adults work, the mortgage was approved against both salaries, and so a single job loss doesn't halve the safety margin. It deletes it.",
          "The two-earner family faces roughly **double** the annual probability of experiencing a job loss, precisely because there are two jobs to lose and no backup earner left to deploy.",
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "That's what the kitchen-table silence is actually about. Not the $350. The knowledge that the whole structure is load-bearing everywhere, and that one bad quarter, one diagnosis, one restructuring email, brings it down. Two incomes was supposed to mean security. It turned out to mean two points of failure and zero slack, and everyone living inside that math feels it in their sleep.",
          "So no, the fix is not a budgeting app's cheerful suggestion to cancel a streaming service. The serious personal responses all attack the fixed lines: housing costs, car count, debt, location. The serious collective responses are about supply and support: more homes, cheaper childcare, benefits pegged to what essentials actually cost, as the Trussell Trust argues with its Essentials Guarantee campaign. Anything else is rearranging the $350.",
        ],
      },
      {
        kind: "prose",
        heading: "Talk about the numbers out loud",
        paragraphs: [
          "One more thing, and it's the reason stories like K's video and Andrew's interview matter beyond sympathy. Every family at that silent kitchen table believes it is uniquely failing, because nobody publishes their budget.",
          "The moment someone does, whether a Sydney mum on camera, a receipt on TikTok or a Reddit post about $350 groceries, thousands of replies say the same thing: oh thank god, it's not just us. **Shame survives in the dark and dies in the comparison.** The single most financially healthy thing most couples could do this month is show one trusted friend their real numbers, and look at theirs.",
        ],
      },
      {
        kind: "cta",
        heading: "A gentler on-ramp to talking about money out loud",
        paragraphs: [
          "Pricele is a one-minute daily game where you guess what real things cost right now, whether groceries, bills, or the stuff of this article, and see how close you land. Couples tell me it's oddly disarming: arguing about whether daycare costs $1,400 or $2,000 a month is easier when it's a quiz.",
          "The spreadsheet was never the enemy. The silence was.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      S.wealthvieuTwoIncomes,
      S.modernMoneyLife,
      S.scottBurns,
      {
        label: "Zarnyxys: Sydney mum on Australia's cost-of-living crisis",
        url: "https://zarnyxys.com/article/sydney-mum-exposes-brutal-cost-of-living-crisis-in-australia-rising-prices-mortgages-fuel-costs",
      },
      {
        label: "Brisbane Times: “I'm just trying to live”",
        url: "https://www.brisbanetimes.com.au/national/i-m-just-trying-to-live-young-aussie-mum-describes-heartbreaking-reality-of-inflation-20260730-p60k4h.html",
      },
      {
        label:
          "The Business Times: “I live off scraps from my little girl's plate”",
        url: "https://thebusinesstimes.co.uk/i-live-off-scraps-from-my-little-girls-plate-heres-my-message-to-andy-burnham/",
      },
      {
        label: "UltraJoyPlay: Manchester mum: “I can't afford to live”",
        url: "https://ultrajoyplay.com/article/manchester-mum-struggling-on-benefits-i-can-t-afford-to-live",
      },
      S.cnbcSingleIncome,
      S.mirror2006,
      S.aol1997,
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "how-well-do-you-know-prices",
    title: "How well do you actually know prices? Take the test.",
    description:
      "Ten questions, real answers, no partial credit for vibes. Then the four documented reasons everybody fails, and the one-minute habit that fixes it.",
    date: "2026-08-02",
    status: "published",
    readingMinutes: 7,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "You have opinions about prices. Strong ones. You've muttered at a checkout screen this month. You have a firm position on whether groceries are outrageous, whether rent is insane, whether everything costs double now.",
          "So here's an uncomfortable question: **when did you last check whether your numbers are right?**",
          "The entire inflation debate rests on a secret, which is that almost nobody actually knows what things cost. We know what things used to cost, back when we first started paying attention, and we've been arguing from that ghost ledger ever since.",
          "Today, instead of another opinion, I'm offering a mirror. Ten questions. Write your guesses down, actual numbers, before scrolling to the answers. No partial credit for vibes.",
        ],
      },
      {
        kind: "list",
        heading: "The test",
        intro:
          "Guess a specific number for each. Your local currency is fine for 1-6; use USD for the global items.",
        items: [
          "A litre (or gallon) of milk at your usual supermarket, this week",
          "A dozen eggs",
          "A jar of honey",
          "A month of full-time infant daycare in your area",
          "A basic 65-inch 4K TV",
          "Your own monthly electricity bill, without looking",
          "A Big Mac in the United States",
          "A base iPhone in India",
          "What a $155 grocery cart from 1997 costs today",
          "What percentage smaller that “same” cereal box is versus a decade ago",
        ],
      },
      {
        kind: "prose",
        heading: "The reveals",
        paragraphs: [
          "**The Big Mac (7):** about **$5.79** in the US. Most people guess low, still anchored to the burger of their student years.",
          "**The iPhone in India (8):** ₹125,900 for a 256GB Pro, roughly **$1,517**, a 38 percent premium over the US price, in a country where the median formal worker earns about $385 a month. Nearly everyone guesses that poorer countries pay less. The opposite is true, and that single wrong assumption distorts how people reason about global inequality.",
          "**The 1997 cart (9):** about **$500**, not the ~$312 the official inflation calculator predicts. If you guessed near $312, congratulations, you know the statistics; if you guessed near $500, you know the store. The gap between those two answers is the entire cost-of-living debate in one number.",
          "**The TV (5):** **under $300**. Most people guess $600-1,000, because their TV anchor was installed decades ago and TVs are the rare item that collapsed, down 90-plus percent since 2000. Price blindness runs in both directions: we overestimate the collapsed stuff and underestimate the exploded stuff.",
          "**The daycare (4):** US centre-based infant care averages around **$19,000 a year**, over $1,500 a month. People who've never bought childcare routinely guess half that, and it's the single most common source of “why are they always broke?” misjudgment of other families.",
          "**The shrinking box (10):** typical shrinkflation moves cut **9 to 16 percent** of the product while the price holds. A cereal box dropping from 18 to 15 ounces is a 17 percent per-ounce increase that most shoppers never register.",
          "Items 1-3 and 6: check against your own store and your own bill. Be honest about the gaps.",
        ],
      },
      {
        kind: "table",
        intro: "Individual items from that 1997 cart, for your scoring pleasure:",
        columns: ["Item", "1997", "Today"],
        rows: [
          ["Bag of coffee", "$2.47", "$9.43"],
          ["Little Debbie brownies", "$1.09", "$5.75"],
          ["Diapers", "$12.99", "$31.47"],
        ],
      },
      {
        kind: "list",
        heading: "Why you failed (everyone fails)",
        intro:
          "Your errors weren't random, and they weren't stupidity. They were four well-documented bugs firing at once.",
        items: [
          "**You never read the price in the first place.** For routine purchases, price memory is implicit: your brain files a vague “normal-ish” and moves on, retrieving it later through lazy shortcuts rather than actual numbers.",
          "**Your anchors are ancient.** The first prices you absorbed act as anchors that drag every later judgment toward them; the effect is among the most robust in psychology and persists for weeks even when the anchor is meaningless, like digits of your own social security number. Your first rent and your first tank of gas aren't memories. They're calibration errors with tenure.",
          "**You only file the increases.** People weight rising prices far more than falling ones; strip the ignored price declines out of the index and the gap between perceived and actual inflation almost disappears. Your internal ledger is an outrage diary, not an accounting document.",
          "**The shelf is gaslighting you.** Retailers actively supply fake reference points, the eternal “was $89.99, now $49.99”, because externally supplied anchors measurably bend what you'll judge as fair and what you'll pay. Meanwhile shrinkflation, “a tax on consumer attention,” harvests the gap between the package and your memory of the package.",
        ],
      },
      {
        kind: "prose",
        heading: "Why it's worth fixing",
        paragraphs: [
          "This isn't trivia. A miscalibrated price sense costs you money and judgment in specific, compounding ways.",
          "You can't spot a genuinely good deal, because “50% off” only means something relative to a true price you don't know. You can't detect shrinkflation without a unit-price instinct. You can't budget accurately with a mental ledger that logs increases and deletes decreases. You can't negotiate salary sensibly without knowing what your cost of living actually did this year, as opposed to what the headline says the average person's did.",
          "And, maybe most corrosive of all, you can't argue fairly with your parents, your partner, or the internet when both sides are quoting numbers from different decades.",
          "**Price literacy is the closest thing personal finance has to a foundational skill**, and it's the one nobody teaches, because everyone assumes they already have it. You just took the test. Do you?",
        ],
      },
      {
        kind: "callout",
        heading: "The fix takes one minute a day",
        paragraphs: [
          "The good news buried in all that psychology: calibration is trainable, and the training loop is embarrassingly simple. Guess, reveal, feel the gap, repeat.",
          "Reference prices are learned from exposure, so deliberate, repeated exposure with feedback overwrites the stale anchors. The wince when you're off by 40 percent isn't failure. It's the update installing.",
        ],
      },
      {
        kind: "cta",
        heading: "Ten questions ago you had opinions. Now you have a score.",
        paragraphs: [
          "That's exactly what Pricele is, and this article is, I'll admit it, the mission statement. One real item a day, you guess the price, you get scored on how close you landed.",
          "If the test stung, good. That's the fixable kind of sting. Come play tomorrow's round, and bring someone whose price list is even older than yours.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      S.bigMac2026,
      S.iphone3tej,
      S.aol1997,
      S.yahoo1997,
      S.finexus,
      S.techspot,
      S.longitude,
      S.moneyProgression,
      S.nnng,
      S.implicitPrice,
      S.anchoringPmc,
      S.anchorsPersist,
      S.coherentArbitrariness,
      S.statcan,
      S.scienceDirectFraming,
      S.frontiers,
      S.referencePrice,
      S.aolMilk,
    ],
  },

  // ---------------------------------------------------------------------------
  // THE EXPLAINERS.
  //   The ten pieces above are arguments about prices. These are explanations of
  //   the machinery underneath, and they exist because the reference pages kept
  //   raising questions the reference pages had no room to answer: why the
  //   ranking flips when you switch to local wages, why fuel refuses to behave
  //   like the other six items, why two countries with the same average income
  //   have different price levels. Each one is linked from the page that raises
  //   the question, which is the only reason to write it.
  // ---------------------------------------------------------------------------
  {
    slug: "why-the-same-thing-costs-different-amounts",
    title: "Four things set every price, and only one of them is the product",
    description:
      "The same can, the same recipe, the same machine that made it, and a five-fold price gap between two countries. What follows is what actually sits in that difference.",
    date: "2026-08-02",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Take a bottle of Coca-Cola. Not a similar drink, not a local equivalent: the same recipe, made to the same specification, on machines built by the same handful of suppliers, filled to the same volume, sealed with the same cap.",
          "Now move it between countries and watch the price move by a factor of five.",
          "This is the fact the whole site is built around, and the first thing to understand is that almost none of that gap is the drink. The syrup, the aluminium, the sugar and the water are commodities that trade on world markets and cost roughly the same to buy anywhere. What changes is everything wrapped around them.",
          "There are four wrappers. Once you can name them, price gaps stop looking arbitrary and start looking like arithmetic.",
        ],
      },
      {
        kind: "prose",
        heading: "1. Whether the thing can travel",
        paragraphs: [
          "Economists split everything you can buy into **tradables** and **non-tradables**, and it is the single most useful cut in the subject.",
          "A tradable is anything that can be put on a ship. A laptop, a barrel of oil, a kilo of coffee beans, a phone. If a laptop were meaningfully cheaper in one country than another, someone would buy it there, sell it here, and keep doing so until the gap closed to roughly the cost of shipping and duty. That mechanism is called arbitrage, and it works. Prices of tradable goods across countries sit in a much narrower band than most people expect.",
          "A non-tradable is anything that has to be produced where it is consumed. A haircut. A restaurant meal. A hotel night. The floor space of a café. Nobody can import a Norwegian haircut into Egypt, so nothing forces the two prices together, and they can differ by a factor of ten indefinitely without anything being wrong.",
          "Almost every everyday purchase is a blend. A cappuccino is perhaps a fifth tradable, the beans and the milk. The other four-fifths are not: the barista's time, the rent on the room you drink it in, the electricity, the dishwasher. That mix is why the coffee price gap between rich and poor countries is enormous while the gap in the price of the beans themselves is small.",
        ],
      },
      {
        kind: "callout",
        heading: "The one-sentence version",
        paragraphs: [
          "The more of a purchase is somebody's time and somebody's floor space, the more its price tracks the local wage rather than the world market.",
        ],
      },
      {
        kind: "prose",
        heading: "2. What an hour is worth locally",
        paragraphs: [
          "Which leads straight to the second wrapper, and the biggest one.",
          "Behind almost every non-tradable price is a wage. The cashier, the driver who brought the pallet, the person who cleaned the floor, the shift manager, the accountant who filed the returns. A country where an hour of ordinary labour costs thirty dollars cannot produce a cheap restaurant meal, because the meal is mostly hours.",
          "This is why the price ranking on a country page and the ranking on the same page's work-time column are so often near-mirrors of each other. In dollar terms, the expensive countries are the rich ones. In time terms, the expensive countries are the poor ones, because a price that is high relative to a local wage is the definition of expensive to the person paying it.",
          "It also explains an effect that surprises people who have not seen it before: as a country gets richer, its non-tradables get more expensive relative to the rest of the world, even if nothing about the haircut changes. Wages rise across the whole economy, including in the parts of it that never got more productive. The barber is not cutting hair faster than a barber in 1950. He is simply competing for labour with industries that are.",
        ],
      },
      {
        kind: "prose",
        heading: "3. What the state takes at the till",
        paragraphs: [
          "The third wrapper is the one that can be read off a table, and it is startlingly large.",
          "Most of the world funds itself partly through a tax charged on the sale itself: VAT in Europe, GST in Australia and Canada, IVA in Latin America, a consumption tax in Japan. Standard rates across the countries in this game run from **5 percent** to **27 percent**, and that difference alone can move a shelf price by a fifth before anything else has been considered.",
          "Two refinements matter more than the headline rate.",
          "The first is that most countries treat food differently from everything else, and they disagree wildly about how. The United Kingdom zero-rates most supermarket food. Ireland does the same. Mexico zero-rates food and medicine. Denmark charges its full standard rate on groceries with no reduced band at all. Two European countries with almost identical headline rates can therefore tax a shopping basket completely differently.",
          "The second is that the tax point moves. Japan charges a lower rate on food bought to take away than on the same food eaten in, so a coffee's tax depends on where you stand to drink it. Several countries define a reduced rate for basic staples and a standard rate for anything considered a luxury. Legislatures draw that line; courts then spend real time deciding whether a particular biscuit is a cake.",
        ],
      },
      {
        kind: "prose",
        heading: "4. What it cost to get there",
        paragraphs: [
          "The last wrapper is distance, and it is the one people overestimate.",
          "Container shipping is astonishingly cheap per unit. Moving a tonne of goods across an ocean typically costs less than trucking it a few hundred kilometres inland at the other end, which is why an island economy's prices depend less on being an island than on how far the port is from everyone else.",
          "Where distance genuinely bites is on the things that cannot wait. Fresh milk, fresh produce, anything that has to arrive cold. A country that has to fly in fruit out of season pays for the plane. A country that grows it pays for a truck. That is most of the apple price gap, and almost none of the gap on a can of soft drink, which will sit happily in a warehouse for a year.",
          "Import duty is the other half of this wrapper and behaves less predictably, because it is policy rather than geography. A country protecting a domestic dairy industry can put a tariff wall around milk that dwarfs the cost of shipping it.",
        ],
      },
      {
        kind: "table",
        heading: "Which wrapper dominates which item",
        intro:
          "Rough shares, not precise ones. The point is the pattern, which is that the items people expect to behave alike do not.",
        columns: ["Item", "Mostly driven by"],
        rows: [
          ["Cappuccino", "Local wages and rent"],
          ["Big Mac", "Local wages, then rent, then beef"],
          ["Bottled soft drink", "Distribution margin and tax"],
          ["Litre of milk", "Farm policy and cold-chain distance"],
          ["Dozen eggs", "Feed cost and disease outbreaks"],
          ["Kilo of apples", "Climate, season and freight"],
          ["Litre of petrol", "Tax and subsidy, almost entirely"],
        ],
        caption:
          "Fuel is the outlier: it is a pure global commodity whose retail price is set by national politics.",
      },
      {
        kind: "prose",
        heading: "Why this is worth carrying around",
        paragraphs: [
          "Because it converts a fact you cannot use into a prediction you can.",
          "Told that a country is rich, you now know which of its prices will be high and which will not. Its restaurant meals, its haircuts and its coffee will be expensive, because those are hours. Its electronics will be close to everyone else's, because those are containers. Its fuel could be anything at all, because that is a vote.",
          "Told that a country is poor, the same logic runs backwards, with one twist to keep hold of: the tradables that look reasonably priced in dollars are the ones that are punishingly expensive in local hours. A phone that costs the same everywhere is not the same purchase everywhere.",
          "That is the whole trick, and it is why guessing gets easier fast. You are not recalling prices. You are estimating a wage and adding a tax.",
        ],
      },
      {
        kind: "cta",
        heading: "Try it on today's country",
        paragraphs: [
          "Take the four wrappers to the daily puzzle: ask how much of the item is somebody's hour, what the country taxes it at, and whether it had to travel cold. You will be closer on the first guess than you expect.",
        ],
        buttonLabel: "Play today's puzzle",
      },
    ],
    sources: [
      {
        label: "The Economist: The Big Mac index",
        url: "https://www.economist.com/big-mac-index",
      },
      {
        label: "OECD: Purchasing power parities (PPP)",
        url: "https://www.oecd.org/en/data/indicators/purchasing-power-parities-ppp.html",
      },
      {
        label: "World Bank: International Comparison Program",
        url: "https://www.worldbank.org/en/programs/icp",
      },
      {
        label: "Tax Foundation: VAT rates in Europe",
        url: "https://taxfoundation.org/data/all/eu/value-added-tax-2025-vat-rates-europe/",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "petrol-prices-are-a-political-decision",
    title: "Petrol is the same liquid everywhere and costs whatever a government wants",
    description:
      "Crude oil trades at one world price. Pump prices differ by a factor of forty. Nearly all of that gap is tax in one direction and subsidy in the other.",
    date: "2026-08-04",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Most items in this game behave the way you would expect. Rich country, higher price; poor country, lower price; a spread of maybe five to one between the extremes. Groceries do it, café drinks do it, a Big Mac does it.",
          "Fuel does something else entirely. The spread between the cheapest and most expensive countries in the world runs past **forty to one**. The ranking scrambles rich and poor countries together. Several major oil exporters sit at both ends of it.",
          "There is a reason fuel is the item people get most wrong, and it is that they are trying to reason about it as a commodity. Reasoning about it as a tax rate gets you much closer.",
        ],
      },
      {
        kind: "prose",
        heading: "Start with what is actually in the tank",
        paragraphs: [
          "Crude oil is the most thoroughly globalised product on earth. It trades continuously against two main benchmarks, Brent and WTI. The price difference between them is a matter of a couple of dollars a barrel, reflecting quality and location. There is no such thing as cheap national crude for domestic use, because any barrel sold domestically below the world price is a barrel someone could have exported instead.",
          "Refining adds a margin that varies with capacity and season but not by anything like an order of magnitude. Distribution adds a few cents. By the time a litre of petrol is sitting in a tanker at the forecourt, its cost is remarkably similar across the world.",
          "Everything that happens after that point is policy.",
        ],
      },
      {
        kind: "stats",
        heading: "The gap, roughly",
        items: [
          { value: "1 world", label: "Price for the crude going in" },
          { value: "~40×", label: "Spread between cheapest and dearest pumps" },
          { value: "50%+", label: "Share of a European pump price that is tax" },
        ],
      },
      {
        kind: "prose",
        heading: "One direction: excise duty",
        paragraphs: [
          "Most of Europe layers two taxes onto fuel. First an excise duty, a fixed amount per litre that does not move when the oil price does. Then VAT, charged as a percentage on top of the duty-inclusive price, so the state charges tax on its own tax.",
          "The result is that in a typical Western European country, **more than half** of what you hand over at the pump is government revenue, and in several it is closer to two-thirds. This is not an accident or an oversight. From a treasury's point of view, fuel duty is close to a perfect tax. Demand barely moves in the short run. Collection is trivial, since there are only a handful of refineries and importers to invoice. And it can be presented as an environmental measure rather than a revenue measure.",
          "Because the duty is a fixed amount per litre rather than a percentage, it also acts as a shock absorber. When crude doubles, a European pump price rises by much less in percentage terms than an American one, because the tax component did not move. This is one of the reasons European drivers experience oil shocks as milder than American drivers do, despite paying far more per litre in absolute terms.",
        ],
      },
      {
        kind: "prose",
        heading: "The other direction: subsidy",
        paragraphs: [
          "Run the same logic backwards and you get the other end of the table.",
          "A number of oil-producing states sell fuel domestically at below the world price, funding the difference out of the export revenue of the same oil. In the most extreme cases fuel has been sold for a few cents a litre, cheaper than the bottled water sold next to it in the same forecourt.",
          "This is enormously expensive and famously difficult to reverse. The International Monetary Fund has spent years documenting the arithmetic: consumer fuel subsidies absorb budget that would otherwise fund health or schools, benefit better-off households most because they consume the most fuel, and encourage exactly the consumption a government elsewhere is trying to tax.",
          "Everybody involved knows this. Subsidies survive anyway, because cheap fuel is one of the few economic policies whose effect a citizen sees weekly, and attempts to withdraw one have brought down governments. When a country announces a phased reduction in fuel subsidy, the phasing looks like timidity and is closer to arithmetic: several governments that did it abruptly are no longer governments.",
        ],
      },
      {
        kind: "prose",
        heading: "Why oil producers appear at both ends",
        paragraphs: [
          "This is the part that breaks people's intuition, so take it flat: **producing oil tells you nothing about a country's pump price**.",
          "Norway is one of Europe's largest petroleum exporters and has some of the most expensive fuel on the continent, because it taxes it heavily and invests the proceeds. Several Gulf producers sell it at a fraction of the world price. The United States produces more crude than any other country and sits far below European prices. Its production has little to do with it. Its federal fuel tax has not risen in nominal terms since 1993, and its state taxes are modest.",
          "Producing oil determines whether a country can afford a subsidy. It does not determine whether it chooses one.",
        ],
      },
      {
        kind: "list",
        heading: "How to guess a fuel price in four steps",
        intro:
          "In rough order of how much each step moves the answer.",
        items: [
          "Start from the world cost of a litre of refined product, delivered. This is your floor, and it is nearly the same everywhere.",
          "Ask whether the country is a net exporter of crude that subsidises domestic consumption. If yes, guess close to the floor or below it, and stop.",
          "If not, ask whether it is in Europe. If yes, roughly double or triple the floor: duty plus VAT is doing the work.",
          "Everywhere else, adjust modestly for the local tax rate and whether fuel is imported through a long, thin supply chain.",
        ],
      },
      {
        kind: "callout",
        heading: "The trap in the middle",
        paragraphs: [
          "The countries hardest to guess are the ones that do neither. A middle-income importer with no subsidy and no European-scale duty pays close to the underlying cost of the fuel, which lands its pump price near the middle of the table regardless of how rich or poor it is. Fuel is the one item on this site where knowing a country's income tells you almost nothing.",
        ],
      },
      {
        kind: "prose",
        heading: "What this changes about the rest of the table",
        paragraphs: [
          "Fuel is also an input to every other item in the game.",
          "The truck that brought the milk runs on it. So does the boat that brought the coffee, the tractor that harvested the apples and the plant that pressed the cans. A country with a heavy fuel duty pays that duty again, indirectly, in the price of everything that moved.",
          "That is the strange, quiet consequence of a policy most people file under transport: fuel tax is one of the few levers a government can pull that raises every price in the economy at once, and it is chosen anyway, because there is no other lever that raises so much revenue with so little argument at the point of collection.",
        ],
      },
      {
        kind: "cta",
        heading: "Test it on a fuel day",
        paragraphs: [
          "When the daily puzzle serves a litre of petrol, ignore what you know about the country's wages and ask a single question instead: does this government tax fuel or fund it? Almost everything else is noise.",
        ],
        buttonLabel: "Play today's puzzle",
      },
    ],
    sources: [
      {
        label: "GlobalPetrolPrices: Petrol prices around the world",
        url: "https://www.globalpetrolprices.com/gasoline_prices/",
      },
      {
        label: "IMF: Energy subsidies",
        url: "https://www.imf.org/en/Topics/climate-change/energy-subsidies",
      },
      {
        label: "IEA: Fossil fuel subsidies",
        url: "https://www.iea.org/topics/fossil-fuel-subsidies",
      },
      {
        label: "US Energy Information Administration: Gasoline explained",
        url: "https://www.eia.gov/energyexplained/gasoline/",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "why-poor-countries-are-cheap",
    title: "Why poor countries are cheap, and why it is not what you think",
    description:
      "The real answer has nothing to do with profits or standards. It is a sixty-year-old piece of economics about haircuts, and it explains most of the price map.",
    date: "2026-08-06",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Ask most people why things are cheaper in a poorer country and you will get one of two answers. Either businesses there accept smaller profits, or the standards are lower and you are buying a worse thing.",
          "Both are wrong, and you can prove it without leaving the shop. The can of Coke is the same can. The Big Mac is made to the same specification. The margins on a McDonald's franchise are not charity anywhere.",
          "The real answer was worked out independently by two economists in 1964, and is named after both of them. It turns on a single fact: some jobs get more productive over time, and others cannot.",
        ],
      },
      {
        kind: "prose",
        heading: "The haircut problem",
        paragraphs: [
          "Start with a question that sounds trivial. How many haircuts an hour could a barber do in 1900? Call it two or three.",
          "How many can a barber do today? Two or three.",
          "Now ask the same question about a car worker, or a farmer, or a person assembling electronics. The answers have moved by factors of ten, a hundred, sometimes more. A modern factory worker produces an amount of output per hour that would have looked like witchcraft to their great-grandparent doing the same nominal job.",
          "So here is the puzzle. If a barber is no more productive than a barber a century ago, why does a haircut in a rich country cost the equivalent of a substantial chunk of a day's minimum wage, rather than what it cost in 1900?",
        ],
      },
      {
        kind: "callout",
        heading: "Because the barber could leave",
        paragraphs: [
          "A barber in a country with well-paid factory work has to be paid roughly what the factory would pay, or they go and work in the factory. The wage rises across the whole economy, dragged up by the productive part of it, whether or not the unproductive part got any better at its job. That is the mechanism, and it is called the **Balassa–Samuelson effect**.",
        ],
      },
      {
        kind: "prose",
        heading: "Running it forwards",
        paragraphs: [
          "Follow the chain through and the price map falls out of it.",
          "A country gets richer because its **tradable** sector, the part that makes things you can ship, becomes more productive. Higher productivity means those firms can pay more. To hire anyone at all, everyone else must pay more too, including the sectors that never got more productive: restaurants, haircuts, cleaning, childcare, hotels, the person behind the counter.",
          "But those sectors did not get more efficient. They are paying more for the same amount of work. So their prices rise, and they rise permanently, relative to the price of the tradable goods that did get cheaper to make.",
          "The end state is a country where a laptop costs about what it costs anywhere and a sandwich costs three times what it costs elsewhere. Which, if you have ever travelled from a middle-income country to a high-income one, is precisely the experience: the electronics feel normal and the lunch feels insane.",
        ],
      },
      {
        kind: "table",
        heading: "What gets expensive as a country gets rich",
        columns: ["Purchase", "Mostly labour?", "Price gap, rich vs poor"],
        rows: [
          ["Restaurant meal", "Yes", "Very large"],
          ["Haircut", "Yes", "Very large"],
          ["Café coffee", "Mostly", "Large"],
          ["Bus fare", "Mostly", "Large"],
          ["Litre of milk", "Partly", "Moderate"],
          ["Smartphone", "No", "Small"],
          ["Litre of fuel", "No", "Unrelated to income"],
        ],
      },
      {
        kind: "prose",
        heading: "The Penn effect, which is the same fact from the outside",
        paragraphs: [
          "Economists have a second name for what this looks like in the aggregate. Convert every country's price level into a common currency at market exchange rates, plot it against income per head, and you get a clean upward slope: **richer countries have higher price levels**. It is called the Penn effect, after the dataset that first made it obvious.",
          "The slope is the reason exchange rates mislead so badly. If you convert a Vietnamese salary into dollars at the market rate and compare it with an American one, you are implicitly pricing that salary as though it were being spent on tradable goods in the United States. Very little of a salary goes on tradables. It goes on rent, food prepared by someone, transport and services, all of which cost what they cost locally.",
          "This is why the World Bank and the OECD publish purchasing-power-parity conversions at all, and why every serious cross-country income comparison uses them. The market exchange rate answers a question about capital flows. It was never designed to answer a question about living standards.",
        ],
      },
      {
        kind: "prose",
        heading: "What this predicts, and where it fails",
        paragraphs: [
          "The theory earns its keep by being falsifiable, and the places it fails are informative.",
          "It predicts that a country which gets rich quickly should see its non-tradable prices rise quickly. Broadly, this happens; the rising cost of services in fast-growing economies is one of the most reliable patterns in development.",
          "It predicts that a country's price level should track its income. Mostly it does, but resource exporters break the pattern in both directions. A state that earns a great deal from oil without a large productive tradable sector can end up with high incomes and a distorted price structure, which is the phenomenon usually filed under Dutch disease.",
          "And it predicts nothing at all about goods whose price is set by policy rather than cost, so fuel sits outside this entire framework and needs its own explanation.",
        ],
      },
      {
        kind: "prose",
        heading: "The uncomfortable half",
        paragraphs: [
          "There is a version of this that gets said cheerfully, as though it were purely good news: things are cheap there, wages are high here, everyone is fine.",
          "The arithmetic does not cooperate. If prices rise with income, then a poor country's cheapness describes its wages rather than offering its residents a discount. The bus fare is low because the driver's hour is worth little, and the driver is buying the same bus fare.",
          "What a low price level genuinely does provide is a large advantage to anyone earning in a foreign currency and spending locally. It is why remittances go so far, why foreign pensions stretch, and why the arrival of enough remote workers earning rich-country salaries can push local prices up faster than local wages follow. That last effect is the least discussed and the most keenly felt.",
          "The reason this site shows work-time alongside dollar prices is that the dollar column and the hours column tell opposite stories, and only one of them is about the person actually standing at the till.",
        ],
      },
      {
        kind: "cta",
        heading: "Guess in wages, not in dollars",
        paragraphs: [
          "Next time the puzzle serves a country you know little about, do not try to recall a price. Estimate what an hour of ordinary work is worth there, decide how much of the item is somebody's hour, and multiply. It is a better method than memory.",
        ],
        buttonLabel: "Play today's puzzle",
      },
    ],
    sources: [
      {
        label: "World Bank: International Comparison Program",
        url: "https://www.worldbank.org/en/programs/icp",
      },
      {
        label: "OECD: Purchasing power parities (PPP)",
        url: "https://www.oecd.org/en/data/indicators/purchasing-power-parities-ppp.html",
      },
      {
        label: "IMF Finance & Development: Purchasing power parity explained",
        url: "https://www.imf.org/external/pubs/ft/fandd/basics/ppp.htm",
      },
      {
        label: "The Economist: The Big Mac index",
        url: "https://www.economist.com/big-mac-index",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "purchasing-power-parity-explained",
    title: "The salary comparison you keep seeing online is wrong",
    description:
      "Converting a wage at the market exchange rate answers a question nobody asked. Purchasing power parity answers the one you meant, and has its own traps.",
    date: "2026-08-08",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "You have seen the post. Average salary in country A, converted to dollars. Average salary in country B, converted to dollars. A ratio, and a conclusion about which country is doing better.",
          "The arithmetic is fine. The comparison is close to meaningless, and understanding why is the single most useful thing on this page.",
        ],
      },
      {
        kind: "prose",
        heading: "What an exchange rate actually prices",
        paragraphs: [
          "A market exchange rate is set by the people trading currencies. Importers, exporters, investors moving capital, central banks, speculators. What they are collectively pricing is the demand to hold one currency against another, which is dominated by things that cross borders: goods in containers, bonds, shares, direct investment.",
          "Now think about what a salary is spent on. Rent, or a mortgage on a building that cannot be moved. Food, most of it prepared or retailed locally. Transport. Childcare. A haircut. Electricity. A phone contract. The great majority of ordinary spending goes on things that never cross a border and whose prices are therefore never touched by the mechanism that sets the exchange rate.",
          "Converting a salary at the market rate implicitly asks: what would this money buy if it were spent on internationally traded goods? That is a real question. It is just not the question anyone means when they compare wages.",
        ],
      },
      {
        kind: "callout",
        heading: "The question you meant",
        paragraphs: [
          "How much stuff can a person actually buy where they live? To answer that you need an exchange rate built from a basket of what people buy rather than from what traders trade. That is a **purchasing power parity**.",
        ],
      },
      {
        kind: "prose",
        heading: "How a PPP is built",
        paragraphs: [
          "The serious version is the World Bank's International Comparison Program, which is one of the largest statistical exercises on earth and rather underappreciated for it.",
          "Statistical agencies in participating economies price a common list of hundreds of tightly specified items: not \"a shirt\" but a shirt of a stated fibre composition, weight and construction, so that two countries are genuinely pricing the same thing. Those prices are aggregated into a conversion factor that says how many units of local currency buy what one dollar buys in the United States.",
          "The result is the number behind every \"GDP at PPP\" figure you have ever read, and the difference between it and the market rate is frequently enormous. In lower-income economies, a PPP conversion routinely values local income at two to four times what the market rate implies, precisely because so much of the basket is non-tradable and therefore cheap.",
        ],
      },
      {
        kind: "prose",
        heading: "The Big Mac index is a PPP with one item in the basket",
        paragraphs: [
          "The Economist's Big Mac index, published since 1986, is the joke that turned out to be useful. Take one product that is close to identical worldwide, compare its local price with its American price, and you get an implied exchange rate. Compare that with the actual exchange rate and you get a claim about whether a currency is over- or under-valued.",
          "It works better than it has any right to. A Big Mac is a small, standardised bundle of exactly the ingredients that matter: beef and bread, which trade globally; plus labour, rent, electricity and local tax, which do not. It is a basket of one, but it is a well-chosen one.",
          "It also fails in exactly the way the theory predicts, and the failure is the interesting half. Burgers look systematically cheap in poor countries even after adjusting, because so much of the burger is local labour. The Economist publishes a second version adjusted for income per head for this reason, and the adjusted index is the one worth reading.",
        ],
      },
      {
        kind: "list",
        heading: "Four traps in PPP figures",
        intro:
          "PPP is the right tool and it is still routinely misused. These are the ones that bite.",
        items: [
          "**The basket is not your basket.** A PPP is built from a representative national basket. If your spending is unusual, heavy on imported goods, or concentrated in a capital city, the national PPP does not describe you.",
          "**Quality is hard to hold constant.** Two countries can price a \"comparable\" item where one version is materially better. Statisticians work hard at this and it remains the largest source of argument in the field.",
          "**Capital cities distort everything.** Most people in a country do not live in its most expensive city, but most price data, and nearly all the anecdotes on the internet, come from there.",
          "**PPP is wrong for anything international.** If you are paying off a dollar debt, buying imported equipment, or planning to move abroad, the market rate is the correct one and PPP is the misleading one. The right conversion depends entirely on where the money is going to be spent.",
        ],
      },
      {
        kind: "prose",
        heading: "A worked way of thinking about it",
        paragraphs: [
          "Suppose you are weighing a job in a high-cost country against one at home paying a third as much in dollar terms.",
          "The market-rate comparison says the foreign job pays three times more. The PPP comparison might say it pays perhaps a third more once local prices are accounted for, because the higher salary is buying groceries and rent at higher prices.",
          "Both numbers are correct and they answer different questions. Everything you spend locally should be judged at PPP. Everything you send home, save in a foreign currency, or spend on travel and imported goods should be judged at the market rate. Almost nobody is entirely in one category, so the honest answer to \"which job pays more\" is usually a split.",
          "The reason this game shows both a dollar price and a work-time figure is the same reason. The dollar column is the market-rate view, useful for comparing countries. The hours column is the PPP-flavoured view, useful for understanding what a price means to the person paying it. They frequently rank countries in opposite orders, and that disagreement is the most informative thing on the page.",
        ],
      },
      {
        kind: "cta",
        heading: "See the two rankings disagree",
        paragraphs: [
          "Every country page on this site lists the same basket in dollars and in local work-time. Play a round, then look at how far a country moves between the two columns.",
        ],
        buttonLabel: "Play today's puzzle",
      },
    ],
    sources: [
      {
        label: "World Bank: International Comparison Program",
        url: "https://www.worldbank.org/en/programs/icp",
      },
      {
        label: "OECD: Purchasing power parities (PPP)",
        url: "https://www.oecd.org/en/data/indicators/purchasing-power-parities-ppp.html",
      },
      {
        label: "IMF Finance & Development: Purchasing power parity",
        url: "https://www.imf.org/external/pubs/ft/fandd/basics/ppp.htm",
      },
      {
        label: "The Economist: The Big Mac index",
        url: "https://www.economist.com/big-mac-index",
      },
      {
        label: "Eurostat: Purchasing power parities methodology",
        url: "https://ec.europa.eu/eurostat/web/purchasing-power-parities",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "what-you-pay-for-in-a-cup-of-coffee",
    title: "The coffee in your coffee costs less than the lid",
    description:
      "Green beans are a single-digit share of what a café charges. Where the rest goes, and why a record harvest barely moves the price of a flat white.",
    date: "2026-08-10",
    status: "published",
    readingMinutes: 7,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Every so often the coffee price makes the news. A drought in Brazil, a poor robusta harvest in Vietnam, and the futures price of green coffee jumps by half in a few months. Headlines follow about the cost of your morning cup.",
          "Then you go to a café and the flat white costs almost exactly what it cost before.",
          "Nobody is gouging you, and nobody is sitting on an increase they intend to pass along later. This is the ordinary arithmetic of a business where the coffee is one of the smaller line items.",
        ],
      },
      {
        kind: "prose",
        heading: "Where the money in a café cup goes",
        paragraphs: [
          "A single espresso shot uses somewhere between seven and eleven grams of roasted coffee. Roasting drives off moisture, so a kilo of roasted beans starts life as rather more than a kilo of green ones, but the direction of the arithmetic is unchanged: even at the elevated green-coffee prices of the last two years, the beans in a single café drink are a matter of cents.",
          "Now list what else the café is paying for.",
        ],
      },
      {
        kind: "list",
        intro: "In roughly descending order for a typical urban café:",
        ordered: false,
        items: [
          "**Staff.** The barista's time, plus whoever else is on shift, plus the employer's share of taxes and contributions on that time.",
          "**Rent.** A café is a business that sells floor space by the hour and settles the bill in drinks. In an expensive city this can rival the wage bill.",
          "**Milk.** In a milk-based drink this is often larger than the coffee, because you are using two hundred millilitres of it and eight grams of beans.",
          "**Everything else that runs.** Electricity for a machine that stays hot all day, water, refrigeration, a dishwasher, waste collection, card processing fees, insurance, accounting.",
          "**Tax.** VAT or its local equivalent, at a rate that in several countries depends on whether you sit down.",
          "**The cup, lid and sleeve,** on a takeaway drink, which really can approach the cost of the coffee inside them.",
          "**Margin,** which on independent cafés is famously thin.",
        ],
      },
      {
        kind: "callout",
        heading: "So the price map falls out of the arithmetic",
        paragraphs: [
          "If the beans are a single-digit percentage of the price and the rest is local labour, local rent and local tax, then a cappuccino is barely a coffee product at all. It is a local services product with some coffee in it, and it gets priced like rent rather than like a commodity.",
        ],
      },
      {
        kind: "prose",
        heading: "The consequence for growers",
        paragraphs: [
          "Run the same arithmetic from the other end and it turns bleak.",
          "If the green coffee in a café drink is a few cents, the share reaching the person who grew it is smaller still. Between the farm gate and the roaster sit a cooperative or mill, an exporter, shipping, an importer, and the roaster's own costs and margin.",
          "This is the structural reason a boom in coffee prices does relatively little for smallholder incomes and a slump hurts them badly. The farm-gate price moves with the commodity market. The retail price barely notices the commodity market at all. The two ends of the chain are effectively in different industries, one of them a volatile global commodity business and the other a stable local hospitality business.",
          "It is also why certification schemes exist, why they focus on the farm-gate price specifically, and why arguments about them are so heated: the leverage point is a small number at the very start of a long chain.",
        ],
      },
      {
        kind: "prose",
        heading: "What actually moves a café price",
        paragraphs: [
          "Since coffee is not the driver, the things that do move the price of a cup are the things that move the cost of running a room with a person in it.",
          "A minimum wage rise moves it. A rent review moves it. An energy price shock moves it, both directly through the machine and indirectly through the milk. A change in the VAT treatment of hospitality moves it immediately and visibly. Hence the popularity of hospitality VAT cuts as an emergency measure, and the fact that the prices rarely come all the way back down afterwards.",
          "The green coffee price moves it late, partially, and mostly at the supermarket rather than the café, because a bag of beans on a shelf is a product where the coffee is most of what you are buying. This is the cleanest illustration of the tradable and non-tradable split you will find in a single aisle: the same commodity, sold two ways, one of which tracks the world price and one of which does not.",
        ],
      },
      {
        kind: "table",
        heading: "Two ways to buy the same beans",
        columns: ["", "Café cup", "Supermarket bag"],
        rows: [
          ["Coffee as a share of price", "Small", "Large"],
          ["Tracks the world coffee price", "Weakly", "Closely"],
          ["Tracks local wages and rent", "Closely", "Weakly"],
          ["Gap between rich and poor countries", "Very large", "Modest"],
        ],
      },
      {
        kind: "prose",
        heading: "How to use this when guessing",
        paragraphs: [
          "For any prepared drink or prepared food, ignore the ingredient entirely. You are estimating the cost of a few minutes of somebody's labour and a few minutes of a room's rent in that country, and then adding tax.",
          "For a packaged good on a shelf, do the opposite. Start from a world price, add freight, add the local tax, and adjust modestly for retail margin.",
          "Getting these two the right way round is worth more than any amount of memorised price data, and it is the single most common mistake people make in the first week of playing.",
        ],
      },
      {
        kind: "cta",
        heading: "A cappuccino day is a wage question",
        paragraphs: [
          "When the puzzle serves a cappuccino, do not think about coffee. Think about what twenty minutes of a barista's time and a table's worth of rent cost in that country.",
        ],
        buttonLabel: "Play today's puzzle",
      },
    ],
    sources: [
      {
        label: "International Coffee Organization: Coffee market reports",
        url: "https://icocoffee.org/coffee-market-reports/",
      },
      {
        label: "Fairtrade Foundation: Coffee farmers",
        url: "https://www.fairtrade.org.uk/farmers-and-workers/coffee/",
      },
      {
        label: "USDA Foreign Agricultural Service: Coffee: world markets and trade",
        url: "https://www.fas.usda.gov/data/coffee-world-markets-and-trade",
      },
      {
        label: "OECD: Purchasing power parities (PPP)",
        url: "https://www.oecd.org/en/data/indicators/purchasing-power-parities-ppp.html",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "vat-the-price-rise-nobody-argues-about",
    title: "A fifth of what you paid was tax, and you never saw the line",
    description:
      "Consumption tax is the largest single wedge between two countries' prices for an identical product, and the one shoppers are least able to see.",
    date: "2026-08-11",
    status: "published",
    readingMinutes: 7,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Two shopping cultures differ in a way that quietly explains a great deal of confusion.",
          "In most of the world, the price on the shelf is the price you pay, and the consumption tax is already inside it. In the United States, the price on the shelf is the price before tax, and the till adds it at the end.",
          "The second system makes the tax visible and annoying. The first makes it invisible and enormous. A European paying a fifth of every purchase in VAT sees no line for it anywhere, ever, unless they ask for a receipt and read the small print at the bottom.",
        ],
      },
      {
        kind: "prose",
        heading: "How large is enormous",
        paragraphs: [
          "Standard rates across the countries in this game span roughly **5 percent to 27 percent**. Two otherwise identical economies at opposite ends of that range would show a price difference of about a fifth on the same physical product with no difference in cost, wage, margin or freight.",
          "That is larger than the effect of most things people reach for first when explaining a price gap. It is larger than plausible differences in retail margin. It is usually larger than freight. On a packaged good shipped from the same factory, tax is frequently the biggest single term in the difference.",
        ],
      },
      {
        kind: "stats",
        items: [
          { value: "5%", label: "Lowest standard rate in the game" },
          { value: "27%", label: "Highest standard rate in the EU" },
          { value: "0%", label: "US federal consumption tax" },
        ],
      },
      {
        kind: "prose",
        heading: "The headline rate is the least interesting number",
        paragraphs: [
          "Where it gets genuinely strange is food, and food is most of what this game prices.",
          "Almost every country that charges VAT recognises that a flat tax on groceries falls hardest on the people with the least money, since poorer households spend a larger share of income on food. Almost every country responds differently.",
          "The United Kingdom and Ireland zero-rate most supermarket food outright. The tax is legally charged at nought percent, which differs from being exempt, and the difference matters a great deal to the retailer's paperwork. Mexico zero-rates food and medicine. Much of continental Europe applies a reduced band, commonly somewhere between 4 and 10 percent, with staples sometimes lower still. Several countries apply the full standard rate to groceries with no relief at all, on the argument that it is cleaner to tax everything and redistribute through the benefit system than to carve holes in the tax base.",
          "The upshot is that two countries with near-identical headline rates can tax a basket of groceries completely differently, and the headline rate on its own will mislead you.",
        ],
      },
      {
        kind: "callout",
        heading: "The reduced rate is where the lawyers live",
        paragraphs: [
          "Every country that taxes food at two rates has to define the boundary in statute, and every boundary drawn in statute eventually gets litigated. The famous British case turned on whether a particular snack was a cake or a biscuit, because the two were taxed differently, and it consumed genuine years of court time. There is a version of this argument in nearly every VAT jurisdiction on earth.",
        ],
      },
      {
        kind: "prose",
        heading: "Where you stand changes the tax",
        paragraphs: [
          "The other boundary that catches people out is prepared food.",
          "Japan's consumption tax charges a lower rate on food and non-alcoholic drink bought to take away than on the same items consumed on the premises. Several European countries make a similar distinction between restaurant service and food retail. The physical item is identical; the tax depends on a question the cashier has to ask you.",
          "This is not bureaucratic whimsy. The logic is that restaurant meals are a service and groceries are a necessity, and taxing them alike would either subsidise dining out or penalise cooking at home. Drawing that line in a way that survives contact with a coffee shop is simply difficult.",
          "It does mean that a cappuccino's tax rate can differ within a single country depending on where you drink it, so a price you saw once is not automatically the price.",
        ],
      },
      {
        kind: "prose",
        heading: "Why the US is the odd one out",
        paragraphs: [
          "The United States has no federal consumption tax at all. In its place sits a patchwork of state and local sales taxes: layered on top of each other, differing between neighbouring municipalities, and applied at the till rather than on the shelf.",
          "Most states exempt groceries, several tax them at a reduced rate, and a handful tax them fully. Which means there is no single American price for anything in this game, and any figure quoted as one is an average across a country whose tax treatment of food changes when you cross a county line.",
          "It also explains the culture shock in both directions. Americans abroad find that the price on the label is the price, which feels like a discount and is not. Europeans in America find that the price on the label is a fiction, which feels like a trick and is merely a different accounting convention.",
        ],
      },
      {
        kind: "list",
        heading: "Reading a price like a tax inspector",
        intro: "Four questions that will get you closer than a guess.",
        items: [
          "Is this a country with a consumption tax at all, or does it collect at the till instead?",
          "Is the item food? If so, the standard rate is probably irrelevant and the reduced or zero rate is what applies.",
          "Is the item prepared and served, rather than sold packaged? That often moves it back to a higher rate.",
          "Is the item one governments like to tax extra: fuel, alcohol, tobacco, sugary drinks? Excise duties sit on top of VAT, and they are frequently larger than it.",
        ],
      },
      {
        kind: "prose",
        heading: "Why the tax rate earns its place",
        paragraphs: [
          "Consumption tax is the most predictable component of a price. Wages you have to estimate. Rent you have to guess. Freight depends on a route you do not know.",
          "The tax rate is a published number, it is the same for everyone in the country, and it moves a shelf price by up to a quarter. Of everything on this list, it is the one term you can look up and be right about, which makes it the cheapest accuracy available to anyone trying to reason about a foreign price.",
          "That is why every country page on this site carries the country's rate and its treatment of food, sitting directly above the table it explains.",
        ],
      },
      {
        kind: "cta",
        heading: "Check the rate before you guess",
        paragraphs: [
          "Every country page here shows the local consumption tax and how it treats groceries. Look it up, then play the day's puzzle with a number rather than a hunch.",
        ],
        buttonLabel: "Play today's puzzle",
      },
    ],
    sources: [
      {
        label: "PwC: Worldwide Tax Summaries, VAT rates",
        url: "https://taxsummaries.pwc.com/quick-charts/value-added-tax-vat-rates",
      },
      {
        label: "Tax Foundation: VAT rates in Europe",
        url: "https://taxfoundation.org/data/all/eu/value-added-tax-2025-vat-rates-europe/",
      },
      {
        label: "European Commission: VAT rates",
        url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en",
      },
      {
        label: "OECD: Consumption Tax Trends",
        url: "https://www.oecd.org/en/publications/consumption-tax-trends_19990979.html",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "the-exchange-rate-you-see-is-not-the-one-you-pay",
    title: "The exchange rate you looked up is not the one you were charged",
    description:
      "Between the rate on your screen and the number on your statement sit three separate margins, one of which you are invited to accept by a card machine abroad.",
    date: "2026-08-13",
    status: "published",
    readingMinutes: 7,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Every price on this site is converted to dollars at a rate captured when the data was compiled. Be suspicious of what that conversion does and does not tell you, because there is no such thing as *the* exchange rate.",
          "There is a wholesale rate that almost nobody gets, and then there is a series of margins between it and you.",
        ],
      },
      {
        kind: "prose",
        heading: "The rate on your screen",
        paragraphs: [
          "The number a search engine gives you is the **mid-market rate**: the midpoint between what buyers are bidding and what sellers are asking in the wholesale currency market. It is the fairest single description of what a currency is worth, and it is not a price anyone is offering you.",
          "It is a midpoint, so by construction nobody trades at it. Institutions trading millions get close. You do not.",
        ],
      },
      {
        kind: "prose",
        heading: "Three margins between there and your statement",
        paragraphs: [
          "Spend abroad on a card and up to three separate charges can land on the same transaction.",
          "**The network's rate.** Visa and Mastercard each publish a daily conversion rate. It is close to mid-market but not identical, and it is set once for the day rather than moving with the market.",
          "**The issuer's foreign transaction fee.** Your own bank may add a percentage on top, historically around three percent, though the fee-free travel cards of the last decade have made this far less universal than it was.",
          "**Dynamic currency conversion.** This is the one to be angry about. It is the moment a foreign card terminal, or a foreign website at checkout, offers to charge you in your home currency instead of the local one. The offer is framed as a convenience, presented as certainty about the amount, and always phrased so that accepting is the path of least resistance.",
        ],
      },
      {
        kind: "callout",
        heading: "Always pay in the local currency",
        paragraphs: [
          "When the machine asks whether you want to be charged in your own currency, say no. Accepting hands the conversion to the merchant's payment processor, which sets its own rate and keeps the margin. Declining sends the transaction through in local currency and lets your card network convert it at a rate that is, for once, close to wholesale. The gap is routinely several percent, and it is entirely avoidable.",
        ],
      },
      {
        kind: "prose",
        heading: "Why the tourist rate is the worst one",
        paragraphs: [
          "Airport bureaux de change advertise \"no commission\", and the claim is usually true and entirely beside the point. The margin is in the rate, not in a fee. Compare the buy and sell rates on the board: the spread between them is the business model, and at an airport it can be very wide indeed.",
          "This is a general principle worth internalising. Whenever a currency service is free, the price is in the rate. Whenever it charges a visible fee, check whether the rate is closer to mid-market, because a transparent fee on a fair rate frequently beats a free service on a bad one.",
        ],
      },
      {
        kind: "prose",
        heading: "What this means for every table on this site",
        paragraphs: [
          "Three things, and they are the reason the methodology page says what it says.",
          "First, a dollar figure here is a **conversion, not a quote**. It says what the local price was worth at one moment at one rate. A traveller paying with a card would have paid a little more; a traveller changing cash at an airport, meaningfully more.",
          "Second, the conversion date matters more for some currencies than others. Between two stable currencies, a rate captured months ago is still roughly right. For a currency that has moved sharply, any single conversion is contestable and the local-currency column is the more honest number.",
          "Third, and most importantly, none of this affects the comparison that actually matters. The work-time column, which shows how long the average local wage takes to earn an item, never leaves the local currency: it is a local price divided by a local wage. The exchange rate cancels out entirely, so that column holds up when a currency is in motion.",
        ],
      },
      {
        kind: "list",
        heading: "Practical rules",
        ordered: false,
        items: [
          "Look up the mid-market rate to know what fair looks like, then expect to do slightly worse.",
          "Decline dynamic currency conversion every time, at terminals and at online checkouts alike.",
          "Compare a currency service's rate against mid-market rather than comparing advertised fees.",
          "Treat any single-day conversion of a volatile currency as an estimate with a wide error bar.",
          "When comparing two countries' living costs, prefer a measure where the exchange rate cancels out.",
        ],
      },
      {
        kind: "prose",
        heading: "The honest caveat",
        paragraphs: [
          "This is the part of the site's data that is least stable, and pretending otherwise would be dishonest. Prices in local currency change slowly, at the speed of shop shelves. Exchange rates change continuously, and for a handful of currencies they can move by tens of percent inside a year.",
          "So the local-currency figure ages gracefully and the dollar figure does not. Where the two disagree about whether a country has become more expensive, the local column is usually describing the country and the dollar column is usually describing the currency market. They are different subjects.",
        ],
      },
      {
        kind: "cta",
        heading: "Guess in the currency that means something",
        paragraphs: [
          "The game accepts guesses in dollars or euros, and every reference page shows the local-currency price beside the converted one. When a country's currency is moving, read the local column first.",
        ],
        buttonLabel: "Play today's puzzle",
      },
    ],
    sources: [
      {
        label: "Visa: Exchange rate calculator",
        url: "https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html",
      },
      {
        label: "Mastercard: Currency conversion tool",
        url: "https://www.mastercard.us/en-us/personal/get-support/convert-currency.html",
      },
      {
        label: "European Commission: Cross-border payments and currency conversion",
        url: "https://finance.ec.europa.eu/consumer-finance-and-payments/payment-services/cross-border-payments-and-currency-conversions_en",
      },
      {
        label: "Bank for International Settlements: Triennial FX survey",
        url: "https://www.bis.org/statistics/rpfx22.htm",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "shrinkflation-the-price-rise-in-the-packaging",
    title: "The price did not go up. The bag got smaller.",
    description:
      "Shrinkflation is a price rise disguised as a package redesign. Statisticians catch it, shoppers mostly do not, and there is a reason companies prefer it.",
    date: "2026-08-14",
    status: "published",
    readingMinutes: 7,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "You know the feeling before you can name it. The bag looks the same. The price is the same. Something is wrong with the bag.",
          "You are usually right. The chocolate bar lost a segment. The crisp packet holds more air. The tub of ice cream that was a litre is now nine hundred millilitres and has a subtly different base so it still fills the same space in the freezer.",
          "This is shrinkflation. That companies do it is the boring half. The interesting half is why they prefer it to raising the price, and what that preference reveals about how you actually shop.",
        ],
      },
      {
        kind: "prose",
        heading: "The reason it beats a price rise",
        paragraphs: [
          "Consider a manufacturer facing higher input costs who needs an extra ten percent of revenue per unit. Two options.",
          "Raise the price by ten percent. The number on the shelf label changes, and nothing in a shop is more visible than that. Shoppers notice immediately, price-comparison engines notice, competitors' labels sit right beside yours, and a segment of customers switch on the spot.",
          "Or cut the contents by ten percent and leave the price alone. Now the shelf label is unchanged. The only place the change appears is the net weight, printed small, in a unit most people are not converting in their heads while holding a basket.",
          "Both achieve the same revenue. Only one of them is legible at a glance. The research here is consistent, and unsurprising: people are markedly more sensitive to a change in price than to an equivalent change in quantity.",
        ],
      },
      {
        kind: "callout",
        heading: "Which makes it a rational response to how we shop",
        paragraphs: [
          "Shrinkflation is not a trick that works because shoppers are careless. It works because a price is a single number you have memorised and a net weight is an arithmetic problem you have to do. Nobody does arithmetic in an aisle.",
        ],
      },
      {
        kind: "prose",
        heading: "The inflation statistics do catch it",
        paragraphs: [
          "One belief worth correcting, because it circulates constantly: shrinkflation does not hide from the official inflation figures.",
          "National statistical agencies collect prices *and* package sizes. When a size changes, they apply a quantity adjustment, so that the index measures the price per unit rather than the price per pack. A bar that shrinks by a tenth at an unchanged price is recorded as a price rise of roughly a ninth. This is standard practice at every serious statistics office.",
          "So if you feel that official inflation understates your experience, shrinkflation is not the mechanism. The likelier explanations are duller. Your personal basket is weighted differently from the national one. Food and energy have risen faster than the all-items index, while occupying more of your budget than the average household's. Or you are comparing a receipt against a memory, and memories of prices sit years out of date.",
        ],
      },
      {
        kind: "prose",
        heading: "Its quieter cousins",
        paragraphs: [
          "Shrinkflation has two relatives that behave the same way and get discussed less.",
          "**Skimpflation** is the same manoeuvre applied to quality rather than quantity. The pack is the same size and the recipe is cheaper: less of the expensive ingredient, a cheaper oil, a substitution that survives most palates. Or, in services, the same price for a thinner version of the thing: fewer staff on the floor, a longer wait, a support line that has become a form.",
          "**Fee unbundling** takes something that used to be included and charges for it separately. The headline price falls or holds while the total paid rises. Airlines industrialised this, and it has since spread to hotels, ticketing, food delivery and banking.",
          "All three exist for the same reason. Each one moves cost from the number the customer compares to a number the customer does not.",
        ],
      },
      {
        kind: "list",
        heading: "How to see it",
        intro:
          "The defence is unglamorous and it works.",
        items: [
          "**Read the unit price, not the price.** Most supermarkets are required to display price per kilo, per litre or per hundred grams on the shelf label. It is the small line under the big one, and it is the only number on the label that permits comparison.",
          "**Compare by unit price across brands and pack sizes.** The larger pack is not reliably cheaper per unit; promotional pricing frequently reverses it.",
          "**Watch for a redesign.** A new pack shape or a refreshed logo on a familiar product is often the moment the contents changed, because the redesign is what stops you noticing the old pack beside it.",
          "**Check the net weight on things you buy weekly.** These are the products where a small change compounds across a year, and the ones whose old weight you have some chance of remembering.",
        ],
      },
      {
        kind: "prose",
        heading: "Why this site prices in fixed units",
        paragraphs: [
          "Every item in this game is quoted in a unit that cannot shrink. A litre of milk. A dozen eggs. A kilo of apples. One litre of fuel. A cup of coffee. One burger to a fixed specification.",
          "That is deliberate, and it is the only way a cross-country comparison survives contact with packaging. Countries do not agree on pack sizes; the standard bottle, carton and bag differ everywhere. A price per pack would compare a Japanese carton against an American gallon, then call the result a fact about milk.",
          "Normalising to a fixed unit costs some realism, because nobody buys exactly one kilo of apples. It buys something worth more: a number that means the same thing in every row of the table, and that will still mean the same thing when the packaging changes again.",
        ],
      },
      {
        kind: "cta",
        heading: "Guess in units that hold still",
        paragraphs: [
          "Every price in this game is quoted per litre, per dozen, per kilo or per serving, so the answer never depends on what a manufacturer decided a pack should be this year.",
        ],
        buttonLabel: "Play today's puzzle",
      },
    ],
    sources: [
      {
        label: "US Bureau of Labor Statistics: How the CPI handles quality and size changes",
        url: "https://www.bls.gov/cpi/quality-adjustment/",
      },
      {
        label: "UK Office for National Statistics: Shrinkflation research",
        url: "https://www.ons.gov.uk/economy/inflationandpriceindices",
      },
      {
        label: "Eurostat: Harmonised Index of Consumer Prices methodology",
        url: "https://ec.europa.eu/eurostat/web/hicp/methodology",
      },
      {
        label: "European Commission: Unit pricing rules for consumers",
        url: "https://commission.europa.eu/law/law-topic/consumer-protection-law_en",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "why-eggs-went-insane",
    title: "Eggs are the most honest price in the shop",
    description:
      "No brand, no marketing, barely any processing. When the egg price moves, something real happened to the birds, and everyone finds out at once.",
    date: "2026-08-15",
    status: "published",
    readingMinutes: 7,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Most things in a supermarket are insulated from their own cost. A branded cereal is mostly marketing, packaging and distribution, so a swing in the wheat price barely reaches the shelf. A chocolate bar can absorb a great deal of movement in the cocoa market before anyone notices.",
          "An egg has nowhere to hide. It is a commodity with almost no processing between the bird and the box, sold in a standard unit, largely undifferentiated by brand. It is also bought often enough that people remember what it used to cost.",
          "So when the egg price moves, it moves visibly, fast, and into the news.",
        ],
      },
      {
        kind: "prose",
        heading: "What actually sets it",
        paragraphs: [
          "Three things, in descending order of how much they move.",
          "**Feed.** A laying hen eats a diet dominated by corn and soy, both of which trade on world commodity markets. When grain prices spike, whether from drought, from an export disruption, or from demand for biofuel, the cost of every egg produced anywhere rises within months. This is the slow, grinding driver.",
          "**Disease.** Highly pathogenic avian influenza is the fast one. When it reaches a commercial flock, the standard response is to cull the entire flock, which can mean millions of birds from a single detection. Supply drops abruptly, and it cannot be restored quickly: a replacement pullet takes roughly four to five months to reach laying age, so the shortfall persists long after the outbreak is contained.",
          "**Energy and labour.** Barns are heated, ventilated, lit and cleaned; eggs are graded, packed and refrigerated in transit. These move the price less dramatically but they never stop.",
        ],
      },
      {
        kind: "callout",
        heading: "Why an outbreak takes so long to unwind",
        paragraphs: [
          "You cannot buy hens the way you buy stock. Between the decision to replace a flock and the first egg from it sit months of raising birds; every producer affected is trying to do it at the same time. That biological delay is why egg prices spike sharply and come down slowly.",
        ],
      },
      {
        kind: "prose",
        heading: "The recent history is a case study",
        paragraphs: [
          "The wave of highly pathogenic avian influenza that began in 2022 became the largest animal-health event in modern US poultry history, with tens of millions of birds culled across successive waves. Egg prices rose to levels with no recent precedent, fell back as flocks were rebuilt, then rose again on new detections.",
          "By early 2025 the average US retail price for a dozen large Grade A eggs had passed **six dollars**, a figure that would have read as a typo a few years earlier, and individual cities saw considerably worse. Europe and Japan saw their own outbreaks and their own spikes on their own timetables.",
          "Two details from that episode are worth keeping. The first is how completely local it was: the price of eggs in a country depends overwhelmingly on the health of that country's own flock, because eggs in shell are shipped internationally far less than most foods. The second is how quickly it became a political story, which is what happens to any staple that doubles in a year.",
        ],
      },
      {
        kind: "prose",
        heading: "Why the price differs between countries even in a calm year",
        paragraphs: [
          "Set the outbreaks aside and there is still a wide spread, and most of it is regulation.",
          "The European Union banned conventional battery cages from 2012, and several member states have gone further towards barn, free-range and organic systems. Cage-free systems require more space and more labour per bird, which raises the cost of production. That cost is real and it appears on the shelf.",
          "The United States runs a mix, with cage-free mandates in some states and conventional production elsewhere, so a national average is a blend of two rather different cost structures. Elsewhere the standards, and therefore the costs, differ again.",
          "There is also a genuine difference in what an egg *is*. Countries disagree about whether eggs are washed after laying. That answer determines whether they are refrigerated in the shop, how long they keep, and what the cold chain costs. A refrigerated egg and an unrefrigerated one are not quite the same product, and comparing their prices carries that caveat.",
        ],
      },
      {
        kind: "table",
        heading: "How fast each input reaches the shelf",
        columns: ["Driver", "Speed", "Size of effect"],
        rows: [
          ["Avian influenza outbreak", "Weeks", "Very large, temporary"],
          ["Feed grain prices", "Months", "Large, persistent"],
          ["Energy costs", "Months", "Moderate"],
          ["Housing regulation", "Years", "Moderate, permanent"],
        ],
      },
      {
        kind: "prose",
        heading: "What eggs teach about every other price",
        paragraphs: [
          "The lesson generalises, and it is the reason this item is in the game at all.",
          "The less processing and branding sits between a raw input and a shelf, the more faithfully the shelf reports what happened to the input. Eggs, milk and fuel are the honest items: their prices are close to their costs and they move when their costs move. A prepared drink, a branded snack, a restaurant meal: those are the insulated ones, where the input is a minor term, and the price mostly reports local wages and rent.",
          "So when you see a price move sharply, ask how thin the layer is between the field and the label before you ask anything about demand. That thinness decides whether a shock arrives at the till or gets absorbed on the way.",
        ],
      },
      {
        kind: "cta",
        heading: "Guess the honest items differently",
        paragraphs: [
          "On an egg or milk day, think about that country's own farms, its own flock and its own regulations. On a coffee or burger day, think about its wages. They are different questions with different answers.",
        ],
        buttonLabel: "Play today's puzzle",
      },
    ],
    sources: [
      {
        label: "USDA Economic Research Service: Poultry and eggs",
        url: "https://www.ers.usda.gov/topics/animal-products/poultry-eggs",
      },
      {
        label: "USDA APHIS: Avian influenza in commercial poultry",
        url: "https://www.aphis.usda.gov/livestock-poultry-disease/avian",
      },
      {
        label: "US Bureau of Labor Statistics: Consumer Price Index",
        url: "https://www.bls.gov/cpi/",
      },
      {
        label: "European Commission: Egg market situation",
        url: "https://agriculture.ec.europa.eu/farming/animal-products/eggs_en",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "how-to-compare-cost-of-living",
    title: "How to compare two countries without fooling yourself",
    description:
      "Cost-of-living comparisons go wrong in the same six ways every time. What follows is a method that survives contact with a real decision.",
    date: "2026-08-16",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "At some point most people run this comparison seriously: a job offer abroad, a move, a retirement, a decision about where a remote salary goes furthest.",
          "And most people run it badly, not through carelessness but because the obvious method is wrong in a way that is hard to see. This is the method that is not.",
        ],
      },
      {
        kind: "prose",
        heading: "Start by throwing away the index",
        paragraphs: [
          "Cost-of-living indices are the natural starting point and the worst one. They compress a country into a single number, and the compression is done using weights that describe an average household which is almost certainly not you.",
          "A typical index assigns a large share to housing, a large share to food, and smaller shares to transport, healthcare, education and everything else. If your circumstances differ from that profile in any significant way, and nearly everyone's do, the single number is describing a household you are not part of.",
          "Someone with school-age children in a country with expensive private schooling is in a completely different economy from a single person in the same city. So is someone who owns their home outright compared with someone renting. A single index number cannot represent both, and it does not try to.",
        ],
      },
      {
        kind: "callout",
        heading: "The only comparison that survives",
        paragraphs: [
          "Price **your** basket, not the average one. Write down what you actually spend money on in a month, then price that list in both places. It is more work than reading an index and it is the only method that produces an answer about you.",
        ],
      },
      {
        kind: "list",
        heading: "The six mistakes",
        intro:
          "In rough order of how much damage each one does.",
        items: [
          "**Converting at the market exchange rate.** It prices your salary as though you were spending it on imported goods. Most spending is local. Use a purchasing-power comparison for anything spent locally and the market rate only for money that crosses a border.",
          "**Comparing capital cities to countries.** Nearly all price anecdotes come from the most expensive city in each country, and national averages come from everywhere. Compare like with like or the answer is noise.",
          "**Forgetting what a salary already includes.** In one country a wage is take-home after healthcare, pension and childcare have been handled through taxes. In another the same nominal wage has to buy all three privately. These are not comparable numbers and no exchange rate will make them so.",
          "**Ignoring what you would stop buying.** A car is a large monthly cost that vanishes in a city with usable transport. Air conditioning is a large bill in one climate and nothing in another. Moves change the basket, not just its price.",
          "**Pricing the visit rather than the life.** Tourist prices are a different economy: hotel districts, restaurant meals, taxis. Residents shop in a country that visitors mostly never see.",
          "**Using one year's exchange rate as though it were permanent.** If your income and your costs are in different currencies, you have taken on currency risk; a comparison run at today's rate is a snapshot of a number that moves.",
        ],
      },
      {
        kind: "prose",
        heading: "A method that works",
        paragraphs: [
          "Five steps, in order. It takes an evening and it beats every index.",
          "**One: write down your actual month.** Not a budget you aspire to. Pull three months of statements and list what left the account, by category, with the amounts. Most people are surprised twice: once by a category they thought was small, and once by a category they had forgotten entirely.",
          "**Two: split the list into local and portable.** Rent, groceries, transport, services and utilities are local and will be repriced by the move. Subscriptions, debt payments, savings and anything denominated in a foreign currency are portable and will not.",
          "**Three: price the local half in both places.** Use rental listings for the specific area you would live in, supermarket prices for the things you actually eat, and local transport fares. Reference tables like the ones on this site are useful for a sanity check on a handful of comparable items; they are not a substitute for pricing your own list.",
          "**Four: compare net income, not gross.** Run both salaries through both tax systems, including social contributions, and account for what those contributions buy. A higher gross salary in a country where you must privately fund healthcare and retirement can be a lower real one.",
          "**Five: add the things that are not money.** Commute length, holiday entitlement, sick leave, notice periods, healthcare access, how far you would be from people you care about, and what happens to your position if the job ends. These do not convert into currency and they routinely dominate the decision anyway.",
        ],
      },
      {
        kind: "prose",
        heading: "What the work-time column is for",
        paragraphs: [
          "There is one comparison that is unusually robust, and it is the reason every country page here shows it.",
          "Take a price in local currency and divide it by a local wage. The result is how long someone has to work to buy the thing, and it has a property no dollar figure has: **the exchange rate cancels out**. It cannot be distorted by a currency swing, a conversion date or a bad rate at an airport.",
          "It is not a complete answer, because wage averages hide enormous dispersion and the average worker is a statistical construct. But as a way of asking whether a price is high *for the people who live there*, it beats every conversion, and it is frequently the column that reverses the ranking a dollar table gave you.",
        ],
      },
      {
        kind: "prose",
        heading: "The honest limits of this site",
        paragraphs: [
          "Worth saying plainly, since this is a page about not fooling yourself.",
          "The figures here are national averages of a small basket of everyday items, compiled from public sources and refreshed when those sources publish. They are good for building intuition, for noticing that a country you assumed was expensive is not, and for the specific question of how a handful of ordinary goods compare across borders.",
          "They are not a relocation calculator. They contain no housing costs, which will be the largest line in almost anyone's budget, no healthcare, no schooling and no tax modelling. Anyone making a real decision needs all four, and needs them for the specific city and circumstances rather than for a country.",
          "Use this to calibrate your intuition. Use your own statements, real rental listings and a tax calculator to make the decision.",
        ],
      },
      {
        kind: "cta",
        heading: "Start by finding out how wrong you are",
        paragraphs: [
          "The daily puzzle is a fast, blunt test of how well calibrated your sense of foreign prices actually is. Most people discover it is worse than they assumed, and discovering that is the useful part.",
        ],
        buttonLabel: "Play today's puzzle",
      },
    ],
    sources: [
      {
        label: "World Bank: International Comparison Program",
        url: "https://www.worldbank.org/en/programs/icp",
      },
      {
        label: "OECD: Purchasing power parities (PPP)",
        url: "https://www.oecd.org/en/data/indicators/purchasing-power-parities-ppp.html",
      },
      {
        label: "OECD: Taxing Wages",
        url: "https://www.oecd.org/en/publications/taxing-wages_20725124.html",
      },
      {
        label: "Eurostat: Household consumption expenditure",
        url: "https://ec.europa.eu/eurostat/web/household-budget-surveys",
      },
    ],
  },
];

/** Only articles that are actually written. Everything else stays unlisted. */
export const PUBLISHED_ARTICLES = ARTICLES.filter(
  (a) => a.status === "published" && a.body && a.body.length > 0
).sort((a, b) => b.date.localeCompare(a.date));

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** True when the article is finished and safe to index. */
export function isPublished(a: Article | undefined): boolean {
  return !!a && a.status === "published" && !!a.body && a.body.length > 0;
}

/**
 * Words in a rendered article, for the `wordCount` property of its schema.
 *
 * Counted from the blocks rather than typed in by hand, so it cannot drift away
 * from the piece it describes. Only reader-facing strings count: headings and
 * body copy yes, a table's column labels no, since those are chrome.
 */
export function countWords(blocks: ArticleBlock[]): number {
  const text: string[] = [];

  for (const b of blocks) {
    if ("heading" in b && b.heading) text.push(b.heading);
    switch (b.kind) {
      case "prose":
      case "callout":
      case "cta":
        text.push(...b.paragraphs);
        break;
      case "list":
        if (b.intro) text.push(b.intro);
        text.push(...b.items);
        break;
      case "table":
        if (b.intro) text.push(b.intro);
        if (b.caption) text.push(b.caption);
        text.push(...b.rows.flat());
        break;
      case "quote":
        text.push(b.text, b.attribution ?? "");
        break;
      case "stats":
        text.push(...b.items.map((i) => `${i.value} ${i.label}`));
        break;
    }
  }

  return text.join(" ").split(/\s+/).filter(Boolean).length;
}
