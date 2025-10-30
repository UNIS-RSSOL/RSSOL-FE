const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.jsx", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["AppleNeo", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
