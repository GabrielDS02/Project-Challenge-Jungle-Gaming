/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#160d08",
        roast: "#24130c",
        bark: "#342016",
        sand: "#f4dfbf",
        ember: "#e89045",
        moss: "#7b8f63",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Courier New", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 18px 60px rgba(232, 144, 69, .18)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: {
          "0%,100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-10px) rotate(1deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
