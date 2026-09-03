"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  cleanName,
  loadRoomCode,
  loadRoomName,
  saveRoomCode,
  saveRoomName,
  isRoomCode,
  MAX_NAME_LENGTH,
} from "@/lib/room";

const FIELD =
  "w-full border border-rule bg-paper-raised px-3 py-2.5 font-mono text-[15px] text-ink outline-none transition-[border-color] duration-fast ease-out focus:border-ink placeholder:text-ink-faint";

const BUTTON =
  "bg-ink px-5 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98] disabled:opacity-40";

const GHOST =
  "border border-rule px-5 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-body transition-[border-color,background-color] duration-fast ease-out hover:border-ink hover:bg-paper-raised";

/**
 * Create or join a room, in as few fields as it can be done in.
 *
 * There is no account here and there is not going to be one. A teacher has five
 * minutes at the start of a lesson and thirty people who each need to be playing
 * inside two of them, and every field on this screen is one more thing that can
 * go wrong on a projector. So: a name, or a code and a name. That is the form.
 *
 * The room lives in localStorage, so once a student has joined, finishing the
 * daily on the normal game screen posts their bid to the board automatically.
 * There is no separate classroom version of the game to keep in sync.
 */
export default function ClassroomSetup() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [joined, setJoined] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(loadRoomName());
    setJoined(loadRoomCode());
  }, []);

  async function create() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: cleanName(label) }),
      });
      const data = (await res.json()) as { code?: string; enabled?: boolean };
      if (!data.code) {
        setError(
          data.enabled === false
            ? "Classrooms are not configured on this deployment."
            : "Could not open a room. Try again in a moment."
        );
        return;
      }
      saveRoomName(name);
      saveRoomCode(data.code);
      setJoined(data.code);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  function join() {
    const upper = code.toUpperCase().trim();
    if (!isRoomCode(upper)) {
      setError("That is not a room code. They are four characters.");
      return;
    }
    if (!cleanName(name)) {
      setError("Put a name in, so the board has something to call you.");
      return;
    }
    setError("");
    saveRoomName(name);
    saveRoomCode(upper);
    setJoined(upper);
  }

  function leave() {
    saveRoomCode("");
    setJoined("");
  }

  if (joined) {
    return (
      <div className="flex max-w-prose flex-col gap-5">
        <div className="border border-rule border-t-2 border-t-ink bg-paper-raised p-5 text-center">
          <p className="label">Room code</p>
          <p className="display mt-2 text-[3.5rem] leading-none tracking-[0.1em] text-ink">
            {joined}
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
            Read this out. Everyone goes to{" "}
            <span className="font-mono text-ink-body">pricele.online/classroom</span>,
            types it in, and plays today&apos;s puzzle as normal.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-[16px] leading-[1.7] text-ink-body">
          <p>
            You are playing as{" "}
            <strong className="font-semibold text-ink">
              {cleanName(name) || "Anonymous"}
            </strong>
            . Finish the daily puzzle and your opening bid goes on the board.
          </p>
          <p>
            The board is scored on the old game-show rule: closest without going
            over. It stays hidden from each person until they have bid, so
            nobody can read the answer off somebody else&apos;s guess. Play
            first, then project it.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/" className={BUTTON}>
            Play today&apos;s puzzle
          </Link>
          <button onClick={leave} className={GHOST}>
            Leave the room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-prose flex-col gap-8">
      <div className="flex flex-col gap-3">
        <label htmlFor="room-name" className="label rule-label">
          Your name
        </label>
        <input
          id="room-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Shown on the board"
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="label rule-label">Join a room</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={4}
          placeholder="ABCD"
          aria-label="Room code"
          className={`${FIELD} tracking-[0.35em]`}
        />
        <button onClick={join} className={`${BUTTON} self-start`}>
          Join
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="label rule-label">Or open one</h2>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Class name, optional"
          aria-label="Room label"
          className={FIELD}
        />
        <button
          onClick={create}
          disabled={busy}
          className={`${GHOST} self-start`}
        >
          {busy ? "Opening" : "Open a room"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="border-l-2 border-accent bg-accent/[0.06] py-2 pl-3 text-[14px] text-ink-body"
        >
          {error}
        </p>
      )}
    </div>
  );
}
