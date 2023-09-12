module.exports = {
  mode: "jit",
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-black": "#003365",
        "primary-green": "#28A7A9",
        "secondary-green": "#00BC9A",
        "secondary-green-light": "#00D9B2",
        "primary-orange": "#f97316",
        "primary-dark-blue": "#051655",
        "secondary-dark-blue": "#09418c",
        "primary-light-blue": "#0d6ac2",
        "secondary-light-blue": "#0d6ac2",
        "primary-dark-gray": "#545c7f",
        "secondary-dark-gray": "#667595",
        "primary-black-blue": "#193876",
        "primary-yellow": "#EFBD3C",
        "primary-black-gray":"#323232",
        broker: {
          blue: "#3065E3",
          grey: "#384150",
          "grey-2": "#E9EAEE",
          "grey-3": "#707070",
        },
        "dialog-black": "rgba(0,0,0,0.5)",
      },
      boxShadow: {
        "pay-wallet": "0px 4px 4px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
