/** @type {import('tailwindcss').Config} */
const { createThemes } = require('tw-colors');
const { themes } = require('./bump');
const fontFamily = require('tailwindcss/defaultTheme').fontFamily;

module.exports = {
  content: ["./views/**/*.ejs", "./src/**/*.ts"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', ...fontFamily.sans],
        body: ['var(--font-body)', ...fontFamily.mono],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    createThemes(themes, {
      produceCssVariable: (colorName) => `--rtwc-${colorName}`,
      defaultTheme: 'light',
    }),
  ],
};
