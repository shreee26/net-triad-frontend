// postcss.config.js
export default {
  plugins: {
    // This plugin correctly integrates Tailwind CSS v4 with PostCSS.
    // It will automatically read the 'content' configuration from tailwind.config.js.
    '@tailwindcss/postcss': {},
    // Autoprefixer is crucial for adding vendor prefixes to your CSS properties.
    autoprefixer: {},
  },
}
