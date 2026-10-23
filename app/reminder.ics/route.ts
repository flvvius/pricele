import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const CRLF = "\r\n";

function reminderCalendar(): string {
  const url = `${SITE_URL}/today`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pricele//Daily reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:daily-reminder@pricele.online",
    "DTSTAMP:20261023T000000Z",
    "DTSTART:20261024T190000",
    "DURATION:PT10M",
    "RRULE:FREQ=DAILY",
    "SUMMARY:Pricele: today's games",
    String.raw`DESCRIPTION:Today's price games\, before your streak resets at midnight: ${url}`,
    `URL:${url}`,
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Pricele: today's games",
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join(CRLF);
}

export function GET() {
  return new Response(reminderCalendar(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pricele-daily-reminder.ics"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
