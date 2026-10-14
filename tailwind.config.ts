import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0a10",
        bg2: "#121019",
        line: "rgba(255,255,255,0.09)",
        lineStrong: "rgba(255,255,255,0.18)",
        ink: "#f4f2fa",
        muted: "#b6b2c6",
        muted2: "#888499",
        coral: "#ff6b5e",
        orange: "#ffa23a",
        pink: "#ff4d8d",
        violet: "#9b6bff",
        cyan: "#46e6c9",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        sunset: "linear-gradient(100deg, #ff914d 0%, #ff5e8a 45%, #9b6bff 100%)",
      },
      boxShadow: {
        glow: "0 18px 50px -20px rgba(0,0,0,0.8)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
