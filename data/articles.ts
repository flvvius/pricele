// Long-form guides.
//
// HOW THIS WORKS — read before writing:
//   Every article starts as `status: "draft"`. A draft is reachable by direct
//   URL but carries a noindex robots tag, is left out of the sitemap, and is not
//   listed on /blog. Nothing half-written is ever offered to a search engine or
//   an ad reviewer, which matters: a pile of empty pages is worse for a site's
//   standing than having no blog at all.
//
//   To publish one: fill in `body`, delete the `outline`, and flip `status` to
//   "published". That single change adds it to /blog, the sitemap and the index.
//   Nothing else to wire up.
//
//   The outlines are a plan, not filler — they never render on the page.
//
// COPY RULES:
//   Paragraph strings understand exactly two inline forms, **emphasis** and
//   [label](/path) — see lib/richtext.tsx. Emphasis is for the number or phrase
//   a reader should carry away from the paragraph, not for whole sentences.
//   Anything structural (a table, a pulled quote, a stat row) gets its own
//   block so components/ArticleBody.tsx can style it properly.
//
//   Every article ends with a `cta` block. These pieces all argue the same
//   thing — that knowing what things cost is a trainable skill — so each one
//   closes by pointing at the game where you train it.

/** A source the article draws on. Rendered as a list at the foot of the page. */
export interface ArticleSource {
  /** Publication, then what the piece is. Keep it short enough to scan. */
  label: string;
  url: string;
}

export type ArticleBlock =
  /** Body copy, optionally under a section heading. */
  | { kind: "prose"; heading?: string; paragraphs: string[] }
  /** Three or four display-size figures. One block per article at most. */
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
  /** First column is the row header; the rest are right-aligned figures. */
  | {
      kind: "table";
      heading?: string;
      intro?: string;
      caption?: string;
      columns: string[];
      rows: string[][];
    }
  | { kind: "quote"; text: string; attribution?: string }
  /** The paragraph the article would be pointless without. */
  | { kind: "callout"; heading?: string; paragraphs: string[] }
  /** Closing call to action. Always links to the game. */
  | { kind: "cta"; heading: string; paragraphs: string[]; buttonLabel: string };

export interface Article {
  slug: string;
  title: string;
  /** Meta description and the summary shown on /blog. Aim for 140-160 chars. */
  description: string;
  /** ISO date. Set it to the day you actually publish. */
  date: string;
  status: "draft" | "published";
  /** Roughly how long it takes to read, in minutes. Update when you write it. */
  readingMinutes: number;
  /** Notes to yourself. Never rendered. Delete once `body` is written. */
  outline?: string[];
  /** The article itself. Rendered in order. */
  body?: ArticleBlock[];
  sources?: ArticleSource[];
}

// Sources cited by more than one article. Defined once so a URL fix lands
// everywhere at the same time.
const S = {
  today1997: {
    label: "TODAY — 1997 grocery receipt price comparison goes viral",
    url: "https://www.today.com/food/groceries/1997-grocery-receipt-price-comparison-viral-video-rcna252816",
  },
  yahoo1997: {
    label:
      "Yahoo Creators — A viral grocery receipt from 1997 is breaking people's brains",
    url: "https://creators.yahoo.com/lifestyle/story/a-viral-grocery-receipt-from-1997-is-breaking-peoples-brains-053353452.html",
  },
  aol1997: {
    label: "AOL — 1997 grocery receipt stuns TikTok",
    url: "https://www.aol.com/articles/1997-grocery-receipt-stuns-tiktok-222438795.html",
  },
  marysue1997: {
    label: "The Mary Sue — Texas woman recreates a 1997 H-E-B grocery bill",
    url: "https://www.themarysue.com/texas-woman-recreates-a-1997-h-e-b-grocery-bill-with-122-items-heres-how-much-the-total-has-changed/",
  },
  aolMilk: {
    label: "AOL — Milk isn't $2 anymore",
    url: "https://www.aol.com/lifestyle/milk-isn-t-2-anymore-162025865.html",
  },
  mirror2006: {
    label: "The Mirror — Walmart shopper's 2006 grocery bill",
    url: "https://www.themirror.com/lifestyle/shopping/walmart-shopper-2006-grocery-bill-1846764",
  },
  statcan: {
    label: "Statistics Canada — Perceived versus measured inflation",
    url: "https://publications.gc.ca/collections/collection_2022/statcan/62f0014m/62f0014m2021017-eng.pdf",
  },
  europarl: {
    label: "European Parliament — Inflation perceptions across household groups",
    url: "https://www.europarl.europa.eu/RegData/etudes/STUD/2026/779873/ECTI_STU(2026)779873_EN.pdf",
  },
  moneyProgression: {
    label: "Money Progression — Personal inflation rate calculator",
    url: "https://moneyprogression.com/personal-inflation-rate-calculator/",
  },
  nnng: {
    label: "NNNG — Personal inflation calculator and category breakdown",
    url: "https://nnng.com/personal-inflation-calculator/",
  },
  finexus: {
    label: "Finexus — The things that got cheaper",
    url: "https://finexus.net/insights/bls/price-ep6-cheaper-20260321-170000.html",
  },
  techspot: {
    label: "TechSpot — TV prices have fallen more than 90% since 2000",
    url: "https://www.techspot.com/news/110875-tv-prices-have-fallen-more-than-90-since.html",
  },
  humanProgressEgg: {
    label: "HumanProgress — Eggs in perspective",
    url: "https://humanprogress.org/egg-perspective/",
  },
  humanProgressBlueCollar: {
    label:
      "HumanProgress — Falling food prices for blue-collar workers, 1919-2019",
    url: "https://humanprogress.org/falling-food-prices-for-blue-collar-workers-in-the-united-states-1919-2019/",
  },
  pooleyPerry: {
    label: "Gale Pooley — Time pricing Mark Perry's chart of the century",
    url: "https://galepooley.substack.com/p/time-pricing-mark-perrys-chart-of",
  },
  bigMac2026: {
    label: "Big Mac Index — 2026 complete breakdown",
    url: "https://bigmacindex.app/blog/big-mac-index-2026-complete-breakdown/",
  },
  bigMacIndex: {
    label: "Big Mac Index — country comparison tool",
    url: "https://bigmacindex.com/",
  },
  iphone3tej: {
    label: "3tej — Hours of work per iPhone, 2026, by country",
    url: "https://3tej.com/blog/hours-of-work-per-iphone-2026-by-country",
  },
  jemlit: {
    label: "Jemlit — Who can afford the iPhone most easily",
    url: "https://jemlit.com/blog/who-can-afford-the-iphone-easiest/",
  },
  wealthvieuTwoIncomes: {
    label: "WealthVieu — Why two incomes aren't enough",
    url: "https://wealthvieu.com/why-two-incomes-arent-enough/",
  },
  scottBurns: {
    label: "Scott Burns — The real change in family finances",
    url: "https://scottburns.com/the-real-change-in-family-finances/",
  },
  modernMoneyLife: {
    label: "Modern Money Life — Why two incomes still feel tight",
    url: "https://modernmoneylife.com/work/why-two-incomes-still-feel-tight.html",
  },
  longitude: {
    label: "Longitude Financial Planning — The two-income trap",
    url: "https://www.longitudefinancialplanning.com/blog/the-two-income-trap-how-dual-earners-became-an-economic-necessity-and-strategies-for-single-income-survival",
  },
  cnbcSingleIncome: {
    label: "CNBC — Single-income households in a six-figure economy",
    url: "https://www.cnbc.com/2025/12/11/single-income-households.html",
  },
  anchoringPmc: {
    label: "PMC — The anchoring effect: a review of the evidence",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8860899/",
  },
  referencePrice: {
    label: "Journal of Consumer Psychology — Internal reference prices",
    url: "https://myscp.onlinelibrary.wiley.com/doi/abs/10.1002/arcp.1093",
  },
  implicitPrice: {
    label: "Research review — Implicit price memory for routine purchases",
    url: "https://seekscholar.com/sites/default/files/reference%20price%201.pdf",
  },
  anchorsPersist: {
    label:
      "ResearchGate — Uninformative anchors have persistent effects on valuation",
    url: "https://www.researchgate.net/publication/330469173_Uninformative_Anchors_Have_Persistent_Effects_on_Valuation_Judgments",
  },
  coherentArbitrariness: {
    label: "SSRN — Coherent arbitrariness: anchors and willingness to pay",
    url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=383341",
  },
  scienceDirectFraming: {
    label:
      "Journal of Retailing — Reference-price framing and perceived fairness",
    url: "https://www.sciencedirect.com/science/article/abs/pii/S0022435903000538",
  },
  frontiers: {
    label: "Frontiers in Psychology — Price anchors and willingness to pay",
    url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1497372/full",
  },
} satisfies Record<string, ArticleSource>;

