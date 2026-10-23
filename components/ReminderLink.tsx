"use client";

import { trackEvent } from "@/lib/analytics";

export default function ReminderLink({ className = "" }: { className?: string }) {
  return (
    <a
      href="/reminder.ics"
      download
      onClick={() => trackEvent("reminder_add")}
      className={`underline underline-offset-2 hover:text-ink ${className}`}
    >
      Add a 7pm daily reminder to your calendar
    </a>
  );
}
