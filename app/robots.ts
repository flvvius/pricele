import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

/**
 * Named crawlers, all allowed, spelled out rather than left to the wildcard.
 *
 * `User-agent: *` already permits every one of these, so on a strict reading
 * this file changes nothing. It is here for two reasons that are not about
 * permission.
 *
 * The first is Google-Extended. It is not a crawler at all — it is the opt-out
 * token that decides whether content Google has already fetched may be used for
 * Gemini and for grounding AI answers, and a site that never names it is
 * relying on a default it has not looked at. For a site whose visibility
 * problem is not being cited by assistants, that default is worth stating
 * deliberately.
 *
 * The second is that the list is self-documenting in a way a bare wildcard is
 * not: it says which of these are retrieval fetchers that decide whether a
 * chatbot can quote a price today, and which are training crawlers that pay off
 * over a much longer horizon. Those deserve different answers if this is ever
 * revisited, and you cannot give different answers to agents you have not named.
 */
const AI_AGENTS = [
  // Retrieval-time fetchers. These matter most: they fetch a page because a
  // user just asked something, and what they find is what gets quoted back.
  // Blocking them is blocking citations.
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // a ChatGPT user following a link
  "PerplexityBot",
  "Perplexity-User",
  "Claude-User",
  "Claude-SearchBot",
  // Training and index crawlers.
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "Bytespider",
  "CCBot", // Common Crawl, which several of the above are built on
  "cohere-ai",
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
