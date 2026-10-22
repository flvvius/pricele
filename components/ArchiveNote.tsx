import Link from "next/link";
import { formatArchiveDate } from "@/lib/format";

export default function ArchiveNote({ date, href }: { date: string; href: string }) {
  return (
    <p
      data-testid="archive-note"
      className="border-l-2 border-accent bg-accent/[0.07] py-2 pl-3 pr-2 text-[14px] text-ink"
    >
      Archive puzzle from {formatArchiveDate(date)}. It doesn&apos;t count toward today&apos;s set or your streak.{" "}
      <Link href={href} className="underline underline-offset-2">
        Play today&apos;s
      </Link>
    </p>
  );
}
