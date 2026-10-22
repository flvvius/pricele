"use client";

import ShareButton from "./ShareButton";

export default function YearShare({ year, lines }: { year: number; lines: string[] }) {
  return (
    <ShareButton
      text={(url) => [...lines, url].join("\n")}
      path={`/years/${year}`}
      campaign="years"
      event="years_share"
      label={`Share ${year} prices`}
      props={{ year }}
    />
  );
}
