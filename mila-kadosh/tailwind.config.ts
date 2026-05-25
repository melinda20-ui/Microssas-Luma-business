import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0908",
        rose: "#c9936a",
        cta: "#e8bfa0",
        gold: "#b8945a",
        beige: "#f5f0ea",
        beigeSection: "#ede5d8",
        textLight: "#ccc5bc",
        textMedium: "#8a7f74",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Montserrat", "sans-serif"],
        signature: ["Dancing Script", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
