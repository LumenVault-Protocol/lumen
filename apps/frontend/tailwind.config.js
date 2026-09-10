/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          bg: 'rgb(var(--ov-bg) / <alpha-value>)',
          card: 'rgb(var(--ov-card) / <alpha-value>)',
          border: 'rgb(var(--ov-border) / <alpha-value>)',
          surface: 'rgb(var(--ov-surface) / <alpha-value>)',
        },
        stellar: {
          blue: '#0808db',
          cyan: '#00c4ff',
          purple: '#7b61ff',
        },
        chain: {
          stellar: '#0808db',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
