import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#0D0D0D",
        white: "#FFFFFF",
        purple: {
          DEFAULT: "#6C4CF1",
          light: "#8B73FF",
          dark: "#5A3CE0",
        },
        gray: {
          light: "#F5F5F7",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        border: "rgba(13,13,13,0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(13,13,13,0.04), 0 1px 3px rgba(13,13,13,0.06)",
        md: "0 8px 24px rgba(13,13,13,0.08)",
      },
      keyframes: {
        fadein: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadein: "fadein .25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
