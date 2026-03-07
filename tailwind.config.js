/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      primary: "#3Bcc3d",
      "primary-red": "#cc3b3b",
      white: "#ffffff",
      black: "#000000",
      gray: "#cccccc",
      lightgray: "#f4f4f4",
      darkgray: "#818181",
      darkgray2: "#262626",
      backdrop: "rgba(0, 0, 0, 0.5)",
      "success-popup": "#007d02",
      "warning-popup": "#daae00",
      "error-popup": "#ae0000",
      blue: "#003e8f",
      "dark-blue": "#2885ff",
    },
    screens: {
      desktop: { min: "1500px" },
      mobile: { max: "800px" },
    },
  },
  plugins: [],
};
