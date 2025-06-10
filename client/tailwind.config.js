/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        logo: ["Anton", "sans-serif"],
      },
      colors: {
        yellowCustom: "#f8cd4c",
        greenCustom: "#148726",
        textBlack: "#000000",
      },
    },
  },
  plugins: [],
};