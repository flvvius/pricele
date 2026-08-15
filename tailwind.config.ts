import type { Config } from "tailwindcss";

/**
 * Every colour resolves through a CSS variable, so the Paper and Night editions
 * are the same build with a different `:root` block.
 *
 * `neutral` is deliberately overwritten rather than removed. The scale keeps its
 * original *meaning*, where low numbers are the strongest text and high numbers
 * the deepest surface, so every `text-neutral-400` already in the codebase still
 * means "secondary text" and now resolves to warm ink instead of Tailwind grey.
 * That is what lets the reference pages inherit the new edition without a
 * find-and-replace across fifty files.
 */
const ink = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Small phones (iPhone SE and friends) sit below this. The board sheds its
      // warmth wording there rather than truncating it.
      screens: { xs: "380px" },

      colors: {
        // Semantic names, which is what new code should reach for.
        paper: {
          DEFAULT: ink("--paper"),
          raised: ink("--paper-raised"),
          sunk: ink("--paper-sunk"),
        },
        ink: {
          DEFAULT: ink("--ink"),
          strong: ink("--ink-strong"),
          body: ink("--ink-body"),
          muted: ink("--ink-muted"),
          meta: ink("--ink-meta"),
          faint: ink("--ink-faint"),
        },
        rule: {
          DEFAULT: ink("--rule"),
          soft: ink("--rule-soft"),
        },
        accent: {
          DEFAULT: ink("--accent"),
          ink: ink("--accent-ink"),
        },
        win: ink("--win"),
        streak: ink("--streak"),

        // The hotter/colder ramp, cold to scorching.
        warm: {
          0: ink("--warm-0"),
          1: ink("--warm-1"),
          2: ink("--warm-2"),
          3: ink("--warm-3"),
          4: ink("--warm-4"),
        },

        // Legacy scale, re-pointed. See the note above.
        neutral: {
          50: ink("--ink"),
          100: ink("--ink-strong"),
          200: ink("--ink-body"),
          300: ink("--ink-body"),
          400: ink("--ink-muted"),
          500: ink("--ink-meta"),
          600: ink("--ink-faint"),
          700: ink("--rule"),
          800: ink("--rule-soft"),
          900: ink("--paper-raised"),
          950: ink("--paper-sunk"),
        },
      },

      fontFamily: {
        // Instrument Serif for anything that behaves like a headline, Archivo
        // (a grotesque drawn for newsprint) for running UI, Geist Mono for every
        // figure. No Inter anywhere: it is the single loudest tell there is.
        display: ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },

      fontSize: {
        // Two display steps that scale with the viewport, so the reveal figure
        // is a headline on a phone and a headline on a laptop.
        figure: ["clamp(3.25rem, 17vw, 5rem)", { lineHeight: "0.88", letterSpacing: "-0.03em" }],
        masthead: ["clamp(1.5rem, 7vw, 1.875rem)", { lineHeight: "0.9", letterSpacing: "-0.02em" }],
      },

      borderRadius: {
        // The board is hard-ruled; only controls are rounded, and then fully.
        none: "0",
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
        xl: "8px",
        "2xl": "10px",
        full: "9999px",
      },

      boxShadow: {
        // Print has no glow. Panels get a single soft drop to lift them off the
        // page; nothing else in the app casts a shadow at all.
        panel: "0 24px 60px -24px rgb(var(--ink) / 0.35), 0 2px 8px -2px rgb(var(--ink) / 0.12)",
        press: "inset 0 1px 0 0 rgb(var(--paper-raised) / 0.12)",
      },

      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        sheet: "var(--ease-sheet)",
      },

      transitionDuration: {
        press: "140ms",
        fast: "180ms",
      },
    },
  },
  plugins: [],
};

export default config;
