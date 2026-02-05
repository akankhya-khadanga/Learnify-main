import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // MODERN DARK THEME - New Color Palette
        neon: {
          DEFAULT: '#DAFD78', // Primary neon lime
          50: '#F8FEE8',
          100: '#F1FDD1',
          200: '#E8FBA8',
          300: '#DAFD78', // Main accent
          400: '#C5E866',
          500: '#A8C94D',
          600: '#8AAA34',
          700: '#6D8B1B',
          800: '#4F6C02',
          900: '#324D00',
        },
        cosmic: {
          DEFAULT: '#0C0E17', // Main dark background
          50: '#E8E9EC',
          100: '#D1D3D9',
          200: '#A3A7B3',
          300: '#757B8D',
          400: '#474F67',
          500: '#171B21', // Primary panels
          600: '#0C0E17', // Main bg
          700: '#080A10',
          800: '#04050A',
          900: '#020205',
        },
        purple: {
          DEFAULT: '#6C5BA6', // Purple accent
          50: '#F0EDF7',
          100: '#E1DBEF',
          200: '#C3B7DF',
          300: '#A593CF',
          400: '#876FBF',
          500: '#6C5BA6',
          600: '#574A86',
          700: '#423866',
          800: '#2D2746',
          900: '#181526',
        },
        // Legacy colors mapped to new theme
        gold: {
          DEFAULT: '#DAFD78',
          50: '#F8FEE8',
          100: '#F1FDD1',
          200: '#E8FBA8',
          300: '#DAFD78',
          400: '#C5E866',
          500: '#A8C94D',
          600: '#8AAA34',
          700: '#6D8B1B',
          800: '#4F6C02',
          900: '#324D00',
        },
        pink: {
          DEFAULT: '#6C5BA6',
          50: '#F0EDF7',
          100: '#E1DBEF',
          200: '#C3B7DF',
          300: '#A593CF',
          400: '#876FBF',
          500: '#6C5BA6',
          600: '#574A86',
          700: '#423866',
          800: '#2D2746',
          900: '#181526',
        },
        blue: {
          DEFAULT: '#58A6FF',
          50: '#E8F4FF',
          100: '#D1E9FF',
          200: '#A3D3FF',
          300: '#8EC8FF', // Brightened for better readability
          400: '#58A6FF',
          500: '#5BA8FF', // Brightened
          600: '#4A9AFF', // Brightened
          700: '#3B8BFF', // Brightened
          800: '#2C7CFF', // Brightened
          900: '#1D6DEE', // Brightened
        },
        obsidian: {
          DEFAULT: '#1F2229',
          light: '#25272E',
          dark: '#171B21',
        },
        deepblack: '#0C0E17', // Main background
        border: '#31343B',
        input: '#1F2229',
        ring: '#DAFD78',
        background: '#0C0E17',
        foreground: '#FFFFFF',
        primary: {
          DEFAULT: '#DAFD78',
          foreground: '#0C0E17',
        },
        secondary: {
          DEFAULT: '#6C5BA6',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#F85149',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#25272E',
          foreground: '#C8CCDA', // Brighter for better readability
        },
        accent: {
          DEFAULT: '#31343B',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#3FB950',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#D29922',
          foreground: '#0C0E17',
        },
        popover: {
          DEFAULT: '#1F2229',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#171B21',
          foreground: '#FFFFFF',
        },
      },
      backgroundImage: {
        'gradient-cosmic': 'linear-gradient(135deg, #0C0E17 0%, #171B21 50%, #0C0E17 100%)',
        'gradient-accent': 'linear-gradient(135deg, #DAFD78 0%, #3FB950 100%)',
        'gradient-neon': 'linear-gradient(135deg, #DAFD78 0%, #6C5BA6 100%)',
        'gradient-purple': 'linear-gradient(135deg, #6C5BA6 0%, #58A6FF 100%)',
        'gradient-aurora': 'radial-gradient(ellipse at bottom, #1B4332 0%, #0C0E17 100%)',
      },
      boxShadow: {
        'brutal': '6px 6px 0px rgba(0, 0, 0, 0.5)',
        'heavy': '5px 5px 0px rgba(0, 0, 0, 0.4)',
        'medium': '3px 3px 0px rgba(0, 0, 0, 0.3)',
        'subtle': '2px 2px 0px rgba(0, 0, 0, 0.2)',
        // Soft glow shadows for buttons
        'neon': '0 0 20px rgba(218, 253, 120, 0.3)',
        'neon-lg': '0 0 30px rgba(218, 253, 120, 0.4)',
        'purple-glow': '0 0 20px rgba(108, 91, 166, 0.3)',
        'cyan-glow': '0 0 20px rgba(88, 166, 255, 0.3)',
        'gold-brutal': '4px 4px 0px rgba(218, 253, 120, 0.2)',
        'pink-brutal': '4px 4px 0px rgba(108, 91, 166, 0.2)',
        'gold-heavy': '3px 3px 0px rgba(218, 253, 120, 0.15)',
        'pink-heavy': '3px 3px 0px rgba(108, 91, 166, 0.15)',
        'gold-medium': '2px 2px 0px rgba(218, 253, 120, 0.1)',
        'pink-medium': '2px 2px 0px rgba(108, 91, 166, 0.1)',
        'glow-primary': '0 4px 20px rgba(218, 253, 120, 0.25)',
        'glow-accent': '0 4px 20px rgba(108, 91, 166, 0.25)',
        'card-glow': '0 4px 30px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
