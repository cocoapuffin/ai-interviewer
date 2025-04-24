const config = {
  plugins: ["@tailwindcss/postcss"],
};

module.exports = {
  content: ['./src/**/*.{html,js}'], // Update with your content paths
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-animate'), // Ensure this line is included
  ],
};

export default config;
