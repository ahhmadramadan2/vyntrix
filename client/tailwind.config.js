/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eef1ff",
          100: "#dde3ff",
          400: "#7b8fff",
          500: "#4f6ef7",
          600: "#3d5ce8",
          700: "#2d4ad4",
          900: "#1a2d8f",
        },
        dark: {
          700: "#252838",
          800: "#1a1d2e",
          900: "#0d0f1a",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(79,110,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,247,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}