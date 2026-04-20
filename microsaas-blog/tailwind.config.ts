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
        background: "var(--bg-dark)",
        accent: {
          purple: "var(--accent-purple)",
          cyan: "var(--accent-cyan)",
        }
      },
    },
  },
  plugins: [],
};
export default config;
