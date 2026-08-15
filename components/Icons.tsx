/**
 * The whole icon set, drawn on one 24px grid at a 1.75 stroke.
 *
 * Emoji were doing this job before: ✕ for close, ▸ for play, ✓/✗ for results.
 * Emoji render in a different face on every platform, ignore `currentColor`, sit
 * off the text baseline and cannot be sized against the type scale, so a UI
 * built from them can never look drawn on purpose. These inherit colour and
 * size from their parent, which is the entire point.
 */

type IconProps = {
  className?: string;
  size?: number;
};

function Svg({
  className,
  size = 20,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconHelp(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9.25" />
      <path d="M9.4 9.3a2.7 2.7 0 0 1 5.25.9c0 1.8-2.65 2.7-2.65 2.7" />
      <path d="M12 17.2h.01" />
    </Svg>
  );
}

export function IconArchive(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 4.5h18v4H3z" />
      <path d="M4.75 8.5v9a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2v-9" />
      <path d="M10 12.5h4" />
    </Svg>
  );
}

export function IconStats(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20V13" />
      <path d="M9.33 20V8" />
      <path d="M14.67 20v-9" />
      <path d="M20 20V4" />
    </Svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Svg>
  );
}

export function IconUp(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </Svg>
  );
}

export function IconDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 5v14" />
      <path d="M18 13l-6 6-6-6" />
    </Svg>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.5 12.5l5 5 10-11" />
    </Svg>
  );
}

export function IconSun(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.22 4.22l1.56 1.56M18.22 18.22l1.56 1.56M2.5 12h2.2M19.3 12h2.2M4.22 19.78l1.56-1.56M18.22 5.78l1.56-1.56" />
    </Svg>
  );
}

export function IconMoon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2z" />
    </Svg>
  );
}

export function IconShare(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 15.5V3.5" />
      <path d="M8 7.5l4-4 4 4" />
      <path d="M5 13v6.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V13" />
    </Svg>
  );
}
