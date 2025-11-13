/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      primary: "#3Bcc3d",
      white: "#ffffff",
    },
    screens: {
      desktop: { min: "1500px" },
      mobile: { max: "800px" },
    },
  },
  plugins: [],
};
