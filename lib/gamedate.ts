import { isoDate } from "./puzzle";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function archiveDate(
  search: string,
  epoch: string,
  today: string = isoDate()
): string | null {
  const d = new URLSearchParams(search).get("d");
  if (!d || !ISO.test(d) || Number.isNaN(Date.parse(d))) return null;
  return d >= epoch && d < today ? d : null;
}

export function archiveKey(key: string): string {
  return `${key}:archive`;
}

export function pastDates(epoch: string, today: string = isoDate()): string[] {
  const out: string[] = [];
  const [y, m, d] = epoch.split("-").map(Number);
  for (let i = 0; ; i++) {
    const day = new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10);
    if (day >= today) break;
    out.push(day);
  }
  return out.reverse();
}
