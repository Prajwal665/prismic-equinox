/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a1128',
          800: '#001f54',
        },
        police: '#001f54',
        emergency: '#d80032',
      },
    },
  },
  plugins: [],
}
