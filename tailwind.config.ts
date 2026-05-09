import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-palette="navy"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-mute": "var(--ink-mute)",
        accent: "var(--accent)",
        "accent-deep": "var(--accent-deep)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        positive: "#2f6b4a",
        warn: "#c47a1d",
        danger: "#d94f4f",
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "Times New Roman", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      animation: {
        spin: "spin 0.65s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
