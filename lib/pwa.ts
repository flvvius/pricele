// Client-only PWA glue: service-worker registration, the "add to home screen"
// install prompt, and an opt-in daily reminder.
//
// Reminder reality check: with no backend and no push service, a web app cannot
// reliably fire a scheduled push while it's closed. We progressively enhance with
// the Notification Triggers API (Chromium: `TimestampTrigger`) which schedules a
// local notification for a future time, and we RE-ARM it every time the player
// opens the app. For players on browsers without triggers, the installed PWA icon
// is the fallback nudge. We never pretend the reminder was set when it wasn't.

const REMINDER_KEY = "pricele:reminder";
const REMINDER_HOUR = 9; // local hour to nudge, the morning after.

/** The captured beforeinstallprompt event, if the browser offered one. */
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredInstall: InstallEvent | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

/** Subscribe to install-availability changes. Returns an unsubscribe fn. */
export function onInstallAvailabilityChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Whether the browser has an install prompt ready for us to trigger. */
export function canInstall(): boolean {
  return deferredInstall !== null;
}

/** Whether the app is already running as an installed/standalone PWA. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** Register the service worker and start listening for the install prompt. */
export function initPwa(): void {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // stop Chrome's default mini-infobar; we show our own CTA
    deferredInstall = e as InstallEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredInstall = null;
    notify();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW is a progressive enhancement; the game works fine without it */
    });
  }

  // If the player previously opted into reminders, re-arm for tomorrow.
  scheduleReminderIfEnabled();
}

/** Fire the native install prompt. Returns true if the user accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!deferredInstall) return false;
  const evt = deferredInstall;
  deferredInstall = null;
  notify();
  try {
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    return outcome === "accepted";
  } catch {
    return false;
  }
}

// ---- Daily reminder --------------------------------------------------------

export function reminderEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(REMINDER_KEY) === "1";
  } catch {
    return false;
  }
}

/** True when this browser can actually schedule a background local reminder. */
export function remindersSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "TimestampTrigger" in window
  );
}

function nextReminderTimestamp(now = new Date()): number {
  const t = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    REMINDER_HOUR,
    0,
    0,
    0
  );
  return t.getTime();
}

/**
 * Opt into daily reminders: ask for notification permission, then schedule the
 * first one. Returns true only if a reminder was actually armed.
 */
export async function enableDailyReminder(): Promise<boolean> {
  if (!remindersSupported()) return false;
  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") return false;

  try {
    window.localStorage.setItem(REMINDER_KEY, "1");
  } catch {
    /* ignore */
  }
  await armReminder();
  return true;
}

export function disableDailyReminder(): void {
  try {
    window.localStorage.setItem(REMINDER_KEY, "0");
  } catch {
    /* ignore */
  }
  // Clear any pending scheduled reminder.
  navigator.serviceWorker?.ready
    .then((reg) => reg.getNotifications({ tag: "pricele-daily" }))
    .then((ns) => ns?.forEach((n) => n.close()))
    .catch(() => {});
}

async function armReminder(): Promise<void> {
  if (!remindersSupported() || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker.ready;
    // Replace any already-scheduled reminder so we never stack duplicates.
    const existing = await reg.getNotifications({ tag: "pricele-daily" });
    existing.forEach((n) => n.close());

    const TimestampTriggerCtor = (
      window as unknown as { TimestampTrigger: new (t: number) => unknown }
    ).TimestampTrigger;

    await reg.showNotification("Pricele is waiting", {
      tag: "pricele-daily",
      body: "A new country is live. Keep your streak alive!",
      icon: "/icon.svg",
      badge: "/icon.svg",
      // @ts-expect-error showTrigger is not yet in the TS DOM lib
      showTrigger: new TimestampTriggerCtor(nextReminderTimestamp()),
    });
  } catch {
    /* scheduling failed; installed icon remains the fallback nudge */
  }
}

/** Re-arm the reminder on app open if the player has it enabled. */
export function scheduleReminderIfEnabled(): void {
  if (reminderEnabled()) void armReminder();
}
