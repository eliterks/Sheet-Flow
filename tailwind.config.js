/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#646CFF',
          foreground: '#FFFFFF',
        },
        background: {
          light: '#FFFFFF',
          dark: '#0B0E14',
        },
        muted: {
          light: '#F3F4F6',
          dark: '#1F2937',
        },
      },
    },
  },
  plugins: [],
}
