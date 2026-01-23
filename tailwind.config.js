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
      red: "#ff0000",
      incomings: "#FFE875",
      exits: "#FF7575",
      green: "#75FF7C",
      neutral: "#FFCA75",
    },
    screens: {
      desktop: { min: "1500px" },
      mobile: { max: "800px" },
    },
  },
  plugins: [],
};
