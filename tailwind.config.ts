import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        band: {
          green: "#4caf50",
          yellow: "#e0b000",
          black: "#3a3a3c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
