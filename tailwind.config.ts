import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xyris: {
          yellow: "#F8E27C",
          "yellow-light": "#FCEFA8",
          blue: "#264DAC",
          "blue-dark": "#1E3A8A",
          red: "#B51C1E",
          "red-dark": "#991B1B",
          charcoal: "#1F2937",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontVariantNumeric: {
        "tabular-nums": "tabular-nums",
      },
    },
  },
  plugins: [],
};

export default config;
