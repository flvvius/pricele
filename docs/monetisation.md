# Paying for this

What the site can be funded by, what it refuses, and why. Written to be argued
with — if a conclusion here is wrong, the reasoning is on the page.

## The constraint everything else follows from

The site's only real asset is that its numbers are traceable. Every price
prints the source it came from and the date it was collected, and the whole
proposition collapses the moment a figure can be bought, nudged, or quietly
reordered.

That rules out the easy money for a price-comparison site: paid placement in
the tables, "featured" rows, retailer deals that decide which items appear.
None of it is available here, and `/sponsor` says so in public so nobody has to
ask.

Unlike the sister site there is no content-policy problem — a game about the
price of a Big Mac is ordinary content that any platform will take. The ceiling
here is set by traffic, not by classification.

## 1. Advertising — live

Google AdSense, bounded on purpose: never during play, never mid-article. See
`lib/ads.ts`. Slots render only when a slot id is configured, so there are no
empty placeholder boxes.

This site is the clean approval candidate of the two and should be the one the
AdSense account is established on. Both sites share one publisher id, so the
account's standing is a shared asset.

## 2. Reader support — built, unconfigured

`lib/support.ts`, surfaced at `/support`. Off until a handle is set. Every
platform will accept this site, so pick on fees and audience: GitHub Sponsors
and Liberapay take the smallest cut, a Stripe payment link takes no platform
cut at all, Ko-fi and Buy Me a Coffee are the two a non-technical reader
recognises.

Expect it to be small. It is worth having because it is the only revenue that
needs nobody's approval, and because `/support` is a funding-transparency page
before it is an ask — that half earns its place regardless.

## 3. Sponsorship — built, unsold

`/sponsor` is the whole offer in public, including the refusals. The
highest-value ask is not a banner: several items are collected by hand because
no open dataset covers them, and that collection is the site's real running
cost. A sponsor funding an item or a country is acknowledged next to the source
it paid for. That is a sponsorship which visibly improves the thing sponsored.

Traffic figures are deliberately absent from the page — too young for a number
that survives a month — and go out as source screenshots on request.

## 4. Affiliate — infrastructure only, unused

`components/AffiliateLink.tsx` forces `rel="sponsored nofollow noopener
noreferrer"` and renders a visible disclosure. Nothing uses it yet.

This is the one place this site has a genuine advantage over the sister site.
People comparing what things cost across countries are often about to move
money or travel, and currency transfer, travel cards and eSIMs are honest,
relevant products. The hard line: an affiliate link may never influence which
items or countries appear, or the order of a table. The moment a price page
ranks by commission the site is worth nothing.

## 5. The data — deliberately not published

Unlike the sister site, this table cannot be released as an open dataset, and
`/data` explains why to readers rather than leaving it as an absence.

GlobalPetrolPrices is **CC BY-NC-ND** and WHO data is **CC BY-NC-SA**. The
*no-derivatives* term is the binding one: a reformatted, merged, re-tabulated
copy is precisely what may not be redistributed, however well attributed. The
*non-commercial* term compounds it, since the site carries advertising.

`/data` therefore publishes something more useful and entirely lawful: every
source, its licence, and where to obtain it properly. For a reader doing
research that is better than a dump, and it costs the site nothing it was
entitled to keep.

Worth flagging as an open question rather than a settled one: running AdSense
alongside NC-licensed inputs is a tension the README has recorded since those
sources were added. It is disclosed at `/methodology#reuse`. If it ever needs
resolving, the fix is to replace those items with openly-licensed equivalents,
not to stop disclosing.

## What is not on this list

**A paywall.** The prices are the point and they are free.

**Selling reader data.** Stated in `/privacy` and repeated on `/support`.

**Paid placement in the tables.** They rank by price. They will never rank by
who paid.
