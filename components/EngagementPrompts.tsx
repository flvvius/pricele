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

/** Secondary control: outlined, never filled. Only one thing on the reveal is
    allowed to be a solid block of ink, and it is the share button. */
const BUTTON =
  "border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-body transition-[border-color,background-color,transform] duration-press ease-out hover:border-ink hover:bg-paper-raised active:scale-[0.97] disabled:opacity-50";

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
    <div className="flex flex-col gap-3 border-y border-rule-soft py-3.5">
      <p className="label">Never miss an edition</p>
      <div className="flex flex-wrap gap-2">
        {showInstall && (
          <button
            onClick={onInstall}
            disabled={busy}
            className={BUTTON}
          >
            Add to home screen
          </button>
        )}
        {showReminder &&
          (reminderOn ? (
            <button
              onClick={onDisableReminder}
              className={`${BUTTON} !border-win !text-win`}
            >
              Reminder on · turn off
            </button>
          ) : (
            <button onClick={onEnableReminder} disabled={busy} className={BUTTON}>
              Remind me daily
            </button>
          ))}
      </div>
    </div>
  );
}
