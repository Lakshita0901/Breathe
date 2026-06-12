/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        breathe: {
          green: '#1D9E75',
          'green-light': '#2DB88A',
          'green-dark': '#178A63',
          blue: '#378ADD',
          'blue-light': '#5AA1EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
