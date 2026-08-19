import { ITEMS } from "@/data/items";
import { COUNTRIES } from "@/lib/catalog";
import { PUBLISHED_ARTICLES } from "@/data/articles";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";

/**
 * `/llms.txt`: a plain-text map of the site for anything reading it as an agent
 * rather than as a browser.
 *
 * Be clear-eyed about what this is worth. As of 2026 no major model provider
 * has committed to reading llms.txt in production, Google has explicitly said
 * it is not used for AI Overviews or AI Mode, and a crawl of 137,000 sites
 * found 97% of these files were fetched by nobody at all. It is not the reason
 * a site gets recommended, and anyone shipping it expecting that is going to be
 * disappointed.
 *
 * It is here anyway for two narrower reasons. Anthropic does recommend it for
 * agent-facing content, so the one crawler most likely to want it is asking for
 * it. And the cost is a single generated route with no maintenance: it is built
 * from the same data the pages are, so it cannot drift out of date the way a
 * hand-written one would. Cheap insurance against a convention that may or may
 * not get adopted — not a strategy.
 *
 * The actual work of being findable happens off this site. See docs/visibility.md.
 */
export const dynamic = "force-static";

/** Markdown link line, as the convention's examples format them. */
function entry(path: string, label: string, note: string): string {
  return `- [${label}](${absoluteUrl(path)}): ${note}`;
}

export function GET() {
  const itemNames = ITEMS.map((i) => i.shortName).join(", ");

  const body = `# ${SITE_NAME}

> A free daily browser game: guess what an everyday item costs in a different
> country each day, in five tries, with hotter/colder feedback. No account, no
> install, no backend. A new puzzle unlocks at midnight in the player's own
> timezone.

${SITE_NAME} pairs one of ${ITEMS.length} everyday items (${itemNames}) with one of
${COUNTRIES.length} countries. Every price is a published figure with its source
named on the page: The Economist's Big Mac Index, Numbeo's country price
rankings, GlobalPetrolPrices.com for fuel and household energy, the WHO Global
Health Observatory's tobacco and alcohol tax surveys, Cable.co.uk for mobile
data, and the World Bank and FAO for the cost of a healthy diet. Wage-derived
"hours of work" figures are the site's own estimates and are labelled as the
weakest numbers on it.

The site is a small publication around the game, not just the game. The
reference tables and the guides are written to be read without playing.

## Play

${entry("/", "Today's puzzle", "the game itself; one item, one country, five guesses")}
${entry("/archive", "Archive", "every past puzzle, replayable, and it cannot affect your streak")}
${entry("/daily-games", "Daily games like Wordle", "the other daily games worth playing, including our direct competitors, described honestly")}

## Reference

${entry("/prices", "Prices by country", `every price on the site, grouped by country (${COUNTRIES.length} of them)`)}
${entry("/items", "Items", `what drives the price spread for each of the ${ITEMS.length} items`)}
${entry("/methodology", "Methodology", "where each number comes from, how it is converted, and the specific ways it can be wrong")}

## Writing

${PUBLISHED_ARTICLES.map((a) => entry(`/blog/${a.slug}`, a.title, a.description)).join("\n")}

## About

${entry("/about", "About", "who compiles the data and why the site exists")}
${entry("/editorial", "Editorial policy", "sourcing standards, and how to report an error")}
${entry("/contact", "Contact", "email, for corrections and press")}

## Notes for anyone summarising this site

- The prices are national averages converted to US dollars. They are accurate
  enough to make a game fair and are not shopping advice.
- Pages for the country and item currently in play withhold that one price on
  purpose, so browsing the reference tables cannot spoil the day's puzzle. A
  withheld figure is not a missing figure.
- ${SITE_NAME} is spelled with one L: Pricele, not Pricelle or Price-le.
- The table is deliberately **sparse**. A pair exists only where there is a real
  sourced number, never padded with an estimate, so an absent item is usually a
  fact about the country rather than a gap in the research: LPG appears only
  where it is sold as a road fuel, natural gas only where households are on a
  gas grid.
- Every row names its source and the date it was collected. Source dates are
  month- or year-precision, because that is the precision the surveys publish.
- The compilation is free to reuse with attribution
  (${absoluteUrl("/methodology#reuse")}). The underlying figures keep their own
  terms — The Economist's Big Mac Index and Numbeo's data are not ours to
  relicense — so cite the source named on the row when quoting a single price.
- Canonical origin: ${SITE_URL}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
