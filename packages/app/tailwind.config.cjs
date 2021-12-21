const config = {
  mode: "jit",
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "rgb(0, 10, 114)",
          100: "rgb(8, 18, 122)",
          200: "rgb(18, 28, 132)",
          300: "rgb(28, 38, 142)",
          400: "rgb(38, 48, 152)",
          500: "rgb(48, 58, 162)",
          600: "rgb(58, 68, 172)",
          700: "rgb(68, 78, 182)",
          800: "rgb(78, 88, 192)",
          900: "rgb(88, 98, 202)",
          DEFAULT: "rgb(41, 51, 155)"
        },
        secondary: {
          50: "rgb(32, 0, 104)",
          100: "rgb(44, 12, 116)",
          200: "rgb(56, 24, 128)",
          300: "rgb(68, 36, 140)",
          400: "rgb(80, 48, 152)",
          500: "rgb(92, 60, 164)",
          600: "rgb(104, 72, 176)",
          700: "rgb(116, 84, 188)",
          800: "rgb(128, 96, 200)",
          900: "rgb(140, 108, 212)",
          DEFAULT: "rgb(50, 18, 122)"
        }
      }
    }
  },

  plugins: []
};

module.exports = config;