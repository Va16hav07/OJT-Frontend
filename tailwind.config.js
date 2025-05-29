/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D2C85',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Inknut Antiqua', 'serif'],
      }
    },
  },
  plugins: [],
}

