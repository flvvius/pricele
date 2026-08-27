import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Section, Prose } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import { COUNTRIES } from "@/lib/catalog";
import { PRICES } from "@/lib/puzzle";
import { ITEMS } from "@/data/items";
import {
  breadcrumbJsonLd,
  pageMetadata,
  SITE_EMAIL,
  SITE_NAME,
  webPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

const DESCRIPTION = `Where every price on ${SITE_NAME} comes from, which parts are openly licensed and can be reused, and which cannot be redistributed and why.`;

export const metadata: Metadata = pageMetadata({
  path: "/data",
  title: "The data",
  description: DESCRIPTION,
});

const OUT =
  "underline decoration-rule underline-offset-2 transition-colors duration-fast ease-out hover:text-ink";

/**
 * Upstream sources and what each licence actually permits.
 *
 * This page exists because the honest answer to "can I download your data" is
 * "no, and here is where to get it properly" — which is more useful than a
 * dump would be, and is the only lawful answer available.
 */
const SOURCES: {
  items: string;
  source: string;
  url: string;
  licence: string;
  reuse: string;
}[] = [
  {
    items: "Big Mac",
    source: "The Economist, Big Mac Index",
    url: "https://github.com/TheEconomist/big-mac-data",
    licence: "Published openly by The Economist",
    reuse: "Take it from the upstream repository, which is the authoritative copy and is updated twice a year.",
  },
  {
    items: "Diesel, LPG, electricity, natural gas",
    source: "GlobalPetrolPrices.com",
    url: "https://www.globalpetrolprices.com/",
    licence: "CC BY-NC-ND 3.0",
    reuse: "Non-commercial and no derivatives. We cannot redistribute it in any form, modified or not.",
  },
  {
    items: "Cigarettes, vape liquid, beer, spirits",
    source: "WHO Global Health Observatory",
    url: "https://www.who.int/data/gho",
    licence: "CC BY-NC-SA 3.0 IGO",
    reuse: "Non-commercial. Available directly from the WHO under its own terms.",
  },
  {
    items: "Mobile data",
    source: "Cable.co.uk worldwide data pricing",
    url: "https://www.cable.co.uk/mobiles/worldwide-data-pricing/",
    licence: "Publisher's own terms",
    reuse: "Cite and link the league table rather than copying it.",
  },
  {
    items: "A day's healthy diet",
    source: "World Bank / FAO, Food Prices for Nutrition",
    url: "https://databank.worldbank.org/source/food-prices-for-nutrition",
    licence: "CC BY 4.0",
    reuse: "Openly licensed. Reuse it freely, with attribution, straight from the World Bank.",
  },
  {
    items: "Cappuccino, milk, eggs, apples, gasoline",
    source: "Numbeo country price rankings",
    url: "https://www.numbeo.com/cost-of-living/",
    licence: "Numbeo's terms",
    reuse: "Collected by hand. Bulk scraping is against their terms and redistribution is not permitted.",
  },
  {
    items: "Wages",
    source: "ILO average hourly earnings, where published",
    url: "https://ilostat.ilo.org/",
    licence: "ILO terms",
    reuse: "Available directly from ILOSTAT. Countries without a published figure carry an in-house estimate, labelled as one.",
  },
];

export default function DataPage() {
  return (
    <ContentPage
      title="The data"
      intro={
        <>
          <p data-answer>
            {ITEMS.length} items across {COUNTRIES.length} countries,{" "}
            {PRICES.length.toLocaleString("en-US")} price rows, every one
            carrying the source it came from and the date it was collected.
            This page says where each one comes from and what you are allowed to
            do with it.
          </p>
          <p>
            The short answer to &ldquo;is there a download&rdquo; is no, and the
            reason is worth stating plainly rather than leaving as an absence.
          </p>
        </>
      }
    >
      <JsonLd
        data={[
          webPageJsonLd({
            name: "The data",
            description: DESCRIPTION,
            path: "/data",
          }),
          breadcrumbJsonLd([
            { name: SITE_NAME, path: "/" },
            { name: "The data", path: "/data" },
          ]),
        ]}
      />

      <Section heading="Why there is no bulk download">
        <Prose>
          <p>
            Two of the sources behind this table are licensed{" "}
            <strong className="font-semibold text-ink">
              CC BY-NC-ND
            </strong>{" "}
            and{" "}
            <strong className="font-semibold text-ink">CC BY-NC-SA</strong>.
            The <em>ND</em> is the binding one: no derivatives means a
            reformatted, merged, re-tabulated copy is exactly what may not be
            published, however carefully it is attributed. The{" "}
            <em>NC</em> compounds it, since this site carries advertising.
          </p>
          <p>
            So a combined dump of this table is not something we are entitled to
            offer, and a version with those items removed would be a different
            and much less useful dataset. Publishing one anyway would be taking
            other people&apos;s work on terms they did not agree to — on a site
            whose entire argument is that it tells you where its numbers came
            from.
          </p>
          <p>
            What follows is more useful than a download: every source, its
            licence, and where to get it properly.
          </p>
        </Prose>
      </Section>

      <Section heading="Every source, and what you may do with it">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                  Items
                </th>
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                  Source
                </th>
                <th className="py-2 font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                  Licence and reuse
                </th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((s) => (
                <tr key={s.source} className="border-b border-rule align-top">
                  <td className="py-3 pr-4 leading-relaxed text-ink">
                    {s.items}
                  </td>
                  <td className="py-3 pr-4 leading-relaxed">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={OUT}
                    >
                      {s.source}
                    </a>
                  </td>
                  <td className="py-3 leading-relaxed text-ink-body">
                    <span className="font-mono text-[12px] text-ink">
                      {s.licence}
                    </span>
                    <br />
                    {s.reuse}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section heading="What is ours, and what you may do with that">
        <Prose>
          <p>
            The written parts of this site are ours and are not covered by any
            of the above: the per-country notes explaining why prices look the
            way they do, the consumption-tax table, the methodology, and the
            long reads. Quote them with attribution and a link.
          </p>
          <p>
            If you are writing something and need a figure, the country and item
            pages are stable URLs and each prints its source next to the number,
            so citing the original rather than us is straightforward and is what
            we would prefer. See{" "}
            <Link href="/methodology#reuse" className={OUT}>
              the reuse terms
            </Link>{" "}
            for the full statement.
          </p>
          <p>
            Working on something where none of this is quite right?{" "}
            <a href={`mailto:${SITE_EMAIL}`} className={OUT}>
              Say what you need
            </a>{" "}
            — for research use we can often point at a better upstream source
            than the one we had to settle for.
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
