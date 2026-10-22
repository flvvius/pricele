import type { Metadata } from "next";
import Link from "next/link";
import ContentPage, { Prose, Section } from "@/components/ContentPage";
import JsonLd from "@/components/JsonLd";
import YearPicker from "@/components/YearPicker";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { FIRST_YEAR, LATEST_YEAR, YEARS, minutesOfWork } from "@/lib/yearprices";
import { HISTORY_ITEMS } from "@/data/price-history";

export const metadata: Metadata = pageMetadata({
  path: "/years",
  title: "Grocery prices by year, 1980 to today",
  description: `What eggs, gas, bread and a dozen other U.S. groceries cost every year from ${FIRST_YEAR} to ${LATEST_YEAR}, and how many minutes of work each took at the average wage. Pick the year you were born.`,
  image: "/og/year/hub",
});

const coffee = HISTORY_ITEMS.find((i) => i.id === "coffee")!;

export default function YearsPage() {
  const decades = [...new Set(YEARS.map((y) => Math.floor(y / 10) * 10))];
  return (
    <ContentPage
      title="Prices the year you were born"
      intro={
        <p>
          Pick a year from {FIRST_YEAR} to {LATEST_YEAR} to see what fifteen everyday U.S. items
          cost then, what they cost now, and how many minutes of work each took at the average
          hourly wage. A pound of coffee cost {`$${coffee.prices[FIRST_YEAR].toFixed(2)}`} in{" "}
          {FIRST_YEAR}, about {Math.round(minutesOfWork(coffee.prices[FIRST_YEAR], FIRST_YEAR))}{" "}
          minutes of work.
        </p>
      }
    >
      <JsonLd data={breadcrumbJsonLd([{ name: "Prices by year" }])} />
      <Section heading="Your year">
        <YearPicker years={YEARS} initial={1990} />
      </Section>
      <Section heading="Every year">
        <div className="flex flex-col gap-4">
          {decades.map((d) => (
            <div key={d} className="flex flex-col gap-1.5">
              <p className="label">{d}s</p>
              <p className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[15px]">
                {YEARS.filter((y) => y >= d && y < d + 10).map((y) => (
                  <Link
                    key={y}
                    href={`/years/${y}`}
                    className="text-ink underline-offset-4 hover:underline"
                  >
                    {y}
                  </Link>
                ))}
              </p>
            </div>
          ))}
        </div>
      </Section>
      <Section heading="Why minutes of work">
        <Prose>
          <p>
            A price from 1985 next to a price from today mostly tells you that the dollar shrank.
            Dividing each price by that year&apos;s average hourly wage puts both in the same unit:
            how long you had to work to buy it. By that measure most groceries got cheaper, and a
            few, eggs and beef among them, did not.
          </p>
          <p>
            Prices are U.S. city averages from the Bureau of Labor Statistics. The wage is the BLS
            average for production and nonsupervisory employees, who are about four in five private
            sector workers. To play with the same numbers, try{" "}
            <Link href="/games/price-year" className="underline underline-offset-2">
              Price Year
            </Link>
            .
          </p>
        </Prose>
      </Section>
    </ContentPage>
  );
}
