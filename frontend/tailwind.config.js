/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05040a",
          900: "#0a0812",
          800: "#120f1d",
          700: "#1b1729",
          600: "#272138",
        },
        chakra: {
          200: "#ffc2cd",
          300: "#ff8fa3",
          400: "#ff4d6d",
          500: "#ff1f4b",
          600: "#e0003a",
          700: "#a3002a",
        },
        spirit: "#7cf7ff",
      },
      fontFamily: {
        display: ['"Unbounded"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        jp: ['"Noto Serif JP"', "serif"],
      },
      boxShadow: {
        chakra: "0 0 0 1px rgba(255,31,75,.35), 0 30px 120px -20px rgba(255,31,75,.5)",
        glow: "0 0 40px rgba(255,31,75,.55)",
      },
      keyframes: {
        spin3: { to: { transform: "rotate(360deg)" } },
        spinrev: { to: { transform: "rotate(-360deg)" } },
        pulsering: {
          "0%": { transform: "scale(.8)", opacity: ".8" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        glitch: {
          "0%,100%": { clipPath: "inset(0 0 0 0)", transform: "translate(0)" },
          "20%": { clipPath: "inset(10% 0 60% 0)", transform: "translate(-3px,1px)" },
          "40%": { clipPath: "inset(50% 0 20% 0)", transform: "translate(3px,-1px)" },
          "60%": { clipPath: "inset(30% 0 40% 0)", transform: "translate(-2px,2px)" },
          "80%": { clipPath: "inset(70% 0 5% 0)", transform: "translate(2px,-2px)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        spin3: "spin3 12s linear infinite",
        spinfast: "spin3 2.4s linear infinite",
        spinrev: "spinrev 18s linear infinite",
        pulsering: "pulsering 2.4s ease-out infinite",
        scan: "scan 2.4s linear infinite",
        glitch: "glitch 2.8s steps(1) infinite",
        rise: "rise .6s cubic-bezier(.2,.8,.2,1) both",
        marquee: "marquee 32s linear infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
