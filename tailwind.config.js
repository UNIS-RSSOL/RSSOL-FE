const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.jsx", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        Pretendard: ["Pretendard", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        "slide-up": {
          "0%": {
            transform: "translateY(100%) translateX(-50%)",
            opacity: 0,
          },
          "100%": {
            transform: "translateY(0) translateX(-50%)",
            opacity: 1,
          },
        },
      },
      animation: {
        "slide-up": "slide-up 1.0s ease-out forwards",
        "slide-down": "slide-down 1.0s ease-out forwards",
      },
    },
  },
  plugins: [],
};
