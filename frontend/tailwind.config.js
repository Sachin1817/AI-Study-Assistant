/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables toggleable dark mode support
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#030712',
          deep: '#0b0f19',
          light: '#f9fafb',
          cardDark: 'rgba(17, 24, 39, 0.7)',
          cardLight: 'rgba(255, 255, 255, 0.8)',
          accent: '#8b5cf6', // Violet
          accentHover: '#7c3aed',
          teal: '#14b8a6', // Teal details
          success: '#10b981', // Emerald
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
