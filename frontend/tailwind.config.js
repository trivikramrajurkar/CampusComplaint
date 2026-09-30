/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec6ff',
          400: '#59a6ff',
          500: '#3385fd',
          600: '#1c66f1',
          700: '#1551de',
          800: '#1843b4',
          900: '#1a3c8e',
        },
      },
    },
  },
  plugins: [],
};
