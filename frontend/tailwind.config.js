/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 颜色走 CSS 变量（index.css），深色 / 浅色主题共用同一套类名；white 即前景色
        white: v("fg"),
        snow: "#ffffff",
        ink: {
          950: v("ink-950"),
          900: v("ink-900"),
          800: v("ink-800"),
          700: v("ink-700"),
          600: v("ink-600"),
        },
        chakra: {
          200: v("chakra-200"),
          300: v("chakra-300"),
          400: v("chakra-400"),
          500: v("chakra-500"),
          600: v("chakra-600"),
          700: v("chakra-700"),
        },
        spirit: v("spirit"),
      },
      fontFamily: {
        display: ['"Unbounded"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        jp: ['"Noto Serif JP"', "serif"],
      },
      boxShadow: {
        chakra: "0 40px 100px -40px rgb(var(--chakra-500) / .35)",
        glow: "0 0 32px rgb(var(--chakra-500) / .5)",
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
