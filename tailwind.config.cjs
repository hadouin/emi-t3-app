/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4A86E8",
      },
      fontFamily: {
        sans: ["archia", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
