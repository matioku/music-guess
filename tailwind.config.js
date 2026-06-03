/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        xp: {
          // Desktop / window face
          beige: "#ece9d8",
          face: "#f1efe2",
          control: "#ece9d8",
          // Luna blue titlebar gradient stops
          blue: "#2f8bef",
          "blue-deep": "#0054e3",
          "blue-edge": "#003ce6",
          // Bevels
          light: "#ffffff",
          shadow: "#aca899",
          "shadow-deep": "#716f64",
          // Selection / focus
          select: "#316ac5",
          // Status green (Start button family)
          green: "#3c9a3c",
        },
        lcd: {
          bg: "#06080c",
          panel: "#0d1622",
          glow: "#46e8ff",
          dim: "#1e6f7e",
          amber: "#ffb33e",
        },
        feedback: {
          correct: "#2e9e2e",
          "correct-bg": "#d7f0d2",
          wrong: "#c5302a",
          "wrong-bg": "#f6dad8",
          partial: "#c8860a",
          "partial-bg": "#fcefcf",
        },
      },
      fontFamily: {
        tahoma: ['"Tahoma"', '"Verdana"', '"Geneva"', "sans-serif"],
        trebuchet: ['"Trebuchet MS Local"', '"Trebuchet MS"', '"Verdana"', "sans-serif"],
        pixel: ['"XP Tahoma Pixel"', '"Tahoma"', "monospace"],
      },
      boxShadow: {
        "xp-window": "1px 1px 0 #0a246a, 2px 2px 3px rgba(0,0,0,.35)",
        "lcd-glow": "inset 0 0 24px rgba(70,232,255,.12), inset 0 1px 0 rgba(255,255,255,.06)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        eq: {
          "0%,100%": { transform: "scaleY(0.25)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        marquee: "marquee 14s linear infinite",
        eq: "eq 0.7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
