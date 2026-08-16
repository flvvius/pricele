// Who is behind the site.
//
// WHY THIS FILE EXISTS.
//   Ad reviewers and search quality raters both look for a named, contactable
//   human standing behind the content. An anonymous site publishing compiled
//   price data reads as a scraper; the same site with a byline, a stated method
//   and a corrections address reads as a publication. That difference is worth
//   more than any amount of extra word count, and it costs one file.
//
//   Everything here renders somewhere: the byline and author card on every
//   guide, the "Who runs this" block on /about, the Person and Organization
//   nodes in JSON-LD, and the contact routes in /editorial and /terms.
//
// KEEP IT TRUE.
//   Do not add a credential, an affiliation or a link that cannot be checked.
//   An invented biography fails the exact review it was written to pass, and it
//   fails it worse than a short honest one. If a field cannot be filled in
//   truthfully, delete the field.

export interface AuthorProfile {
  /** Full name, as it should appear in a byline. */
  name: string;
  /** One line under the name. What this person does *for this site*. */
  role: string;
  /**
   * Two or three sentences, first person plural or third, no puffery. Says what
   * they actually do here and what they are not claiming to be.
   */
  bio: string[];
  email: string;
  /** Profiles that verify the person exists. Omit any that don't. */
  links: { label: string; url: string }[];
}

export const AUTHOR: AuthorProfile = {
  name: "Flavius Cojocaru",
  role: "Editor and maintainer",
  bio: [
    "I build and run Pricele on my own. That means I choose which items and countries go into the game, pull each price from the published source named on the methodology page, check the conversions, write the guides, and answer the mail.",
    "I am not an economist and the site does not pretend otherwise. What I can promise is that every figure here is traceable to a named public source, that the ones I could not trace are labelled instead of quietly filled in, and that a correction sent to the address below gets read by the person who made the mistake.",
  ],
  email: "flaviuscojocaru19@gmail.com",
  links: [{ label: "GitHub", url: "https://github.com/flvvius" }],
};

/**
 * The site as a publisher.
 *
 * Separate from AUTHOR because schema.org wants both: a `publisher` for the
 * site and an `author` for each piece. On a one-person site they point at the
 * same human, but the shapes differ and conflating them produces invalid
 * structured data.
 */
export const PUBLISHER = {
  /** When the site first went live. Used for "publishing since" copy. */
  foundedYear: 2026,
  /** Where the operator is based. Advertisers and readers both ask. */
  location: "Romania",
} as const;
