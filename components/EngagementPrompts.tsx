"use client";

import { useEffect, useState } from "react";
import {
  canInstall,
  disableDailyReminder,
  enableDailyReminder,
  isStandalone,
  onInstallAvailabilityChange,
  promptInstall,
  reminderEnabled,
  remindersSupported,
} from "@/lib/pwa";

/**
 * Retention CTAs surfaced after a game: install the PWA (a home-screen icon is
 * the most reliable daily nudge) and opt into a daily reminder. Each control
 * renders only when the browser can actually honor it, so we never show a dead
 * button.
 */
export default function EngagementPrompts() {
  const [installable, setInstallable] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [canRemind, setCanRemind] = useState(false);
  const [reminderOn, setReminderOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setInstallable(canInstall());
    sync();
    setStandalone(isStandalone());
    setCanRemind(remindersSupported());
    setReminderOn(reminderEnabled());
    return onInstallAvailabilityChange(sync);
  }, []);

  async function onInstall() {
    setBusy(true);
    await promptInstall();
    setInstallable(canInstall());
    setBusy(false);
  }

  async function onEnableReminder() {
    setBusy(true);
    const ok = await enableDailyReminder();
    setReminderOn(ok);
    setBusy(false);
  }

  function onDisableReminder() {
    disableDailyReminder();
    setReminderOn(false);
  }

  const showInstall = installable && !standalone;
  const showReminder = canRemind;
  if (!showInstall && !showReminder) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
      <p className="text-center text-xs text-neutral-400">
        Never miss a day
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {showInstall && (
          <button
            onClick={onInstall}
            disabled={busy}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-50"
          >
            📲 Add to home screen
          </button>
        )}
        {showReminder &&
          (reminderOn ? (
            <button
              onClick={onDisableReminder}
              className="rounded-lg border border-green-700 bg-green-950/40 px-3 py-2 text-sm font-medium text-green-300 transition hover:bg-green-950/70"
            >
              🔔 Daily reminder on · turn off
            </button>
          ) : (
            <button
              onClick={onEnableReminder}
              disabled={busy}
              className="rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-50"
            >
              🔔 Remind me daily
            </button>
          ))}
      </div>
    </div>
  );
}
