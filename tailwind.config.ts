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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Warm terracotta accent
        accent: {
          DEFAULT: "#C2562F",
          50: "#FBF1EC",
          100: "#F6DDD1",
          200: "#EEBCA6",
          400: "#D97A52",
          600: "#A8471F",
          700: "#8A3A18",
          soft: "#F3E2DA",
        },
        // Repurposed as the warm neutral / text ramp (greys, not green)
        forest: {
          DEFAULT: "#57534D",
          50: "#F7F5F1",
          100: "#ECE8E1",
          200: "#DCD6CC",
          300: "#BDB6AA",
          400: "#8A857D",
          500: "#6F6A63",
          600: "#57534D",
          700: "#3A3733",
          800: "#2A2825",
          900: "#1C1B19",
          950: "#141312",
        },
        // Near-black warm ink (text + dark sections)
        ink: {
          DEFAULT: "#1C1B19",
          700: "#2A2825",
          800: "#1C1B19",
          900: "#141312",
        },
        // Surfaces: white + warm off-whites
        paper: {
          DEFAULT: "#FFFFFF",
          50: "#FFFFFF",
          100: "#FAF7F3",
          200: "#F1ECE4",
          300: "#E6DCCD",
        },
        cream: {
          DEFAULT: "#FAF7F3",
          50: "#FFFFFF",
          100: "#FAF7F3",
          200: "#F1ECE4",
          300: "#E2DACD",
        },
        gold: {
          DEFAULT: "#B8955A",
          light: "#D4B07A",
          dark: "#9A7B43",
        },
      },
      fontFamily: {
        // Cormorant Garamond — display & serif headings
        display: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        // DM Sans — body, UI, labels
        sans: ["var(--font-sans)", "DM Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "Courier New", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.02em",
        ultra: "0.18em",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.375rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.375rem",
      },
      boxShadow: {
        soft: "0 1px 0 rgba(28,27,25,0.04), 0 18px 40px -32px rgba(28,27,25,0.45)",
        lift: "0 30px 55px -32px rgba(28,27,25,0.45)",
        float: "0 14px 30px -18px rgba(28,27,25,0.3)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "hero-zoom": "hero-zoom 24s ease-in-out infinite alternate",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "hero-zoom": {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
