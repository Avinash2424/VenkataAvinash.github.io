/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // SRE Dashboard dark palette
        panel: {
          DEFAULT: "#0f1117",
          light: "#161b22",
          border: "#21262d",
        },
        accent: {
          green: "#3fb950",
          blue: "#58a6ff",
          yellow: "#d29922",
          red: "#f85149",
          purple: "#bc8cff",
          cyan: "#39d2c0",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
