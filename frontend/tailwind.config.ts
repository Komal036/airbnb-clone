import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "sans-serif",
        ],
      },
      colors: {
        rausch: "#FF385C",
        "rausch-dark": "#E31C5F",
        ink: "#222222",
        graytext: "#717171",
        hairline: "#DDDDDD",
      },
      boxShadow: {
        card: "0 6px 16px rgba(0,0,0,0.12)",
        soft: "0 2px 8px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        xl2: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
