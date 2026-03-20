import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "3rem",
      screens: {
        "2xl": "1600px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },

      /* ======================
         TYPOGRAPHY SCALE
      ======================= */
      fontSize: {
        hero: ["4rem", { lineHeight: "1.1" }],
        section: ["2.5rem", { lineHeight: "1.2" }],
        luxury: ["1.125rem", { lineHeight: "1.8" }],
      },

      letterSpacing: {
        luxury: "0.25em",
        widePlus: "0.15em",
      },

      /* ======================
         COLORS
      ======================= */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          dark: "hsl(var(--gold-dark))",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      /* ======================
         SHADOW SYSTEM
      ======================= */
      boxShadow: {
        luxury: "0 25px 50px -12px rgba(0,0,0,0.25)",
        soft: "0 10px 30px rgba(0,0,0,0.08)",
      },

      /* ======================
         RADIUS
      ======================= */
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      /* ======================
         ANIMATIONS
      ======================= */
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slowZoom: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
      },

      animation: {
        fadeUp: "fadeUp 0.8s ease forwards",
        fadeIn: "fadeIn 0.6s ease forwards",
        slowZoom: "slowZoom 12s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;