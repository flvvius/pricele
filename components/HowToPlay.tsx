import Modal from "./Modal";
import { IconDown, IconUp } from "./Icons";

const RAMP = [
  { level: 0, label: "Freezing" },
  { level: 1, label: "Cold" },
  { level: 2, label: "Warm" },
  { level: 3, label: "Hot" },
  { level: 4, label: "Scorching" },
];

export default function HowToPlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="How to play">
      <div className="flex flex-col gap-6 text-[14px] leading-relaxed text-ink-body">
        <p>
          Guess what today&apos;s item costs in the featured country. You get{" "}
          <strong className="font-semibold text-ink">five tries</strong>, and you
          win by landing within{" "}
          <strong className="font-semibold text-ink">5%</strong> of the real
          price.
        </p>

        <p className="text-ink-muted">
          Guess in dollars or euros with the $ / € switch in the guess box. The
          5% rule is the same in either.
        </p>

        <div>
          <h3 className="label rule-label mb-3">Clue one · direction</h3>
          <div className="flex flex-col gap-2.5">
            <p className="flex items-center gap-3">
              <IconUp size={15} className="shrink-0 text-ink-muted" />
              <span>The real price is higher than you guessed.</span>
            </p>
            <p className="flex items-center gap-3">
              <IconDown size={15} className="shrink-0 text-ink-muted" />
              <span>The real price is lower than you guessed.</span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="label rule-label mb-3">Clue two · temperature</h3>
          {/* The ramp is shown as the actual swatches the board uses, so the
              legend and the game cannot drift apart in the player's head. */}
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {RAMP.map((t) => (
              <li key={t.level} className="flex items-center gap-2">
                <span
                  className="h-3.5 w-6 shrink-0"
                  style={{ backgroundColor: `rgb(var(--warm-${t.level}))` }}
                  aria-hidden
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  {t.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-ink-muted">
            The bar behind each guess fills with its temperature. It never tells
            you the exact gap, which would hand you the answer on your second
            try.
          </p>
        </div>

        <p className="border-l-2 border-rule pl-3.5 text-ink-muted">
          A new item and country are set every day at your local midnight. Play
          daily to keep a streak.
        </p>

        <button
          onClick={onClose}
          className="bg-ink px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-paper-raised transition-transform duration-press ease-out active:scale-[0.98]"
        >
          Play
        </button>
      </div>
    </Modal>
  );
}