export const ARTICLES: Article[] = [
  // ---------------------------------------------------------------------------
  {
    slug: "1997-grocery-receipt-vs-today",
    title: "A grocery receipt from 1997 made millions of people furious",
    description:
      "122 items for $155 in 1997. The same cart today costs just over $500. Official inflation says it should be $312 — and that missing $190 is the whole story.",
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
          "Look at the corn dogs — the great equalizer of 90s childhood dinners, up nearly **six times**. Then look at the diapers, which is the line on that receipt you cannot skip, cannot substitute, and cannot “just budget better” around.",
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
          "Here's where I lose patience with the reflexive economics-brained response, the one that shows up under every viral receipt saying well, actually, prices rise over time, this is normal.",
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
          "When that receipt was printed in June 1997, the federal minimum wage was $4.75. Today it's $7.25 — an increase of **52 percent** against a grocery basket that went up **220**. To keep pace with that one cart of groceries, the minimum wage would need to be **$15.30 an hour**.",
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
          "This is why the receipt hit so hard. It isn't nostalgia. It's evidence. For years, an entire generation has been told the problem is personal: the lattes, the takeout, the avocado toast, the “just work harder” chorus. And then a piece of thermal paper from a baby book shows up and says, in fading ink: no. The math changed. You didn't.",
          "Dippel, a 24-year-old dental hygienist who says she's fortunate to be making ends meet herself, put it plainly after reading thousands of these stories: “It shouldn't be this hard to live. An entire generation is struggling to imagine buying a home, building savings or planning for the future.”",
          "She's right. And the fact that a grocery receipt had to say it, because decades of official statistics somehow didn't, tells you how wide the gap between the data and the dinner table has grown.",
        ],
      },
      {
        kind: "prose",
        heading: "This keeps happening, because the receipts keep surfacing",
        paragraphs: [
          "The 1997 receipt isn't even an isolated case. A few months earlier, a **2006 Walmart receipt** went viral on X: 79 items, $161.87, found in a late mother's belongings. The woman who posted it said it made her fall to her knees. That post pulled 7.4 million views, and internet sleuths re-priced the haul at well over $400 today — over a period in which real wages rose maybe 10 to 15 percent.",
          "“You can sit $160 worth of groceries in the front seat now,” one reply said.",
          "Every one of these receipts is a tiny time capsule, and every time one surfaces, millions of people have the same reaction: shock, then anger, then a strange relief. Because it's validating. It's proof that the squeeze you feel at the register is not a personal failure. It's arithmetic.",
        ],
      },
      {
        kind: "prose",
        heading: "So here's a question: how good is your price radar, really?",
        paragraphs: [
          "Here's the uncomfortable part, and I say this with love: most of us are terrible at prices. We anchor to whatever things cost when we first started paying attention, and we never update. It's why parents genuinely believe milk is still $2, and why a 23-year-old spending $350 a month on basic groceries gets lectured about lattes. Everyone is walking around with a mental price list that's five, ten, thirty years out of date.",
          "You just proved it to yourself, probably. Scroll back up. What did you guess for that 1997 cart? Were you within $50 of $500? Within $100?",
          "That gap between what you think things cost and what they actually cost is exactly the blind spot these viral receipts keep exposing. And it's trainable.",
        ],
      },
      {
        kind: "cta",
        heading: "Find out how far your price radar has drifted",
        paragraphs: [
          "Pricele is a one-minute daily game: one real item, you guess what it costs, you find out how close you landed. Fair warning — the first few days are humbling.",
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
        label: "Audacy — 20-year-old grocery bill sparks disbelief",
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
      "Someone is wrong about inflation, and it isn't your receipt. Four structural reasons the official number was never measuring your life in the first place.",
    date: "2026-06-21",
    status: "published",
    readingMinutes: 9,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "There's a moment everyone has had at the checkout in the last few years. The total flashes up, and your brain does a little stutter-step. That can't be right. You scan the cart looking for the wagyu you didn't buy, the truffle oil that must have fallen in. Nope. Eggs, bread, coffee, dish soap. Just groceries.",
          "Then you go home, turn on the news, and a very calm person tells you inflation is running at 3 percent. Under control. Cooling, even.",
          "Both of these things cannot be true. And I'm going to argue something that sounds conspiratorial but is actually just arithmetic: **the official number is not measuring your life**. It's measuring someone else's — an “average” person who does not exist, buying a basket of things you don't buy, with statistical adjustments you'd never agree to if anyone asked.",
          "Let me show you the receipts. Literally.",
        ],
      },
      {
        kind: "prose",
        heading: "The $190 hole",
        paragraphs: [
          "When a 1997 H-E-B grocery receipt went viral last year — 122 items for $155 — the internet did the obvious thing and re-bought the whole haul at today's prices. The new total: **just over $500**.",
          "Here's the part that matters. According to the Bureau of Labor Statistics' own inflation calculator, $155 in 1997 should equal about **$312** today.",
          "$312 is what inflation says happened. $500 is what actually happened. That's a **$190 hole per cart**, every cart, and one commenter nailed why it stings: “Adjusted for inflation $155 would be $312. The extra $192 needed is the problem.”",
          "So where did the $190 go? It didn't vanish. It's hiding in four places the official number is structurally bad at seeing.",
        ],
      },
      {
        kind: "prose",
        heading: "Hiding place 1: the shrinking package",
        paragraphs: [
          "Before you even get to price increases, there's the increase they don't print on the tag. The 500g pack becomes 450g. The six-pack becomes five. The chocolate bar quietly loses two squares. The shelf price barely moves, the index records almost nothing, and your actual cost per unit just jumped **9 to 16 percent**.",
          "Statisticians will tell you, correctly, that CPI tries to track price per unit. But shrinkflation works precisely because you don't compare unit prices; you compare the package to your memory of the package. A cereal box that drops from 18 oz to 15 oz at the same price is a **17 percent** per-ounce increase that doesn't feel like inflation at all.",
          "One analyst called shrinkflation “a tax on consumer attention,” and I can't improve on that. Consumer research estimates that shrinkflation and its uglier cousin skimpflation — same price, worse product — added roughly **2 to 4 percentage points** to the inflation real households experienced from 2021 to 2024, on top of the official figure.",
        ],
      },
      {
        kind: "prose",
        heading: "Hiding place 2: the statisticians assume you downgraded",
        paragraphs: [
          "Here's a methodological choice most people have never heard of, and it should make you angry. Official CPI builds in **substitution**: when beef gets expensive, the model assumes you rationally switch to chicken, so measured inflation gets adjusted downward — whether or not you actually switched, and whether or not a genuine substitute exists for your situation.",
          "Think about what that means. If you kept buying the food your family actually eats, the index quietly assumed you didn't, and marked your inflation lower for it. The cheaper flat two boroughs away is not a substitute for the flat near your kid's school. The methodology isn't fraud; it's a simplifying assumption. But it is, by design, a downward distortion of the price increases faced by anyone with real constraints.",
          "Same story with **hedonic adjustments**: if this year's product is judged higher-quality than last year's, part of its price increase is simply not counted as inflation. That's defensible for laptops. It's insulting for a chicken breast.",
        ],
      },
      {
        kind: "prose",
        heading: "Hiding place 3: the basket isn't your basket",
        paragraphs: [
          "CPI is a weighted average across a standardised basket for a hypothetical average urban consumer. Nobody is that consumer. If housing eats **45 percent** of your budget while the official basket weights it at **25**, and rents are rising fast, your real inflation runs well above the headline — and both numbers are technically true.",
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
          "Honesty requires this section, so here it is. Part of the perception gap runs the other way. Humans weight price increases far more heavily than decreases; when researchers built an index that trims out the steep price declines consumers mentally ignore, the gap between measured and perceived inflation **nearly vanished**.",
          "We also over-index on things we buy weekly — food, fuel — and under-index on things we buy rarely, the well-documented frequency bias. And once inflation grabs your attention, the attention sticks: perceptions stay elevated long after the actual rate falls.",
          "So no, CPI is not a conspiracy. It's a consistent, carefully defined statistical average, and its limitations come from the same standardisation that makes it useful.",
        ],
      },
      {
        kind: "callout",
        heading: "What the honest accounting actually adds up to",
        paragraphs: [
          "The statisticians' answer to “why doesn't the official number match my life?” is: because it was never measuring your life. It measures an average basket you don't buy, adjusted by substitutions you didn't make, for quality improvements you didn't ask for, with your biggest cost — housing — imputed rather than observed.",
          "Your receipt, meanwhile, measures exactly one thing with perfect accuracy: what it costs to be you. When the two disagree, the receipt isn't lying.",
        ],
      },
      {
        kind: "prose",
        heading: "The only inflation rate that matters is yours",
        paragraphs: [
          "Here's the practical takeaway, and it's more empowering than the doom-scroll version. Since no headline number describes your life, the only useful move is to actually know your own numbers. People who track their real category spending routinely discover their personal inflation rate sits **2 to 5 points** away from the official figure, in either direction.",
          "A renter with a new lease and a grocery-heavy budget is living in a different economy than a homeowner with a 2021 fixed rate — and both of them are living in a different economy than the evening news.",
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
        label: "Sadiq — Personal inflation rate vs headline CPI",
        url: "https://sadiqbd.com/blog/calculators/inflation/personal-inflation-rate-vs-headline-cpi",
      },
      S.nnng,
      {
        label: "Citrine Capital Advisors — Personal inflation vs CPI",
        url: "https://citrinecapitaladvisors.com/blog/personal-inflation-vs-cpi",
      },
      {
        label: "Fox Business — A tale of two economies",
        url: "https://www.foxbusiness.com/economy/square-circle-biden-tale-two-economies",
      },
      {
        label:
          "BLS Monthly Labor Review — A price index that matches perceptions of inflation",
        url: "https://www.bls.gov/opub/mlr/2016/beyond-bls/a-price-index-that-matches-perceptions-of-inflation.htm",
      },
      S.statcan,
      S.europarl,
      {
        label: "CEPR VoxEU — The perceived inflation wedge",
        url: "https://cepr.org/voxeu/columns/perceived-inflation-wedge-why-households-experience-inflation-differently-official",
      },
      {
        label: "MultiCalculators — How CPI is calculated",
        url: "https://multicalculators.com/how-cpi-is-calculated/",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "time-prices-work-hours-not-dollars",
    title: "Stop asking what things cost. Ask how long you work for them.",
    description:
      "In 1919 an egg cost 12 minutes of work. Today it costs 2.4 minutes, even at panic prices. Time prices are the true price of everything — and they cut both ways.",
    date: "2026-06-28",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Here's a bar-trivia question that will rewire how you think about every price you see for the rest of your life.",
          "In 1919, a dozen eggs cost 61 cents. Today they can hit $8 and beyond. So: **when were eggs more expensive?**",
          "If you answered “today,” congratulations, you've fallen for the oldest illusion in economics — the same one your grandfather falls for when he tells you a Coke used to cost a nickel. Because in 1919, an unskilled worker earned about 25 cents an hour, which means one egg cost roughly **12 minutes of work**. Today, at around $17 an hour, that same egg costs about **2.4 minutes**. Measured in the only currency you can never print more of, eggs are **80 percent cheaper** than in 1919, even at panic-headline prices.",
          "The nickel Coke is an even better trick. In 1900, a dime bought you a Hershey bar and a bottle of Coca-Cola, and it sounds like paradise until you learn wages were about 14 cents an hour. An ounce of chocolate cost over 21 minutes of work; today it costs about 1.25 minutes. An ounce of Coke went from 3.3 minutes to about 3.6 seconds.",
        ],
      },
      {
        kind: "callout",
        heading: "The one formula in this article",
        paragraphs: [
          "We buy things with money, but we pay for them with time. A **time price** is just the money price divided by your hourly earnings — hours and minutes of your life instead of dollars and cents.",
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
          "Run the time-price lens backwards and the past stops being the affordable golden age everyone's nostalgia insists on. Researchers priced a basket of 42 everyday food items — sirloin, eggs, oranges, bread — in 1919 and again in 2019, in hours of work.",
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
        heading: "So why don't you feel rich? (Here's where I annoy everyone)",
        paragraphs: [
          "If you've read this far you may be getting irritated, because this cheerful arithmetic seems to collide head-on with your bank account — and with those viral receipts showing groceries needing 79 percent more work-time than in 1997. Both things are true, and anyone who tells you only one of them is selling something.",
          "Here's the honest picture. Even over the recent, painful stretch from 2000 to 2024, US wages rose **123 percent** against an **87 percent** rise in overall prices, so the average consumption basket got about **19 percent cheaper in time**. Food, cars, clothing, furnishings: all up in dollars, all down in hours. The optimists are right about the burger, the eggs, and the TV.",
          "But the same analysis shows a handful of categories where the time price rose even after that 123 percent wage growth — and they happen to be the ones you cannot skip and cannot substitute: **the roof, the hospital, the childcare, the degree**. Housing, healthcare and childcare have consistently run far above headline inflation.",
          "So the modern deal is genuinely weird: the stuff of life has never cost less of your time, while the foundations of life have rarely cost more. You can furnish an apartment for a day's wages and spend half your income on the right to put the furniture somewhere.",
          "That's the fight worth having, and the time-price lens is what lets you have it honestly. The doomer who says everything is unaffordable is wrong about the eggs. The optimist who says you've never had it better is wrong about the rent. Precision beats vibes, and precision is measured in minutes of your life.",
        ],
      },
      {
        kind: "prose",
        heading: "The lens is free. Use it.",
        paragraphs: [
          "Here's what changes once you adopt it. Every price becomes a question with a real answer: **how many minutes of me is this?** A $6 latte at $30 an hour is 12 minutes — fine, that's a fair trade for joy. A $1,099 phone at the median Swiss wage is about two days of work; the same phone at the median Indian wage is closer to six months. Same object, wildly different bite out of a life. You'll never look at a “global” price tag the same way.",
          "And you'll start noticing how badly calibrated your own price instincts are, how much your brain still runs on the prices of whatever decade you first paid rent in. Mine certainly did.",
        ],
      },
      {
        kind: "cta",
        heading: "Then try the advanced version in your head",
        paragraphs: [
          "Pricele is a one-minute daily game where you guess what real things actually cost right now and find out how far off you are. Play it for a week and you'll feel the recalibration happen.",
          "Then go one step further: don't just guess the price, divide it by your wage. That number — the minutes — is what you're really paying.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      S.humanProgressEgg,
      {
        label: "HumanProgress — The good old days were really expensive",
        url: "https://humanprogress.org/the-good-old-days-were-really-expensive/",
      },
      {
        label: "Cato Institute — Time inequality is the world's real problem",
        url: "https://www.cato.org/commentary/time-inequality-worlds-real-problem-not-income-inequality",
      },
      {
        label: "Gale Pooley — Time pricing Big Macs around the world",
        url: "https://galepooley.substack.com/p/time-pricing-big-macs-around-the",
      },
      S.bigMac2026,
      {
        label: "UBS — Prices and Earnings report",
        url: "https://londonkoreanlinks.net/wp-content/uploads/2006/08/ubs-report-eng.pdf",
      },
      {
        label: "The Spokesman-Review — Tokyo tops Big Mac survey",
        url: "https://www.spokesman.com/stories/2006/aug/10/tokyo-tops-big-mac-survey/",
      },
      {
        label: "City-Cost — The cost of money in Tokyo",
        url: "https://www.city-cost.com/blogs/City-Cost/z4mLG-money_tokyo",
      },
      {
        label:
          "HumanProgress — Falling food prices for unskilled workers, 1919-2019",
        url: "https://humanprogress.org/falling-food-prices-for-unskilled-workers-in-the-united-states-1919-2019/",
      },
      S.humanProgressBlueCollar,
      S.pooleyPerry,
      S.marysue1997,
      S.nnng,
      {
        label: "AllTools — Personal inflation calculator",
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
          "A Swiss worker earns a base iPhone 17 in about **17 hours**, roughly two working days. An American needs around **21 hours**. An Indian worker on the average wage needs somewhere between **600 and 970 hours** depending on the study and the model — four to six months of full-time work. For the Pro Max, an average Egyptian worker needs roughly **266 working days**, most of a year.",
          "Same phone. Same Tim Cook. Somewhere between two days and one year of a human life.",
        ],
      },
      {
        kind: "prose",
        heading: "The rankings (find your country, feel your feelings)",
        paragraphs: [
          "Before you look: guess where your country lands. Not the price — the days of work for an average earner. Hold that number.",
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
          "A worker in Lisbon needs roughly six times as long as one in Zurich — same continent, and for much of it the same currency.",
      },
      {
        kind: "prose",
        paragraphs: [
          "Cross into Türkiye and the phone costs four months of average wages. This isn't a gadget affordability chart. It's an X-ray of the global wage ladder, and most of us have never seen our own rung this clearly.",
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
          "Part of this is genuinely not Apple: import duties, VAT, currency hedging, distribution costs. Governments in Ankara and New Delhi are co-authors of those price tags. But one analysis makes the uncomfortable observation that Apple's pricing is more dispersed than its competitors', and the dispersion runs inversely with median wages — premium pricing pointed at poor countries, which is the opposite of what cost-plus pricing would predict and tells you something about market power. When a product becomes a status symbol, the seller can charge the most exactly where it hurts the most. And does.",
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
          "Here's my actual thesis, and it's the reason this article exists. Nobody feels a Gini coefficient. Nobody has ever gasped at purchasing-power-parity-adjusted GDP per capita. But “you work two days for it, he works six months for it, and it's the same phone” lands in the chest, not the spreadsheet.",
          "The iPhone works as a measuring stick precisely because you know it. You've held one. You can feel what six months of commutes, alarms and shifts means, in a way you cannot feel a decimal point of GDP.",
          "That's also the humbling part. Because if you're reading this in a rich country, the iPhone index is a mirror with a caption: the thing you upgrade out of boredom is, for most working humans alive, a major capital purchase requiring months of saving. Not because they work less hard. Because of where the ladder happened to put them.",
        ],
      },
      {
        kind: "prose",
        heading: "One last question before you go",
        paragraphs: [
          "You just spent five minutes reading about what an iPhone costs in 25 countries. Quick test: what does a litre of milk cost in your supermarket, right now, this week? A dozen eggs? The exact phone in your pocket, today — not when you bought it?",
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
          "ShiftDelete — How many days you need to work to buy an iPhone 17 Pro Max",
        url: "https://en.shiftdelete.net/how-many-days-you-need-to-work-to-buy-iphone-17-pro-max/",
      },
      {
        label:
          "Letem Světem Applem — iPhone 17 Pro: three days of work somewhere, 160 elsewhere",
        url: "https://www.letemsvetemapplem.eu/en/2026/03/05/na-iphone-17-pro-staci-nekde-3-dny-prace-jinde-160-tohle-je-realita-dnesniho-sveta/",
      },
      {
        label:
          "Digital Information World — For millions, the iPhone 17 costs months of work",
        url: "https://www.digitalinformationworld.com/2025/09/for-millions-apples-iphone-17-costs-not-just-money-but-months-of-work.html",
      },
      {
        label:
          "The Mors — How long you work in different countries to buy an iPhone 17",
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
      "Yours buys rent. Same salary, one generation apart, wildly different lives — here is the line-by-line forensics of where the money actually went.",
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
          "Start with the biggest line item on any family's ledger. In 1970, the median American home cost $24,000 against a median income of $9,870: a ratio of **2.4 years** of income. By 1990 it was 2.6. Today it's roughly **5.6** — a $420,000 home against $75,000. In many major markets the mortgage-to-income ratio has gone from three-to-four times income fifty years ago to **eight-to-ten times** today.",
          "Since 2000 alone, median home prices have outpaced median household income growth nearly two to one: **177 percent** against **92**.",
          "Here's the detail that should end the “your generation just wants luxury” argument forever: the houses barely changed. The median owner-occupied home grew from 5.7 rooms in 1975 to 6.1 by the late 1990s — less than half a room, probably a second bathroom. Your parents' generation isn't living in smaller houses than you aspire to. They're living in the same houses. **The house didn't get better. It got repriced.**",
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
          "Here's the cruellest mechanism, documented by Elizabeth Warren and Amelia Warren Tyagi before Warren was a senator. When the second earner became normal, the market simply repriced everything around two paychecks. Housing absorbed the second income: mortgages and rents rose to what two salaries could bid, especially in the school-district bidding wars.",
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
          "And University of Chicago research found the real story isn't between generations but within them: the average millennial has 30 percent less wealth at 35 than boomers did, yet the richest tenth of millennials has 20 percent more than the richest boomers did, while millennials with typical working-class trajectories did no better — and sometimes worse — than their parents' equivalents.",
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
          "Here's my actual advice, and it's not financial. Show this to your parents. Not as an accusation — as a translation. Because most of the generational sniping (the avocado toast, the lazy kids, the boomers had it easy) comes from two groups of people arguing from price lists that are decades apart.",
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
        label: "Yahoo Finance — Why two-income families still struggle",
        url: "https://finance.yahoo.com/economy/articles/why-two-income-families-still-150031632.html",
      },
      {
        label:
          "Institute for Family Studies — Can your family survive on one income?",
        url: "https://ifstudies.org/blog/can-your-family-survive-on-one-income-public-policy-should-do-more-to-help-",
      },
      S.scottBurns,
      S.longitude,
      {
        label: "WealthVieu — Real wage growth by category",
        url: "https://wealthvieu.com/personal-finance/income/real-wage-growth/",
      },
      S.modernMoneyLife,
      {
        label: "PNW Independent — The nostalgia trap",
        url: "https://pnwindependent.com/the-nostalgia-trap-why-the-single-income-era-was-a-historical-fluke-and-why-youre-lucky-to-live-now/",
      },
      S.cnbcSingleIncome,
      {
        label: "LendingTree — Millennials' financial condition study",
        url: "https://www.lendingtree.com/debt-consolidation/millennials-financial-condition-study/",
      },
      {
        label: "Fortune — High-status millennials versus boomers on wealth",
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
          "Here's the thing that makes this story interesting instead of just another generational spat: the parents aren't lying, and they aren't stupid. They're running outdated software. And before you feel smug about it, so are you. So am I.",
          "Every single one of us is walking around with a mental price list that stopped updating years ago. Today I want to show you exactly how that list gets written, why it freezes, and how to tell whose is more wrong at your next family dinner.",
        ],
      },
      {
        kind: "prose",
        heading: "Your brain writes prices in permanent marker",
        paragraphs: [
          "Psychologists have a name for the price you carry in your head: the **internal reference price**, the number you drag out of memory to judge whether today's shelf price is fair or an outrage. Every time you see $4.89 on the milk, your brain isn't evaluating $4.89. It's comparing it to a ghost — some half-remembered milk price from the era when you first started paying attention.",
          "And that ghost is stubborn. The anchoring effect, first documented by Tversky and Kahneman, is one of the most robust biases in all of human decision-making: the first number you absorb acts, in the researchers' words, like an anchor dropped into the deep sea, fixing your mind and dragging every later judgment toward it.",
          "It works even when the anchor is meaningless. In famous experiments, people's willingness to pay for products was swayed by the last digits of their own social security number. And it doesn't wash out: studies tracking people over time found that a single arbitrary anchor still bent their valuations **eight weeks later**, as if the number had been imprinted.",
          "Now consider what that means for prices you encountered not eight weeks ago but eight thousand times, at an impressionable age, when money was new and every purchase stung. The prices of your first independent years — first rent, first tank of gas, first solo grocery run — aren't memories. They're the factory settings.",
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
          "**The update is asymmetric.** Consumers weight price increases far more heavily than decreases when forming their sense of inflation; when researchers built an index excluding the price drops people mentally ignore, the gap between perceived and actual inflation nearly disappeared. So the list doesn't just lag — it lags angrily, cataloguing every insult and forgetting every discount.",
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
          "Official data sides with the kid on this one — a few hundred dollars a month for a nutritious home-cooked diet is baseline USDA math now, not extravagance. But here's the twist worth being honest about: on other items, the kid's list is broken too. Young people who've never bought diapers, or a water heater, or car insurance in their own name routinely lowball those by half.",
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
          "Here's the optimistic ending. Unlike most cognitive biases, this one has a straightforward fix: **feedback**. Guess a price, see the real one, feel the gap, repeat. Your internal reference prices are learned from exposure, so deliberate exposure retrains them. The gasp when you're wrong is the update installing.",
        ],
      },
      {
        kind: "cta",
        heading:
          "Turn the world's most repetitive family argument into a scoreboard",
        paragraphs: [
          "Pricele is a one-minute daily game where you guess what a real item costs right now and get scored on how close you land. Play it solo to fix your own list — or, and I genuinely recommend this, play it against your parents.",
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
      "The countries where $2,000 buys a $6,000 life — plus the two traps the geoarbitrage videos never mention, including the one where you become the price rise.",
    date: "2026-07-26",
    status: "published",
    readingMinutes: 8,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "Your money has a passport, and it's worth different amounts depending on where it lands. Not slightly different. Absurdly different.",
          "The cleanest way to see it is the burger. The same $10 buys nearly **five Big Macs** in South Africa and **fewer than two** in Switzerland. Six of the ten cheapest Big Macs on Earth are in Asia; Switzerland's is 38 percent dearer than America's, the highest premium among 54 countries tracked.",
          "Economists have a duller name for this — purchasing power parity — and a sharper metric buried inside World Bank data: the **price level ratio**, which tells you what a dollar actually buys on the ground. Vietnam's sits around **0.30** against the United States, meaning the same basket of goods and services costs roughly 30 cents on the dollar.",
          "Read that as a plain sentence: there are functioning, beautiful, fast-wifi countries where existence is 70 percent off.",
        ],
      },
      {
        kind: "prose",
        heading: "The arithmetic that makes people quit their leases",
        paragraphs: [
          "This is why geoarbitrage went from finance-blog jargon to a life strategy. Earn in a strong-currency job, spend in a low-price-level country, and the gap becomes your savings rate.",
          "The numbers are genuinely startling. A remote worker keeping a US salary while living in Chiang Mai on about $1,300 a month can hit an **84 percent savings rate**; the extra $32,400 a year, compounding at 7 percent, grows to over **$450,000 in a decade**. A software engineer clearing $78,000 after tax saves maybe $33,000 a year in New York and **$66,000 in Thailand** — double, for the same job.",
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
          "Here's what the YouTube thumbnails leave out. The advertised paradise budget assumes **local** prices, and short-term visitors mostly don't get them. One Canadian writer who tried trading Toronto rent for São Paulo ended up on Airbnb paying more than double the neighbourhood's average rent, “not far off from the typical cost of a Toronto apartment.” The markup is systematic: in Mexico City, the median one-bedroom Airbnb runs about **66 percent above** average local rent.",
          "The $500-a-month luxury life you've seen advertised is usually describing the rent line of someone with a year-long local lease, a local SIM and local shopping habits. Real comfortable budgets start around **$1,000** in even the cheapest hubs — before you add flights home, visa runs ($480-720 a year in Vietnam, which still has no nomad visa), international health insurance at $200-400 a month, and the productivity tax of moving constantly.",
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
          "Viral grocery receipts, the two-income trap, the “how does that make sense” comments — that's what it feels like when prices decouple from local wages. Geoarbitrage is you being on the winning side of that same decoupling.",
          "It doesn't mean don't go. It means go like a guest: long leases over Airbnb, local businesses over expat bubbles, secondary cities over the three neighbourhoods every YouTuber colonises, and learn the language of the place subsidising your savings rate. Rural Thailand at $800-1,000 a month for a couple is both cheaper and lighter-footprint than fighting locals for central Bangkok.",
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
        label: "BrightCurios — Vietnam's price level ratio",
        url: "https://brightcurios.com/vietnam-usd-cheat-code-price-level-ratio/",
      },
      {
        label: "GetWhereNext — Geo-arbitrage and early retirement abroad",
        url: "https://getwherenext.com/blog/geo-arbitrage-retire-early-abroad",
      },
      {
        label: "EarnifyHub — Geographic arbitrage and remote work, 2026",
        url: "https://earnifyhub.com/blog/remote-work/geographic-arbitrage-remote-work-2026",
      },
      {
        label: "CashFlowAbroad — Geographic arbitrage playbook, 10 countries",
        url: "https://cashflowabroad.com/geographic-arbitrage-playbook-10-countries",
      },
      {
        label: "WorldRankd — Countries where the dollar buys most, 2026",
        url: "https://www.worldrankd.com/budget-living/countries-where-dollar-buys-most-2026",
      },
      {
        label: "GetWhereNext — Best countries to retire on $2,000 a month",
        url: "https://getwherenext.com/blog/best-countries-retire-2000-month",
      },
      {
        label: "The Margin — The real cost of the digital nomad life",
        url: "https://themargin.news/digital-nomad-cost",
      },
      {
        label: "AlwaysIM — Strategic geo-arbitrage for bootstrapped founders",
        url: "https://blog.alwaysim.com/strategic-geo-arbitrage-for-bootstrapped-founders-the-2026-p-2026",
      },
      {
        label: "GaminTraveler — The backlash against Americans in Lisbon",
        url: "https://www.gamintraveler.com/2026/05/10/the-backlash-against-americans-in-lisbon-what-went-wrong/",
      },
      {
        label:
          "Euronews — Digital nomads flock to Mexico City, locals face rising rents",
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
      "TVs fell 98%. Light fell 500,000-fold. Batteries fell 99%. Here is why the price collapses went uncelebrated — and why you still feel poorer anyway.",
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
          "An analysis of 25 years of Black Friday ads found TV prices down more than 90 percent since 2000 — before even adjusting for the fact that screens quadrupled in size and resolution. The official quality-adjusted CPI index for televisions fell **98.5 percent** since 1996; no other item in the entire index comes close.",
          "Imagine the reverse headline. “TVs up 4,000 percent” would be civilizational news. The actual story got zero riots, zero congressional hearings, zero viral receipts. **Deflation is the tree that falls silently in the forest.**",
        ],
      },
      {
        kind: "prose",
        heading: "Light: the most beautiful price chart in human history",
        paragraphs: [
          "Here's my favourite price of all time. In the 1700s, George Washington calculated that burning one good candle five hours a night for a year would cost him the equivalent of over **$1,000 today**.",
          "Economist William Nordhaus reconstructed the full arc: a 60-hour week of hard labour bought about **54 minutes** of quality light in the deep past; by 1990, **ten years** of light; today, around **52 years**. In the UK's long-run data, a million lumen-hours cost about £34,000 in the 1300s (in 2000 prices) and £2.15 by 2023 — a 16,000-fold decline.",
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
          "Batteries and solar follow learning curves: every doubling of cumulative production cuts prices roughly 18 to 20 percent — thousands of small improvements compounding, no single breakthrough.",
          "Now list what didn't collapse: **housing, healthcare, childcare, education**. They share the opposite signature: local, labour-intensive, supply-constrained and heavily gatekept. You can't manufacture an apartment in Shenzhen and ship it to Toronto. Regulation is part of the story — one industry estimate puts government-imposed costs at roughly 24 percent of a new US single-family home's price — though how much weight to give regulation versus land scarcity, labour costs and demand is genuinely contested territory, and anyone who tells you it's all one villain is selling a politics, not an analysis.",
          "The honest summary: we got spectacularly good at making **things** cheap, and we remain terrible at making **places and care** cheap. Same economy, two opposite curves.",
        ],
      },
      {
        kind: "callout",
        heading:
          "So why do you feel poorer? Because the discount went to the optional stuff",
        paragraphs: [
          "The stuff that collapsed in price is mostly the stuff you can skip or stretch: the TV you replace every decade, the clothes, the gadgets, the lumens. The stuff that exploded is the stuff you cannot skip this month: the rent, the premium, the daycare.",
          "Your brain compounds the injury. People systematically over-weight price increases and mentally discard decreases when forming their sense of inflation — and you buy groceries 52 times a year but a TV once, so frequency bias buries the good news.",
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "So the optimist is right that your ancestors would weep at your abundance: 52 years of light for a week's wages, a supercomputer in your pocket, strawberries in January. And the doomer is right that the entry tickets to a stable adult life have inflated beyond an ordinary wage.",
          "Neither is lying. They're describing the two halves of the same weird economy, and the argument between them — the one currently detonating in every family group chat — is really an argument about which half you're forced to buy more of.",
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
          "Pricele is a once-a-day ritual: one real item, you guess its price, you learn whether your mental number is stale. Most people discover they've been overestimating the collapsed stuff and underestimating the exploded stuff — exactly the distortion this article is about.",
          "The age you live in gives you 52 years of light for a week's work and charges you a fortune for a roof. One minute a day fixes the part you can control.",
        ],
        buttonLabel: "Play today's Pricele",
      },
    ],
    sources: [
      {
        label:
          "Progressive Policy Institute — The price of a 40-inch TV has fallen 99% in 25 years",
        url: "https://www.progressivepolicy.org/ppis-trade-fact-of-the-week-the-price-of-a-40-inch-tv-set-has-fallen-by-99-in-25-years/",
      },
      {
        label: "SlashGear — How TVs became so cheap",
        url: "https://www.slashgear.com/1841280/ow-tvs-become-so-cheap/",
      },
      S.finexus,
      S.techspot,
      {
        label: "Construction Physics — How did TVs get so cheap?",
        url: "https://www.construction-physics.com/p/how-did-tvs-get-so-cheap",
      },
      {
        label: "BBC — How the price of light collapsed",
        url: "https://www.bbc.com/news/business-38650976",
      },
      {
        label:
          "Our World in Data — Light at night, and the price of lighting since 1300",
        url: "https://ourworldindata.org/light-at-night?insight=the-price-of-lighting-has-fallen-by-more-than-99-9-since-1300",
      },
      {
        label: "Our World in Data — Battery price decline",
        url: "https://ourworldindata.org/battery-price-decline",
      },
      {
        label: "The Planet Mag — The physics behind the battery cost collapse",
        url: "https://theplanetmag.com/grid-scale-battery-storage-is-scaling-faster-than-solar-did-here-is-the-physics-behind-the-cost-collapse/",
      },
      {
        label: "Independent Institute — Why televisions have become so cheap",
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
          "There's a specific kind of silence that happens at kitchen tables now. It's the end of the month. Two adults, two jobs, two incomes, sometimes two degrees. The spreadsheet is open. And the number at the bottom — after nothing extravagant has happened, no holiday, no disaster, no avocado-related indiscretions — is close to zero.",
          "The first reaction is always private shame: **we must be doing something wrong.** So before anything else, let's run the actual numbers, because the most useful thing anyone can tell that couple is that the spreadsheet isn't lying and neither are they.",
        ],
      },
      {
        kind: "table",
        heading: "The autopsy",
        intro:
          "A representative dual-income American household earning **$120,000** — a sum that still sounds like wealth to anyone who formed their price instincts before 2015:",
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
          "Notice what's missing from the table: waste. There is no line to cut that fixes this. The four biggest items — taxes, housing, childcare, transport — are the price of being able to go to work at all.",
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
          "The one-earner family of the past had a built-in shock absorber: if disaster struck the breadwinner, the second adult could enter the workforce. Today's family has already spent that reserve. Both adults work, the mortgage was approved against both salaries, and so a single job loss doesn't halve the safety margin — it deletes it.",
          "The two-earner family faces roughly **double** the annual probability of experiencing a job loss, precisely because there are two jobs to lose and no backup earner left to deploy.",
        ],
      },
      {
        kind: "prose",
        paragraphs: [
          "That's what the kitchen-table silence is actually about. Not the $350. The knowledge that the whole structure is load-bearing everywhere, and one bad quarter — one diagnosis, one restructuring email — brings it down. Two incomes was supposed to mean security. It turned out to mean two points of failure and zero slack, and everyone living inside that math feels it in their sleep.",
          "So no, the fix is not a budgeting app's cheerful suggestion to cancel a streaming service. The serious personal responses all attack the fixed lines — housing costs, car count, debt, location. The serious collective responses are about supply and support: more homes, cheaper childcare, benefits pegged to what essentials actually cost, as the Trussell Trust argues with its Essentials Guarantee campaign. Anything else is rearranging the $350.",
        ],
      },
      {
        kind: "prose",
        heading: "Talk about the numbers out loud",
        paragraphs: [
          "One more thing, and it's the reason stories like K's video and Andrew's interview matter beyond sympathy. Every family at that silent kitchen table believes it is uniquely failing, because nobody publishes their budget.",
          "The moment someone does — a Sydney mum on camera, a receipt on TikTok, a Reddit post about $350 groceries — thousands of replies say the same thing: oh thank god, it's not just us. **Shame survives in the dark and dies in the comparison.** The single most financially healthy thing most couples could do this month is show one trusted friend their real numbers, and look at theirs.",
        ],
      },
      {
        kind: "cta",
        heading: "A gentler on-ramp to talking about money out loud",
        paragraphs: [
          "Pricele is a one-minute daily game where you guess what real things cost right now — groceries, bills, the stuff of this article — and see how close you land. Couples tell me it's oddly disarming: arguing about whether daycare costs $1,400 or $2,000 a month is easier when it's a quiz.",
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
        label: "Zarnyxys — Sydney mum on Australia's cost-of-living crisis",
        url: "https://zarnyxys.com/article/sydney-mum-exposes-brutal-cost-of-living-crisis-in-australia-rising-prices-mortgages-fuel-costs",
      },
      {
        label: "Brisbane Times — “I'm just trying to live”",
        url: "https://www.brisbanetimes.com.au/national/i-m-just-trying-to-live-young-aussie-mum-describes-heartbreaking-reality-of-inflation-20260730-p60k4h.html",
      },
      {
        label:
          "The Business Times — “I live off scraps from my little girl's plate”",
        url: "https://thebusinesstimes.co.uk/i-live-off-scraps-from-my-little-girls-plate-heres-my-message-to-andy-burnham/",
      },
      {
        label: "UltraJoyPlay — Manchester mum: “I can't afford to live”",
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
      "Ten questions, real answers, no partial credit for vibes. Then the four documented reasons everybody fails — and the one-minute habit that fixes it.",
    date: "2026-08-02",
    status: "published",
    readingMinutes: 7,
    body: [
      {
        kind: "prose",
        paragraphs: [
          "You have opinions about prices. Strong ones. You've muttered at a checkout screen this month. You have a firm position on whether groceries are outrageous, whether rent is insane, whether everything costs double now.",
          "Here's my uncomfortable question: **when did you last check whether your numbers are right?**",
          "Because here's the secret the entire inflation debate is built on: almost nobody actually knows what things cost. We know what things used to cost, when we first started paying attention, and we've been arguing from that ghost ledger ever since.",
          "Today, instead of another opinion, I'm offering a mirror. Ten questions. Write your guesses down — actual numbers — before scrolling to the answers. No partial credit for vibes.",
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
          "**The iPhone in India (8):** ₹125,900 for a 256GB Pro, roughly **$1,517** — a 38 percent premium over the US price, in a country where the median formal worker earns about $385 a month. Nearly everyone guesses that poorer countries pay less. The opposite is true, and that single wrong assumption distorts how people reason about global inequality.",
          "**The 1997 cart (9):** about **$500**, not the ~$312 the official inflation calculator predicts. If you guessed near $312, congratulations, you know the statistics; if you guessed near $500, you know the store. The gap between those two answers is the entire cost-of-living debate in one number.",
          "**The TV (5):** **under $300**. Most people guess $600-1,000, because their TV anchor was installed decades ago and TVs are the rare item that collapsed — down 90-plus percent since 2000. Price blindness runs in both directions: we overestimate the collapsed stuff and underestimate the exploded stuff.",
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
          "**Your anchors are ancient.** The first prices you absorbed act as anchors that drag every later judgment toward them; the effect is among the most robust in psychology and persists for weeks even when the anchor is meaningless, like digits of your own social security number. Your first rent, your first tank of gas — those aren't memories, they're calibration errors with tenure.",
          "**You only file the increases.** People weight rising prices far more than falling ones; strip the ignored price declines out of the index and the gap between perceived and actual inflation almost disappears. Your internal ledger is an outrage diary, not an accounting document.",
          "**The shelf is gaslighting you.** Retailers actively supply fake reference points — the eternal “was $89.99, now $49.99” — because externally supplied anchors measurably bend what you'll judge as fair and what you'll pay. Meanwhile shrinkflation, “a tax on consumer attention,” harvests the gap between the package and your memory of the package.",
        ],
      },
      {
        kind: "prose",
        heading: "Why it's worth fixing",
        paragraphs: [
          "This isn't trivia. A miscalibrated price sense costs you money and judgment in specific, compounding ways.",
          "You can't spot a genuinely good deal, because “50% off” only means something relative to a true price you don't know. You can't detect shrinkflation without a unit-price instinct. You can't budget accurately with a mental ledger that logs increases and deletes decreases. You can't negotiate salary sensibly without knowing what your cost of living actually did this year, as opposed to what the headline says the average person's did.",
          "And, maybe most corrosive of all, you can't argue fairly — with your parents, your partner, or the internet — when both sides are quoting numbers from different decades.",
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
          "If the test stung, good — that's fixable. Come play tomorrow's round, and bring someone whose price list is even older than yours.",
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
