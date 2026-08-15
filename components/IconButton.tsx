/**
 * The masthead control: a 36px circular hit area holding a 17px glyph, with the
 * icon itself carrying the whole affordance until you touch it.
 *
 * Shared rather than duplicated because the masthead reads as one row of
 * controls (help, edition, archive, stats) and the moment two of them are
 * defined in different files, one of them eventually gets a different hover or a
 * different press scale and the row stops looking like a row.
 */
export default function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full text-ink-muted transition-[color,background-color,transform] duration-press ease-out hover:bg-paper-sunk hover:text-ink active:scale-[0.94]"
    >
      {children}
    </button>
  );
}
