"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconClose } from "./Icons";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Matches the longest exit animation in globals.css (the mobile sheet). */
const EXIT_MS = 220;

export default function Modal({ open, onClose, title, children }: Props) {
  // `open` flips instantly, but the element has to outlive it long enough to
  // play the exit. Without this the panel vanished on the frame the user hit
  // Escape, which is the most common reason a dialog feels cheap: it costs
  // 340ms to arrive and nothing at all to leave.
  const [present, setPresent] = useState(open);
  const [leaving, setLeaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      setPresent(true);
      setLeaving(false);
      return;
    }
    if (!present) return;
    setLeaving(true);
    const id = window.setTimeout(() => {
      setPresent(false);
      setLeaving(false);
    }, EXIT_MS);
    return () => window.clearTimeout(id);
  }, [open, present]);

  useEffect(() => {
    if (!open) return;

    restoreFocus.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    // Escape closes; Tab is kept inside the panel. A dialog you can tab out of
    // strands a keyboard user in dead space behind the veil.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!present) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-ink/45 backdrop-blur-[2px] sm:items-center sm:p-4 ${
        leaving ? "animate-veil-out" : "animate-veil-in"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Square on phones: it is a sheet flush to the bottom edge, and a rounded
          sheet against a straight screen edge reads as a mistake. The heavy top
          rule is the same one that sits under the masthead. */}
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[88dvh] w-full max-w-md overflow-y-auto border-t-2 border-ink bg-paper-raised px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-panel outline-none sm:border sm:border-rule sm:border-t-2 sm:border-t-ink sm:p-6 ${
          leaving ? "animate-panel-out" : "animate-panel-in"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="display text-2xl text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 -mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-meta transition-[color,background-color,transform] duration-press ease-out hover:bg-paper-sunk hover:text-ink active:scale-[0.94]"
          >
            <IconClose size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
