import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a0f1f",
          900: "#0d1526",
          800: "#131d34",
          700: "#1c2a47",
          600: "#28395c",
        },
        teal: {
          50: "#effcfb",
          100: "#c9f5f1",
          400: "#2dd4c8",
          500: "#0fb8ac",
          600: "#0a9389",
          700: "#0a746c",
        },
        warmbg: "#f7f5f0",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
