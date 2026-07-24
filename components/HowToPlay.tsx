import Modal from "./Modal";

export default function HowToPlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="How to play">
      <div className="flex flex-col gap-4 text-sm text-neutral-300">
        <p>
          Guess the price of today&apos;s item in the featured country. You have{" "}
          <strong className="text-white">5 tries</strong>, and you&apos;re
          always guessing in <strong className="text-white">USD</strong>.
        </p>
        <p>After each guess you get two clues:</p>
        <ul className="flex flex-col gap-2">
          <li className="flex items-center gap-3">
            <span className="text-lg">↕️</span>
            <span>
              Whether the <strong className="text-white">real price</strong> is
              higher or lower than the amount you guessed.
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-lg">🟩</span>
            <span>
              Within 10% of the real price. This wins the game.
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-lg">🟨</span>
            <span>Within 30%. Getting warm.</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-lg">⬛</span>
            <span>Further off. The warmth bar shows how close you are.</span>
          </li>
        </ul>
        <p className="rounded-lg bg-neutral-800 p-3">
          A new country drops every day. Keep your streak alive by playing daily.
        </p>
      </div>
    </Modal>
  );
}
