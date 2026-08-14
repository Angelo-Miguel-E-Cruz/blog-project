/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Ink & parchment" palette — deep spruce ground, warm paper text, mustard signature accent.
        // Deliberately not the cream/terracotta or near-black/neon defaults (see design notes).
        spruce: {
          DEFAULT: "#132420",
          light: "#1C332D",
        },
        parchment: "#F4EFE4",
        mustard: {
          DEFAULT: "#D8A93A",
          dim: "#B68F30",
        },
        ink: "#1B2420",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
